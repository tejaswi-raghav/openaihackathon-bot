function analyzeRequest(text) {
  const value = String(text || "").trim().slice(0, 3000);
  let score = 25;
  const tips = [];
  const lower = value.toLowerCase();
  if (value.length >= 80) score += 15;
  else tips.push("Add enough detail to identify the record you need.");
  if (/\b(19|20)\d{2}\b|\b(from|between|dated|period|month|year)\b/i.test(value)) score += 20;
  else tips.push("Add a date or date range.");
  if (/\b(copy|copies|record|register|report|order|file|minutes|list|status|amount|sanctioned|spent)\b/i.test(value)) score += 20;
  else tips.push("Ask for an existing record, report, list, order or status.");
  if (/\b(why|opinion|explain|justify)\b/i.test(value)) {
    score -= 15;
    tips.push("Replace opinion questions such as ‘why’ with a request for records or action taken.");
  } else score += 10;
  if (/\b(village|district|office|division|department|scheme|complaint|application)\b/i.test(lower)) score += 10;
  else tips.push("Name the place, office, scheme or application involved.");
  score = Math.max(0, Math.min(100, score));
  if (tips.length === 0) tips.push("Clear and record-focused. Review names, dates and spellings before filing.");
  return { score, grade: score >= 80 ? "Ready to review" : score >= 55 ? "Almost clear" : "Needs detail", tips: tips.slice(0, 4), characters: value.length };
}

module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const text = typeof req.body === "string" ? (() => { try { return JSON.parse(req.body).text; } catch { return ""; } })() : req.body?.text;
  if (typeof text !== "string" || !text.trim()) return res.status(400).json({ error: "A request draft is required" });
  res.status(200).json({ ...analyzeRequest(text), privacy: "processed-without-storage" });
};

module.exports.analyzeRequest = analyzeRequest;
