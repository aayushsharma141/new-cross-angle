const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Logging in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'sharma1.aayu@gmail.com',
    password: 'cross1@AS',
  });

  if (authError) {
    console.error("Auth Error:", authError.message);
    return;
  }
  console.log("Logged in successfully:", authData.user.email);

  const reviews = [
    {
      author_name: "Subham Kumar",
      author_role: "Client",
      content: "Thanks. Dear cross angle interior, Jamshedpur. Cross angle interior is one of the best interior design firm in Jamshedpur. All staff and workers are very honest and punctual. They have delivered my home before time. Quality of material is very premium.",
      rating: 5,
      active: true,
      display_order: 100
    },
    {
      author_name: "Kk painting Kishan kolkata painting",
      author_role: "Client",
      content: "Crossangle interiors is really good doing nice interior designing work, also giving more suggestions that fit for your required interior design, on time delivery good service.. We have done best painting work for him...",
      rating: 5,
      active: true,
      display_order: 101
    }
  ];

  for (const review of reviews) {
    console.log(`Inserting review for ${review.author_name}...`);
    const { data, error } = await supabase
      .from('testimonials')
      .insert(review);

    if (error) {
      console.error(`Error inserting ${review.author_name}:`, error.message);
    } else {
      console.log(`Successfully inserted ${review.author_name}`);
    }
  }
}

main();
