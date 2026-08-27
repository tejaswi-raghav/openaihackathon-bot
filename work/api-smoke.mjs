import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const authorities = require("../api/authorities.js");
const analyze = require("../api/analyze.js");
const demoStatus = require("../api/demo-status.js");
const health = require("../api/health.js");

function invoke(handler, { method = "GET", query = {}, body = {} } = {}) {
  return new Promise((resolve, reject) => {
    const response = {
      headers: {},
      setHeader(key, value) { this.headers[key] = value; },
      status(code) { this.statusCode = code; return this; },
      json(payload) { resolve({ status: this.statusCode, payload, headers: this.headers }); },
    };
    try { handler({ method, query, body }, response); } catch (error) { reject(error); }
  });
}

const healthResult = await invoke(health);
if (healthResult.status !== 200 || !healthResult.payload.ok || healthResult.payload.privacy !== "no-request-storage") throw new Error("Health privacy contract failed");

const matchResult = await invoke(authorities, { query: { q: "train station", level: "central" } });
if (matchResult.status !== 200 || !matchResult.payload.matches.some((item) => item.name === "Ministry of Railways")) throw new Error("Authority routing failed");

const stateResult = await invoke(authorities, { query: { q: "Kerala", level: "state" } });
if (!stateResult.payload.matches.includes("Kerala") || !stateResult.payload.officialDirectory.includes("dopt.gov.in")) throw new Error("State directory routing failed");

const qualityResult = await invoke(analyze, { method: "POST", body: { text: "Please provide certified copies of the road repair sanction order and amount spent in Rampur village from April 2024 to March 2025." } });
if (qualityResult.status !== 200 || qualityResult.payload.score < 80 || qualityResult.payload.privacy !== "processed-without-storage") throw new Error("Request analysis failed");

const statusResult = await invoke(demoStatus, { query: { reference: "RTI-DEMO-2026-ABC123" } });
if (statusResult.status !== 200 || statusResult.payload.governmentSubmission !== false) throw new Error("Demo status boundary failed");

console.log("API smoke passed: health/privacy, authority matching, State routing, request analysis, and demo-status boundary.");
