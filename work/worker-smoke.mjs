import worker from "../server/worker.mjs";

const assetResponse = await worker.fetch(new Request("https://example.test/"), {
  ASSETS: { fetch: async () => new Response("site asset", { status: 200 }) },
});
if (await assetResponse.text() !== "site asset") throw new Error("Worker did not serve site assets");

const statusResponse = await worker.fetch(new Request("https://example.test/api/chat"), {});
if (!statusResponse.ok || (await statusResponse.json()).configured !== false) throw new Error("Worker did not report its unconfigured status");

const unconfiguredResponse = await worker.fetch(new Request("https://example.test/api/chat", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "How do I file?", lang: "en" }),
}), {});
if (unconfiguredResponse.status !== 501) throw new Error("Worker accepted chat without a Groq secret");

const originalFetch = globalThis.fetch;
let groqRequest;
globalThis.fetch = async (url, options) => {
  groqRequest = { url, options };
  return { ok: true, json: async () => ({ choices: [{ message: { content: "आप आधिकारिक पोर्टल पर आवेदन करें।" } }] }) };
};
const chatResponse = await worker.fetch(new Request("https://example.test/api/chat", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: "How do I file?", lang: "hi" }),
}), { GROQ_API_KEY: "test-key", GROQ_MODEL: "qwen/qwen3.8-27b" });
globalThis.fetch = originalFetch;
const chatBody = await chatResponse.json();
if (!chatResponse.ok || !chatBody.reply.includes("आवेदन")) throw new Error("Worker did not return the Groq response");
if (groqRequest.url !== "https://api.groq.com/openai/v1/chat/completions" || groqRequest.options.headers.Authorization !== "Bearer test-key") throw new Error("Worker did not protect and forward the Groq secret correctly");
if (!JSON.parse(groqRequest.options.body).messages[0].content.includes("Hindi")) throw new Error("Worker did not request Hindi output");

console.log("Worker smoke passed: static assets, private Groq chat, and Hindi instruction.");
