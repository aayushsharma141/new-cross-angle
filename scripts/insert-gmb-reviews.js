import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iuuivmwqodefdrrrewol.supabase.co';
const supabaseKey = 'sb_publishable_nFloBfKOfoRMtDV0K90b6A_oVxQXUfQ';
const supabase = createClient(supabaseUrl, supabaseKey);

const reviews = [
  {
    author_name: "Amit Kumar",
    rating: 5,
    content: "We hired Crossangle for our new apartment interiors and it was a wonderful experience. Ayush and team handled everything very professionally. They listened to our requirements patiently and suggested practical solutions. The material quality used is top notch and the final output looks exactly like the 3D renders. Highly recommended for hassle-free execution.",
    active: true,
    author_role: "Homeowner"
  },
  {
    author_name: "Priya Sharma",
    rating: 5,
    content: "Excellent work done by the Crossangle team. I wanted a modern minimalist look for my home and they delivered exactly that. Their attention to detail and finish is commendable. They also helped in selecting the right decor items. The project was completed within the committed timeline. Very happy with the results.",
    active: true,
    author_role: "Homeowner"
  },
  {
    author_name: "Dheeraj K",
    rating: 5,
    content: "I am a happy customer of Crossangle. I was really impressed with their team, the quality of the project and how professional they were. They were on time, in budget and had amazing ideas about what will look good. I would recommend Crossangle for any interior design project.",
    active: true,
    author_role: "Homeowner"
  },
  {
    author_name: "Ravi Singh",
    rating: 4,
    content: "Good interior designing firm in Jamshedpur. We got our office designed by them. The space planning was excellent and they managed to fit in all our requirements in the limited space. Only small issue was a slight delay in handover by a week, but the quality of work compensated for it. Good team to work with.",
    active: true,
    author_role: "Business Owner"
  },
  {
    author_name: "Neha Gupta",
    rating: 5,
    content: "They transformed our old house into a beautiful modern home. The color combinations and lighting design suggested by them made a huge difference. The carpentry work is very neat. They are transparent about pricing and there were no hidden charges. Thank you Crossangle for the great work.",
    active: true,
    author_role: "Homeowner"
  }
];

async function insertReviews() {
  const email = "sharma1.aayu@gmail.com";
  const password = "cross1@AS";

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error("Auth error:", authError.message);
    return;
  }

  console.log("Logged in as admin.");
  
  const { data, error } = await supabase.from('testimonials').insert(reviews).select();
  if (error) console.error("Error inserting reviews:", error);
  else console.log("Reviews inserted successfully:", data.length);
}

insertReviews();
