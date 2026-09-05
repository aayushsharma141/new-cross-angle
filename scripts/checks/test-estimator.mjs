import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from apps/web
dotenv.config({ path: path.resolve('apps/web/.env') });
dotenv.config({ path: path.resolve('apps/web/.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://iuuivmwqodefdrrrewol.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("Missing anon key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const formData = {
  propertyType: "Apartment",
  bhk: "3 BHK",
  area: 1500,
  stage: "Raw",
  floors: 1,
  floorNumber: 5,
  livingRooms: 1,
  bedrooms: 3,
  bathrooms: 3,
  toilets: 0,
  kitchen: 1,
  balconies: 2,
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
  budgetAmount: 5000000,
  budgetPreset: "",
  selectedService: "C3",
  executionTier: null,
  modularKitchen: true,
  wardrobes: 3,
  falseCeiling: true,
  smartHome: false,
  customFurniture: false,
  premiumLighting: false,
  startTiming: "1-3 Months",
  projectMonths: 3,
  extraVisits: 5,
  name: "Fresh Node Test",
  email: "testnode@example.com",
  phone: "0987654321"
};

async function run() {
  console.log("Invoking submit-estimate...");
  const { data, error } = await supabase.functions.invoke("submit-estimate", {
    body: {
      formData,
      // Provide dummy discoveryContext if needed, but it's optional
    }
  });

  if (error) {
    console.error("Edge function returned error:", error);
    process.exit(1);
  }

  console.log("Edge function success response:", JSON.stringify(data, null, 2));
}

run();
