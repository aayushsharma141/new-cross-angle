const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '../../.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Logging in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.PLAYWRIGHT_ADMIN_EMAIL || 'sharma1.aayu@gmail.com',
    password: process.env.PLAYWRIGHT_ADMIN_PASSWORD || 'cross1@AS',
  });

  if (authError) {
    console.error("Auth Error:", authError.message);
    return;
  }
  console.log("Logged in successfully:", authData.user.email);

  const reviews = [
    // From Testimonials.tsx
    {
      author_name: "Priya Sharma",
      author_role: "Homeowner",
      content: "Crossangle Interior transformed our home beyond our expectations. Their attention to detail and creative vision made our space truly luxurious.",
      rating: 5,
      active: true,
      city: "Jamshedpur",
      display_order: 10
    },
    {
      author_name: "Rajesh Kumar",
      author_role: "Business Owner",
      content: "The team delivered an exceptional office design that perfectly reflects our brand identity. Professional, timely, and incredibly talented.",
      rating: 5,
      active: true,
      city: "Sakchi",
      display_order: 11
    },
    {
      author_name: "Anita Desai",
      author_role: "Apartment Owner",
      content: "From concept to completion, the entire experience was seamless. They understood our vision and executed it flawlessly.",
      rating: 5,
      active: true,
      city: "Jamshedpur",
      display_order: 12
    },
    // From transformationStories.ts
    {
      author_name: "Rahul & Megha",
      author_role: "Homeowner",
      content: "CrossAngle didn't just redesign our bedroom; they completely changed how we feel when we wake up. The acoustic panelling and lighting made it a true sanctuary.",
      rating: 5,
      active: true,
      city: "Jamshedpur",
      display_order: 13
    },
    {
      author_name: "The Senguptas",
      author_role: "Homeowner",
      content: "We asked for functionality, but they delivered a masterpiece. Every drawer, every hinge feels intentional. It's the heart of our home now.",
      rating: 5,
      active: true,
      city: "Kolkata",
      display_order: 14
    },
    {
      author_name: "Vikram S.",
      author_role: "Executive",
      content: "A space that reflects authority yet feels incredibly inviting. My productivity has genuinely improved since the redesign.",
      rating: 5,
      active: true,
      city: "Jamshedpur",
      display_order: 15
    },
    // From projects.ts
    {
      author_name: "Mrs. Sharma",
      author_role: "Homeowner",
      content: "Our bedroom has become our personal retreat. The attention to detail and quality of work exceeded our expectations.",
      rating: 5,
      active: true,
      city: "Jamshedpur",
      display_order: 16
    },
    {
      author_name: "Mrs. Desai",
      author_role: "Homeowner",
      content: "The kitchen is now the heart of our home. Cooking has become a joy!",
      rating: 5,
      active: true,
      city: "Bistupur",
      display_order: 17
    },
    {
      author_name: "Vikram Singh",
      author_role: "CEO, TechStart Solutions",
      content: "Our new office has transformed how our team works. The space truly reflects our company culture.",
      rating: 5,
      active: true,
      city: "Jamshedpur",
      display_order: 18
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
