import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: './apps/web/.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const event = "workspace.commitment.locked";
  const properties = {
    leadId: "9f644f1a-8fe9-40de-ae84-52cfe987ef35",
    commitmentId: "test-commitment-123",
    revisionId: "test-revision-123",
    timeToDecisionMs: 12000,
    genomeVersion: "1.0",
    workspaceVersion: "1.0",
    activeRoom: "during",
    selectedEvidence: ["Market Comparable 1"],
    selectedConstraints: ["Budget"],
    selectedPriorities: ["Aesthetics"],
    designerConfidence: 85,
    confidenceDrivers: ["Evidence"],
    evidenceAvailable: 10,
    evidenceViewed: 4,
    evidenceUsed: 2,
    dqiAlgorithmVersion: "1.0",
    dqiStage: "provisional",
    dqiConfidence: "MEDIUM"
  };

  const enrichedPayload = {
    ...properties,
    timestamp: new Date().toISOString(),
    eventVersion: 1,
    schemaVersion: "2026-07",
  };

  const { data, error } = await supabase.from("analytics_events").insert({
    event_type: event,
    payload: enrichedPayload,
    user_id: undefined,
  });

  if (error) {
    console.error("FAILED to insert:", error);
    process.exit(1);
  } else {
    console.log("SUCCESSFULLY inserted analytics_event!");
  }
}

run();
