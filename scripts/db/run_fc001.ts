import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { execSync } from 'child_process';

dotenv.config({ path: 'apps/web/.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

const formData = {
  propertyType: "Apartment",
  bhk: "2 BHK",
  area: 1100,
  stage: "Raw",
  floors: 1,
  floorNumber: 5,
  livingRooms: 1,
  bedrooms: 2,
  bathrooms: 2,
  toilets: 0,
  kitchen: 1,
  balconies: 1,
  hasPool: false,
  hasGarden: false,
  hasGym: false,
  hasHomeTheater: false,
  hasServantQuarters: false,
  hasCoveredParking: true,
  cabins: 0,
  conferenceRooms: 0,
  hasReception: false,
  hasPantry: false,
  hasServerRoom: false,
  hasTrainingRoom: false,
  hasLounge: false,
  renovationScope: null,
  renovationRooms: [],
  renovationPropertyType: null,
  state: "Maharashtra",
  city: "Mumbai",
  cityTier: "metro",
  budgetAmount: 3000000,
  budgetPreset: "Mid-range",
  selectedService: "Core",
  executionTier: null,
  modularKitchen: true,
  wardrobes: 2,
  falseCeiling: true,
  smartHome: false,
  customFurniture: false,
  premiumLighting: false,
  startTiming: "3-4 Months",
  projectMonths: 4,
  extraVisits: 5,
  name: "Client FC001",
  email: `client-fc001-${Date.now()}@example.com`,
  phone: "0987654321",
  bespoke_notes: "Existing plumbing remains, kitchen footprint unchanged, no structural modifications"
};

async function runFoundingCase001() {
  console.log("=== STARTING FOUNDING CASE 001 ===");
  const sessionId = uuidv4();
  const correlationId = uuidv4();

  console.log("1. Submitting estimator via Edge Function...");
  const { data: edgeResp, error: edgeErr } = await anonClient.functions.invoke("submit-estimate", {
    body: { formData }
  });

  if (edgeErr) {
    console.error("submit-estimate error:", edgeErr);
    return;
  }
  
  const leadId = edgeResp.leadId;
  console.log(`Lead Created. ID: ${leadId}`);

  console.log("2. Emitting telemetry event (contact_form_submitted)...");
  const eventPayload = {
    event_type: 'contact_form_submitted',
    payload: {
      ...formData,
      leadId,
      sessionId,
      correlationId,
      page_url: 'http://127.0.0.1:8080/estimate',
      timestamp: new Date().toISOString(),
      eventVersion: '1.0',
      schemaVersion: '1.0'
    }
  };

  const { error: eventErr } = await anonClient.from('analytics_events').insert([eventPayload]);

  if (eventErr) {
    console.error("Failed to emit telemetry:", eventErr);
    return;
  }
  console.log("Telemetry recorded successfully.");

  console.log("3. Designer locking commitment for this lead via SQL...");
  const commitId = uuidv4();
  const revisionId = uuidv4();
  
  const clientProfile = JSON.stringify(formData).replace(/'/g, "''");
  const narrativeBrief = "Straightforward 2 BHK interior modernization. Mid-range budget. Constraints verified: plumbing and kitchen footprint locked, no structural changes. Recommending core modernization package focusing on surfaces, lighting, and modular components.";

  const sql = `
    INSERT INTO workspace_commitment_revisions (
      id, commitment_id, lead_id, project_snapshot, narrative_brief, 
      is_locked, locked_at, decision_schema_version, decision_genome, workspace_state
    ) VALUES (
      '${revisionId}', '${commitId}', '${leadId}', '${clientProfile}', '${narrativeBrief}', 
      true, NOW(), '1.0', '{}'::jsonb, '{}'::jsonb
    );
  `;
  
  fs.writeFileSync('insert_fc001.sql', sql);
  
  try {
      execSync('npx supabase db query -f insert_fc001.sql --linked', { stdio: 'inherit' });
      console.log("Commitment Locked! Revision ID:", revisionId);
  } catch(e) {
      console.error("SQL Execution failed:", e.message);
  }

  console.log("=== FOUNDING CASE 001 COMPLETED ===");
  console.log(`Lead ID: ${leadId}`);
  console.log(`Commitment ID: ${commitId}`);
  console.log(`Revision ID: ${revisionId}`);
  console.log(`Correlation ID: ${correlationId}`);
}

runFoundingCase001();
