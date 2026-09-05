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

const SYSTEM_PROMPT = [
  "You are Saathi, the on-page guide for RTI Saathi, an independent hackathon prototype that helps Indian citizens use the Right to Information Act. It is not an official Government of India service and never submits or tracks a real request.",
  "Facts about this site: visitors choose a language first; they can prepare a guided RTI request by picking a Central or State authority, naming a topic and describing what they need, with an optional attachment up to 1MB; the standard fee is \u20b910, waived with valid BPL proof; a public authority must reply within 30 days, after which the site links to the official first-appeal process; a request-quality checker gives writing feedback without storing the text; drafts and a local case history are saved only on the visitor's own device, no account or government login needed; State and local matters are routed to the official DoPT State RTI directory instead of the Central portal; real submission and status checks happen on the official rtionline.gov.in and rti.dopt.gov.in sites, which this site links to.",
  "Answer only questions about using this site or the basic RTI process it guides people through. Keep answers to at most 2-3 short sentences, in plain everyday language, no legal jargon. If something is outside this scope (case-specific legal advice, guaranteed outcomes, anything unrelated to RTI), say so briefly and point to the official portal. Never claim to submit, pay for, or track a real request yourself.",
].join(" ");

function buildSystemPrompt(lang) {
  const languageName = LANG_NAMES[lang] || "English";
  return `${SYSTEM_PROMPT} Reply only in ${languageName}, regardless of what language the visitor writes in, unless they explicitly ask for a different language.`;
}

// Gemini's generateContent expects {role, parts:[{text}]} turns, with "model"
// standing in for what OpenAI-style history calls "assistant", and no
// "system" role in the turn list at all (that goes in systemInstruction).
function buildGeminiContents(message, history) {
  const safeHistory = (Array.isArray(history) ? history : [])
    .filter((turn) => turn && (turn.role === "user" || turn.role === "assistant") && typeof turn.content === "string")
    .slice(-8)
    .map((turn) => ({ role: turn.role === "assistant" ? "model" : "user", parts: [{ text: turn.content.slice(0, 1000) }] }));
  return [...safeHistory, { role: "user", parts: [{ text: message }] }];
}

async function callGemini(systemPrompt, contents) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("Gemini API key is not configured");
    error.code = "not_configured";
    throw error;
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.4, maxOutputTokens: 220 },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error((data && data.error && data.error.message) || `Gemini request failed (${response.status})`);
    error.code = "upstream_error";
    throw error;
  }
  const candidate = data && data.candidates && data.candidates[0];
  const parts = candidate && candidate.content && candidate.content.parts;
  const reply = Array.isArray(parts) ? parts.map((p) => p.text || "").join("").trim() : "";
  if (!reply) {
    const error = new Error("Gemini returned an empty reply");
    error.code = "empty_reply";
    throw error;
  }
  return reply;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return res.status(200).json({ configured: Boolean(process.env.GEMINI_API_KEY) });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";
  if (!message) return res.status(400).json({ error: "A question is required" });

  const lang = typeof body.lang === "string" && LANG_NAMES[body.lang] ? body.lang : "en";
  const systemPrompt = buildSystemPrompt(lang);
  const contents = buildGeminiContents(message, body.history);

  if (typeof fetch !== "function") {
    return res.status(500).json({ error: "Server fetch is unavailable", code: "no_fetch" });
  }

  try {
    const reply = await callGemini(systemPrompt, contents);
    res.status(200).json({ reply, privacy: "not-stored" });
  } catch (error) {
    if (error && error.code === "not_configured") {
      return res.status(501).json({ error: "Assistant is not configured on this deployment", code: "not_configured" });
    }
    res.status(502).json({ error: "Could not reach the assistant right now", code: (error && error.code) || "upstream_error" });
  }
};

module.exports.buildSystemPrompt = buildSystemPrompt;
module.exports.buildGeminiContents = buildGeminiContents;
module.exports.LANG_NAMES = LANG_NAMES;
