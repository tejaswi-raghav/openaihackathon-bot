const { authorities, states, officialStateDirectory } = require("./lib/catalog.cjs");

module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const query = String(req.query?.q || "").trim().toLowerCase().slice(0, 100);
  const level = String(req.query?.level || "central");
  if (level === "state") {
    const matches = states.filter((state) => !query || state.toLowerCase().includes(query)).slice(0, 12);
    return res.status(200).json({ level, matches, officialDirectory: officialStateDirectory, notice: "Use the official DoPT directory for the current State portal link." });
  }
  if (query.length < 2) return res.status(200).json({ level: "central", matches: [] });
  const terms = query.split(/\s+/).filter(Boolean);
  const ranked = authorities
    .map((item) => {
      const haystack = `${item.name} ${item.keywords.join(" ")}`.toLowerCase();
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 2 : 0) + (item.name.toLowerCase().includes(term) ? 2 : 0), 0);
      return { ...item, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 6)
    .map(({ score, keywords, ...item }) => item);
  res.status(200).json({ level: "central", query, matches: ranked, coverage: "helper-directory-not-exhaustive" });
};
