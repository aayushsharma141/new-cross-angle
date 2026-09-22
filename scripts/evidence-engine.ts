import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const EVIDENCE_DIR = path.resolve(process.cwd(), "docs/evidence");
const MANIFEST_PATH = path.join(EVIDENCE_DIR, "manifest.json");
const SHA256SUMS_PATH = path.join(EVIDENCE_DIR, "SHA256SUMS");
const INDEX_PATH = path.join(EVIDENCE_DIR, "index.json");
const SIGNATURE_PATH = path.join(EVIDENCE_DIR, "signature.json");
const PRIVATE_KEY_PATH = path.join(EVIDENCE_DIR, "private.key");
const PUBLIC_KEY_PATH = path.join(EVIDENCE_DIR, "public.key");

function calculateSHA256(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

export function ensureEd25519Keys(): { privateKey: string; publicKey: string } {
  if (process.env.EVIDENCE_PRIVATE_KEY && process.env.EVIDENCE_PUBLIC_KEY) {
    return {
      privateKey: process.env.EVIDENCE_PRIVATE_KEY,
      publicKey: process.env.EVIDENCE_PUBLIC_KEY,
    };
  }

  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }

  if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
    return {
      privateKey: fs.readFileSync(PRIVATE_KEY_PATH, "utf-8"),
      publicKey: fs.readFileSync(PUBLIC_KEY_PATH, "utf-8"),
    };
  }

  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519", {
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });

  fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);
  return { privateKey, publicKey };
}

export function signData(data: string): string {
  const { privateKey } = ensureEd25519Keys();
  const signature = crypto.sign(null, Buffer.from(data), privateKey);
  return signature.toString("hex");
}

export function verifySignature(data: string, signatureHex: string): boolean {
  const { publicKey } = ensureEd25519Keys();
  try {
    return crypto.verify(null, Buffer.from(data), publicKey, Buffer.from(signatureHex, "hex"));
  } catch (_e) {
    return false;
  }
}

export function validateEvidenceSchema(content: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!content.schemaVersion || content.schemaVersion !== "1.0") {
    errors.push("Missing or invalid schemaVersion (expected '1.0')");
  }
  if (!content.evidenceId || typeof content.evidenceId !== "string") {
    errors.push("Missing or invalid evidenceId");
  }
  if (!content.generator || typeof content.generator !== "string") {
    errors.push("Missing or invalid generator");
  }
  if (!content.timestamp || isNaN(Date.parse(content.timestamp))) {
    errors.push("Missing or invalid ISO timestamp");
  }
  if (!content.provenance || typeof content.provenance !== "object") {
    errors.push("Missing or invalid provenance object");
  } else {
    const p = content.provenance;
    if (!p.gitSha) errors.push("provenance missing gitSha");
    if (!p.nodeVersion) errors.push("provenance missing nodeVersion");
  }
  if (!content.status || !["PASSED", "FAILED"].includes(content.status)) {
    errors.push("Missing or invalid status (PASSED/FAILED)");
  }
  if (!content.results || typeof content.results !== "object") {
    errors.push("Missing or invalid results object");
  }

  return { valid: errors.length === 0, errors };
}

export function validateAllEvidenceSchemas(): boolean {
  console.log("🔍 Enforcing JSON Schema Gate (v1.0 Validation)...");
  const files = fs.readdirSync(EVIDENCE_DIR).filter((f) => f.endsWith(".json") && f !== "manifest.json" && f !== "index.json" && f !== "signature.json");
  let validCount = 0;
  let invalidCount = 0;

  for (const file of files) {
    const fullPath = path.join(EVIDENCE_DIR, file);
    try {
      const content = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
      const result = validateEvidenceSchema(content);
      if (result.valid) {
        validCount++;
      } else {
        console.error(`❌ INVALID SCHEMA [${file}]:`, result.errors.join(", "));
        invalidCount++;
      }
    } catch (e: any) {
      console.error(`❌ UNPARSEABLE ARTIFACT [${file}]:`, e.message);
      invalidCount++;
    }
  }

  console.log(`✅ Schema Validation complete: ${validCount} valid, ${invalidCount} invalid.`);
  return invalidCount === 0;
}

