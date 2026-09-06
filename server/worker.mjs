const LANG_NAMES = {
  hi: "Hindi",
  en: "English",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  ur: "Urdu",
  or: "Odia",
  as: "Assamese",
  sa: "Sanskrit",
  ks: "Kashmiri",
  ne: "Nepali",
  sd: "Sindhi",
  kok: "Konkani",
  mni: "Manipuri (Meitei)",
  brx: "Bodo",
  doi: "Dogri",
  sat: "Santali",
};

const SITE_CONTEXT = [
  "You are Saathi, the on-page guide for RTI Saathi, an independent hackathon prototype that helps Indian citizens understand the Right to Information process.",
  "It is not an official Government of India service and never submits, pays for, or tracks a real request.",
  "Explain only this site or the basic RTI process it guides: choosing Central or State, requesting existing records, the standard ₹10 fee and BPL waiver, the usual 30-day reply timeline, official filing and appeal portals, and locally saved drafts.",
  "Do not give case-specific legal advice, guarantee outcomes, or ask for personal identifiers. Keep answers to two or three short sentences in plain language.",
].join(" ");

function systemPrompt(lang) {
  if (lang === "hi") return `${SITE_CONTEXT} Reply only in Hindi in Devanagari script.`;
  if (lang === "en") return `${SITE_CONTEXT} Reply only in English.`;
  const languageName = LANG_NAMES[lang] || "the visitor's chosen language";
  return `${SITE_CONTEXT} The interface is set to ${languageName}. Reply in English first, then repeat the same answer in Hindi in Devanagari script.`;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function safeHistory(history) {
  return (Array.isArray(history) ? history : [])
    .filter((turn) => turn && (turn.role === "user" || turn.role === "assistant") && typeof turn.content === "string")
    .slice(-8)
    .map((turn) => ({ role: turn.role, content: turn.content.slice(0, 1000) }));
}

async function chat(request, env) {
  if (request.method === "GET") return json({ configured: Boolean(env.GROQ_API_KEY) });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = await request.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";
  if (!message) return json({ error: "A question is required" }, 400);
  if (!env.GROQ_API_KEY) return json({ error: "Assistant is not configured on this deployment", code: "not_configured" }, 501);

  const lang = typeof body.lang === "string" && LANG_NAMES[body.lang] ? body.lang : "en";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: env.GROQ_MODEL || "qwen/qwen3.8-27b",
      messages: [
        { role: "system", content: systemPrompt(lang) },
        ...safeHistory(body.history),
        { role: "user", content: message },
      ],
      temperature: 0.35,
      max_tokens: 240,
    }),
  });
  const data = await response.json().catch(() => ({}));
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!response.ok || !reply) return json({ error: "Could not reach the assistant right now", code: "upstream_error" }, 502);
  return json({ reply, privacy: "not-stored" });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat") return chat(request, env);
    if (url.pathname === "/api/health") {
      return json({ ok: true, service: "rti-saathi-helper", privacy: "no-request-storage", version: 2 });
    }
    if (url.pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);
    if (env.ASSETS && typeof env.ASSETS.fetch === "function") return env.ASSETS.fetch(request);
    return new Response("Not found", { status: 404 });
  },
};
