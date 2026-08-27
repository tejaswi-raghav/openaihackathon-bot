module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const reference = String(req.query?.reference || "").trim().toUpperCase();
  if (!/^RTI-DEMO-\d{4}-[A-Z0-9]{6}$/.test(reference)) return res.status(400).json({ error: "Enter a valid RTI Saathi demo reference" });
  res.status(200).json({ reference, status: "Draft prepared", governmentSubmission: false, nextAction: "Download the filing pack and continue on the correct official RTI portal." });
};