export function buildEvidenceManifest() {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }

  const files = fs.readdirSync(EVIDENCE_DIR).filter((f) => f.endsWith(".json") && f !== "manifest.json" && f !== "index.json" && f !== "signature.json");
  const checksums: Record<string, string> = {};
  let sumsText = "";

  for (const file of files) {
    const fullPath = path.join(EVIDENCE_DIR, file);
    const sha = calculateSHA256(fullPath);
    checksums[file] = sha;
    sumsText += `${sha}  ${file}\n`;
  }

  const manifest = {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    generator: "antigravity-evidence-engine@1.0",
    totalArtifacts: files.length,
    checksums,
  };

  const manifestStr = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(MANIFEST_PATH, manifestStr);
  fs.writeFileSync(SHA256SUMS_PATH, sumsText);

  // Pure Ed25519 Asymmetric Signature
  const signatureHex = signData(sumsText);
  const sigPayload = {
    schemaVersion: "1.0",
    generatedAt: manifest.generatedAt,
    algorithm: "Ed25519",
    totalArtifacts: files.length,
    signature: signatureHex,
    publicKeyPath: "docs/evidence/public.key",
  };
  fs.writeFileSync(SIGNATURE_PATH, JSON.stringify(sigPayload, null, 2));

  console.log(`🔒 Manifest updated: ${Object.keys(checksums).length} artifacts hashed & signed via Ed25519 (signature.json)`);
  return manifest;
}

export function verifyCryptographicAuthenticity(): boolean {
  console.log("🔐 Verifying Evidence Registry Asymmetric Ed25519 Authenticity...");
  if (!fs.existsSync(SIGNATURE_PATH) || !fs.existsSync(SHA256SUMS_PATH)) {
    console.error("❌ signature.json or SHA256SUMS missing!");
    return false;
  }

  const sigPayload = JSON.parse(fs.readFileSync(SIGNATURE_PATH, "utf-8"));
  const sumsText = fs.readFileSync(SHA256SUMS_PATH, "utf-8");

  if (sigPayload.algorithm !== "Ed25519") {
    console.error(`💥 INVALID ALGORITHM: Expected Ed25519, got ${sigPayload.algorithm}`);
    return false;
  }

  const isValid = verifySignature(sumsText, sigPayload.signature);

  if (isValid) {
    console.log("✅ ED25519 PUBLIC KEY SIGNATURE VERIFIED: Evidence registry is authentic and untampered.");
    return true;
  } else {
    console.error("💥 ED25519 SIGNATURE MISMATCH: Evidence registry has been forged or modified!");
    return false;
  }
}

