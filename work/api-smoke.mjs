import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const authorities = require("../api/authorities.js");
const analyze = require("../api/analyze.js");
const demoStatus = require("../api/demo-status.js");
const health = require("../api/health.js");
const chat = require("../api/chat.js");

function invoke(handler, { method = "GET", query = {}, body = {} } = {}) {
  return new Promise((resolve, reject) => {
    const response = {
      headers: {},
      setHeader(key, value) { this.headers[key] = value; },
      status(code) { this.statusCode = code; return this; },
      json(payload) { resolve({ status: this.statusCode, payload, headers: this.headers }); },
    };
    try {
      const result = handler({ method, query, body }, response);
      if (result && typeof result.catch === "function") result.catch(reject);
    } catch (error) { reject(error); }
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

const chatStatusResult = await invoke(chat, { method: "GET" });
if (chatStatusResult.status !== 200 || typeof chatStatusResult.payload.configured !== "boolean")
  throw new Error("Chat status check did not report a configured flag");

const chatMethodResult = await invoke(chat, { method: "DELETE" });
if (chatMethodResult.status !== 405) throw new Error("Chat endpoint did not reject unsupported methods");

const chatEmptyResult = await invoke(chat, { method: "POST", body: { message: "  " } });
if (chatEmptyResult.status !== 400) throw new Error("Chat endpoint accepted an empty question");

delete process.env.GROQ_API_KEY;
const chatUnconfiguredResult = await invoke(chat, { method: "POST", body: { message: "How do I file a request?" } });
if (chatUnconfiguredResult.status !== 501 || chatUnconfiguredResult.payload.code !== "not_configured") throw new Error("Chat endpoint should report a clear 'not configured' state without a key");

const originalFetch = globalThis.fetch;
let capturedRequest = null;
globalThis.fetch = async (url, options) => {
  capturedRequest = { url, options };
  return {
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: "Reply from the mocked model." } }] }),
  };
};
process.env.GROQ_API_KEY = "test-key-not-real";
const chatOkResult = await invoke(chat, { method: "POST", body: { message: "How do I file a request?", lang: "hi", history: [{ role: "user", content: "hi" }, { role: "assistant", content: "hello" }] } });
globalThis.fetch = originalFetch;
delete process.env.GROQ_API_KEY;
if (chatOkResult.status !== 200 || chatOkResult.payload.reply !== "Reply from the mocked model." || chatOkResult.payload.privacy !== "not-stored") throw new Error("Chat endpoint did not return the model's reply");
if (!capturedRequest || capturedRequest.options.headers.Authorization !== "Bearer test-key-not-real") throw new Error("Chat endpoint did not send the configured API key");
if (capturedRequest.url !== "https://api.groq.com/openai/v1/chat/completions") throw new Error("Chat endpoint did not call the Groq chat completions endpoint");
const sentBody = JSON.parse(capturedRequest.options.body);
if (!sentBody.messages[0].content.includes("Hindi")) throw new Error("Chat endpoint did not instruct the model to reply in the requested language");
if (sentBody.messages.length !== 4 || sentBody.messages[2].role !== "assistant") throw new Error("Chat endpoint did not preserve prior assistant turns for Groq");

process.env.GROQ_API_KEY = "test-key-not-real";
globalThis.fetch = async (url, options) => {
  capturedRequest = { url, options };
  return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "English then Hindi." } }] }) };
};
const chatOtherLangResult = await invoke(chat, { method: "POST", body: { message: "How do I file a request?", lang: "ta" } });
globalThis.fetch = originalFetch;
delete process.env.GROQ_API_KEY;
if (chatOtherLangResult.status !== 200) throw new Error("Chat endpoint failed for a language outside English/Hindi");
const otherLangPrompt = JSON.parse(capturedRequest.options.body).messages[0].content;
if (!otherLangPrompt.includes("English first") || !otherLangPrompt.includes("Hindi"))
  throw new Error("Chat endpoint did not instruct a bilingual English-then-Hindi reply for a language it doesn't natively support");
if (!otherLangPrompt.includes("Tamil"))
  throw new Error("Chat endpoint did not mention the visitor's actual interface language for context");

console.log("API smoke passed: health/privacy, authority matching, State routing, request analysis, demo-status boundary, and Groq chat assistant (unconfigured + mocked-model + bilingual-fallback-language paths).");
