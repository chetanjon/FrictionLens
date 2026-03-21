/**
 * Run pending migrations against your Supabase database.
 * Usage: npx tsx scripts/migrate.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function migrate() {
  console.log("Running migrations...\n");

  // We can't run DDL via PostgREST, so we create a temporary RPC function
  // using supabase-js, then call it, then drop it.

  const migrationSQL = `
    ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_platform_check;
    ALTER TABLE analyses ADD CONSTRAINT analyses_platform_check CHECK (platform IN ('ios', 'android', 'both', 'unknown'));
    ALTER TABLE analyses ADD COLUMN IF NOT EXISTS results jsonb;
    ALTER TABLE analyses ADD COLUMN IF NOT EXISTS competitors jsonb;
    ALTER TABLE analyses ADD COLUMN IF NOT EXISTS completed_at timestamptz;
    ALTER TABLE analyses ADD COLUMN IF NOT EXISTS release_impact jsonb;
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS churn_phrases jsonb;
  `;

  // Try using the SQL editor endpoint (requires service role)
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_migration`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (res.status === 404) {
    console.log("Creating migration function...");

    // Create the function via PostgREST isn't possible
    // Instead, output the SQL for the user to run manually
    console.log("\n⚠️  Cannot run DDL via REST API.");
    console.log("Please run the following SQL in your Supabase SQL Editor:");
    console.log(`https://supabase.com/dashboard/project/${supabaseUrl.replace("https://", "").replace(".supabase.co", "")}/sql/new\n`);
    console.log("─".repeat(60));
    console.log(migrationSQL);
    console.log("─".repeat(60));
    return;
  }

  console.log("Migration complete!");
}

migrate().catch(console.error);