export function verifyEvidenceIntegrity() {
  console.log("🔍 Verifying Evidence Registry SHA-256 Checksums...");
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("❌ manifest.json not found! Run --index to generate.");
    return false;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  let validCount = 0;
  let invalidCount = 0;

  for (const [file, expectedHash] of Object.entries<string>(manifest.checksums)) {
    const fullPath = path.join(EVIDENCE_DIR, file);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ MISSING ARTIFACT: ${file}`);
      invalidCount++;
      continue;
    }

    const actualHash = calculateSHA256(fullPath);
    if (actualHash === expectedHash) {
      validCount++;
    } else {
      console.error(`💥 HASH MISMATCH: ${file}`);
      invalidCount++;
    }
  }

  const sigOk = verifyCryptographicAuthenticity();
  console.log(`✅ Verified ${validCount} artifacts. Invalid: ${invalidCount}`);
  return invalidCount === 0 && sigOk;
}

export function buildEvidenceIndex() {
  console.log("📊 Building Evidence Catalog Index...");
  buildEvidenceManifest();

  const files = fs.readdirSync(EVIDENCE_DIR).filter((f) => f.endsWith(".json") && f !== "manifest.json" && f !== "index.json" && f !== "signature.json");
  const entries: any[] = [];

  for (const file of files) {
    try {
      const fullPath = path.join(EVIDENCE_DIR, file);
      const content = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
      if (content.schemaVersion === "1.0") {
        entries.push({
          file,
          evidenceId: content.evidenceId,
          timestamp: content.timestamp,
          status: content.status || content.overallStatus,
          gitSha: content.provenance?.gitSha || "unknown",
          gitBranch: content.provenance?.gitBranch || "unknown",
          generator: content.generator,
          checksum: calculateSHA256(fullPath),
        });
      }
    } catch (_err) {}
  }

  const indexCatalog = {
    schemaVersion: "1.0",
    catalogUpdatedAt: new Date().toISOString(),
    totalEvidenceEntries: entries.length,
    entries,
  };

  fs.writeFileSync(INDEX_PATH, JSON.stringify(indexCatalog, null, 2));
  console.log(`📄 Evidence Index created: ${entries.length} schema v1.0 entries indexed in docs/evidence/index.json`);
  return indexCatalog;
}

export function analyzePerformanceTrends() {
  console.log("📈 Statistical EWMA & Control Limit Engine...");
  if (!fs.existsSync(INDEX_PATH)) {
    buildEvidenceIndex();
  }

  const indexData = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  const runs: any[] = [];

  for (const entry of indexData.entries) {
    const fullPath = path.join(EVIDENCE_DIR, entry.file);
    try {
      const content = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
      if (content.results?.benchmark) {
        runs.push({
          evidenceId: content.evidenceId,
          timestamp: content.timestamp,
          gitSha: content.provenance?.gitSha,
          opsPerSec: content.results.benchmark.opsPerSec,
          avgMsPerOp: content.results.benchmark.avgMsPerOp,
          heapDeltaMB: content.results.benchmark.heapDeltaMB,
        });
      }
    } catch (_e) {}
  }

  runs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (runs.length === 0) {
    console.log("ℹ No benchmark evidence found for statistical EWMA analysis.");
    return runs;
  }

  // EWMA (alpha = 0.3) Calculation
  const alpha = 0.3;
  let ewmaThroughput = runs[0].opsPerSec;
  let ewmaLatency = runs[0].avgMsPerOp;

  const throughputValues: number[] = [];
  const latencyValues: number[] = [];

  for (const r of runs) {
    throughputValues.push(r.opsPerSec);
    latencyValues.push(r.avgMsPerOp);
    ewmaThroughput = alpha * r.opsPerSec + (1 - alpha) * ewmaThroughput;
    ewmaLatency = alpha * r.avgMsPerOp + (1 - alpha) * ewmaLatency;
  }

  // Calculate Standard Deviation
  const meanThroughput = throughputValues.reduce((a, b) => a + b, 0) / throughputValues.length;
  const stdDevThroughput = Math.sqrt(throughputValues.reduce((sq, n) => sq + Math.pow(n - meanThroughput, 2), 0) / throughputValues.length);

  const meanLatency = latencyValues.reduce((a, b) => a + b, 0) / latencyValues.length;
  const stdDevLatency = Math.sqrt(latencyValues.reduce((sq, n) => sq + Math.pow(n - meanLatency, 2), 0) / latencyValues.length);

  const uclThroughput = (meanThroughput + 2 * stdDevThroughput).toFixed(2);
  const lclThroughput = Math.max(0, meanThroughput - 2 * stdDevThroughput).toFixed(2);

  const uclLatency = (meanLatency + 2 * stdDevLatency).toFixed(2);
  const lclLatency = Math.max(0, meanLatency - 2 * stdDevLatency).toFixed(2);

  console.log("\n=================================================");
  console.log("📈 STATISTICAL EWMA & 2σ CONTROL LIMIT REPORT");
  console.log("=================================================");
  console.log(`- Total Benchmark Runs:      ${runs.length}`);
  console.log(`- EWMA Throughput (α=0.3):   ${ewmaThroughput.toFixed(2)} ops/sec (Limits: ${lclThroughput} - ${uclThroughput})`);
  console.log(`- EWMA Latency (α=0.3):      ${ewmaLatency.toFixed(2)} ms/op (Limits: ${lclLatency} - ${uclLatency})\n`);

  for (let i = 0; i < runs.length; i++) {
    const r = runs[i];
    const devThroughput = Math.abs(r.opsPerSec - meanThroughput);
    const devLatency = Math.abs(r.avgMsPerOp - meanLatency);

    const isAnomaly = devThroughput > 2 * stdDevThroughput || devLatency > 2 * stdDevLatency;
    const anomalyFlag = isAnomaly ? "⚠️ 2σ CONTROL LIMIT ANOMALY" : "✅ STATISTICALLY IN-CONTROL";

    console.log(`Run [${r.evidenceId}] Git:${r.gitSha?.substring(0, 7) || "unknown"}`);
    console.log(`  Throughput: ${r.opsPerSec} ops/s`);
    console.log(`  Latency:    ${r.avgMsPerOp} ms/op`);
    console.log(`  Control:    ${anomalyFlag}\n`);
  }
  console.log("=================================================\n");

  return runs;
}

// CLI Execution Router
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes("evidence-engine")) {
  const arg = process.argv[2] || "--index";
  if (arg === "--verify") {
    const ok = verifyEvidenceIntegrity();
    process.exit(ok ? 0 : 1);
  } else if (arg === "--verify-sig") {
    const ok = verifyCryptographicAuthenticity();
    process.exit(ok ? 0 : 1);
  } else if (arg === "--validate") {
    const ok = validateAllEvidenceSchemas();
    process.exit(ok ? 0 : 1);
  } else if (arg === "--sign") {
    buildEvidenceManifest();
    verifyCryptographicAuthenticity();
  } else if (arg === "--trend") {
    analyzePerformanceTrends();
  } else {
    buildEvidenceIndex();
  }
}
