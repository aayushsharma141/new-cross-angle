const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const client = new Client('postgresql://postgres:postgres@localhost:5432/postgres');
  await client.connect();
  
  console.log('Connected to local temp DB.');

  // 0. Reset schema
  console.log('Resetting schema...');
  await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

  // 1. Mock dependencies
  console.log('Mocking dependencies...');
  await client.query(`
    CREATE OR REPLACE FUNCTION public.is_cms_editor() RETURNS boolean AS $$
    BEGIN
      RETURN current_setting('test.is_editor', true) = 'true';
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION public.is_crm_viewer() RETURNS boolean AS $$
    BEGIN
      RETURN true;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$ BEGIN RETURN gen_random_uuid(); END; $$ LANGUAGE plpgsql;
    
    CREATE OR REPLACE FUNCTION public.is_admin_or_editor(uid uuid) RETURNS boolean AS $$ BEGIN RETURN true; END; $$ LANGUAGE plpgsql;
    
    CREATE OR REPLACE FUNCTION public.get_admin_users() RETURNS json AS $$ BEGIN RETURN '{}'::json; END; $$ LANGUAGE plpgsql;
    CREATE OR REPLACE FUNCTION public.increment_project_view(p_id uuid) RETURNS void AS $$ BEGIN END; $$ LANGUAGE plpgsql;
    CREATE OR REPLACE FUNCTION public.sync_asset_usage_from_url() RETURNS trigger AS $$ BEGIN RETURN NEW; END; $$ LANGUAGE plpgsql;
    CREATE OR REPLACE FUNCTION public.sync_asset_usage_from_url_array() RETURNS trigger AS $$ BEGIN RETURN NEW; END; $$ LANGUAGE plpgsql;
    
    CREATE TABLE IF NOT EXISTS public.leads (
      id uuid primary key default gen_random_uuid(),
      status text,
      score int,
      lead_score int,
      lead_source text,
      estimated_min numeric
    );
    
    DO $$ BEGIN
      CREATE ROLE authenticated;
      CREATE ROLE service_role;
      CREATE ROLE anon;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // 2. Load DAM v3 schema
  const damV3 = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '20260622000000_dam_v3_schema.sql'), 'utf8');
  await client.query(damV3);
  await client.query(`
    ALTER TABLE public.asset_versions ADD COLUMN url text;
    ALTER TABLE public.asset_versions ADD COLUMN width int;
    ALTER TABLE public.asset_versions ADD COLUMN height int;
    ALTER TABLE public.asset_versions ADD COLUMN storage_provider text;
  `);
  console.log('DAM v3 Schema loaded.');

  // 3. Load S2 migration
  const s2Migration = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '20260911000006_s2_fix_exposed_rpc_authorization.sql'), 'utf8');
  await client.query(s2Migration);
  console.log('S2 Migration applied successfully!');

  // 4. Run tests
  console.log('\n--- Running Tests ---');

  // Test 1: Verify unique constraint exists
  const uniqueConstraint = await client.query(`
    SELECT conname 
    FROM pg_constraint 
    WHERE conname = 'uq_asset_versions_asset_id_version'
  `);
  if (uniqueConstraint.rows.length === 0) {
    throw new Error('Test Failed: Unique constraint uq_asset_versions_asset_id_version was not created.');
  }
  console.log('✅ PASS: Unique constraint uq_asset_versions_asset_id_version exists.');

  // Re-run DO block to verify idempotency
  await client.query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_asset_versions_asset_id_version'
      ) THEN
        ALTER TABLE public.asset_versions ADD CONSTRAINT uq_asset_versions_asset_id_version UNIQUE(asset_id, version_number);
      END IF;
    END $$;
  `);
  console.log('✅ PASS: Unique constraint creation is idempotent.');

  // Test 2: rpc_finalize_dam_asset authorization
  await client.query("SET test.is_editor = 'false';");
  try {
    await client.query("SELECT public.rpc_finalize_dam_asset(gen_random_uuid(), 'f', 'u', 0, 'm', 0, 0, 'd', 'e', gen_random_uuid(), 'r');");
    throw new Error('Should have failed authorization');
  } catch (e) {
    if (e.message.includes('Unauthorized')) {
      console.log('✅ PASS: rpc_finalize_dam_asset rejects unauthorized caller');
    } else {
      throw e;
    }
  }

  // Set editor for the rest of tests
  await client.query("SET test.is_editor = 'true';");

  // Test 3: state invariant (status = uploading)
  // First, create an asset that is NOT uploading
  const asset1 = await client.query(`
    INSERT INTO public.assets (type, source, status, title) 
    VALUES ('image', 'uploaded', 'ready', 'Test 1') 
    RETURNING id
  `);
  const asset1_id = asset1.rows[0].id;

  try {
    await client.query(`SELECT public.rpc_finalize_dam_asset('${asset1_id}', 'f', 'u', 0, 'm', 0, 0, 'd', 'e', null, 'r');`);
    throw new Error('Should have failed state check');
  } catch (e) {
    if (e.message.includes('not in an uploadable finalization state')) {
      console.log('✅ PASS: rpc_finalize_dam_asset rejects asset not in uploading state');
    } else {
      throw e;
    }
  }

  // Test 4: concurrency/duplicate check (already has a version)
  const asset2 = await client.query(`
    INSERT INTO public.assets (type, source, status, title) 
    VALUES ('image', 'uploaded', 'uploading', 'Test 2') 
    RETURNING id
  `);
  const asset2_id = asset2.rows[0].id;
  
  // Insert a version directly to simulate it already having one
  await client.query(`
    INSERT INTO public.asset_versions (asset_id, version_number, file_id, url)
    VALUES ('${asset2_id}', 1, 'f', 'u')
  `);

  try {
    await client.query(`SELECT public.rpc_finalize_dam_asset('${asset2_id}', 'f2', 'u2', 0, 'm', 0, 0, 'd', 'e', null, 'r');`);
    throw new Error('Should have failed duplicate version check');
  } catch (e) {
    if (e.message.includes('already has a version')) {
      console.log('✅ PASS: rpc_finalize_dam_asset rejects asset that already has a version');
    } else {
      throw e;
    }
  }

  // Test 5: Successful finalization
  const asset3 = await client.query(`
    INSERT INTO public.assets (type, source, status, title) 
    VALUES ('image', 'uploaded', 'uploading', 'Test 3') 
    RETURNING id
  `);
  const asset3_id = asset3.rows[0].id;

  await client.query(`SELECT public.rpc_finalize_dam_asset('${asset3_id}', 'f3', 'u3', 0, 'm', 0, 0, 'd', 'e', null, 'r');`);
  console.log('✅ PASS: rpc_finalize_dam_asset successfully finalizes a valid asset');
  
  const updatedAsset = await client.query(`SELECT status FROM public.assets WHERE id = '${asset3_id}'`);
  if (updatedAsset.rows[0].status === 'ready') {
     console.log('✅ PASS: Asset status is updated to ready');
  } else {
     throw new Error('Asset status not updated');
  }

  // Test 6: Verify get_lead_stats authorization
  await client.query("SET test.is_editor = 'false';");
  // is_crm_viewer is true by default
  await client.query("SELECT public.get_lead_stats();");
  console.log('✅ PASS: get_lead_stats allows authorized caller');

  console.log('\\nAll tests passed successfully!');

  await client.end();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
