import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://iuuivmwqodefdrrrewol.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dWl2bXdxb2RlZmRycnJld29sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI4ODk2NCwiZXhwIjoyMDgyODY0OTY0fQ.DbvyfigJo7s4MAKWWQerWjSAiJqmkT79YI3AP-C38Yw";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const email = "testadmin@example.com";
  const password = "TestAdminPassword123!";
  const targetRole = "super_admin";

  console.log("Creating user...");
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userError) {
    if (userError.message.includes('already exists') || userError.message.includes('already been registered')) {
      console.log('User already exists, updating role...');
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const user = existingUser.users.find(u => u.email === email);
      
      if (user) {
        await supabase.from('user_roles').upsert({ user_id: user.id, role: targetRole }, { onConflict: 'user_id' });
        console.log(`Role updated to ${targetRole} for existing user.`);
      }
    } else {
      console.error("Error creating user:", userError);
    }
  } else {
    console.log("User created:", userData.user.id);
    const { error: roleError } = await supabase.from('user_roles').insert({ user_id: userData.user.id, role: targetRole });
    if (roleError) {
       console.error("Error setting role:", roleError);
    } else {
       console.log(`Role set to ${targetRole}`);
    }
  }
}

main().catch(console.error);
