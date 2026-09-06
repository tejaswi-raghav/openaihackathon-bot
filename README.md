# RTI Saathi

A citizen-first, low-bandwidth reimagining of India's Right to Information journey, created as an independent hackathon prototype.

## Design goals

- Start with the citizen's task: ask, track, or appeal.
- Route Central vs State requests before payment to prevent avoidable returns.
- Work on low-end devices and unstable networks with no images, no web fonts, an offline shell, and local draft saving.
- Provide a language-first interface with native-script filing, tracking and appeal essentials across all 22 scheduled Indian languages, plus a complete Hindi journey.
- Meet accessible interaction basics: semantic HTML, keyboard operation, visible focus, reduced-motion and high-contrast support.
- Suggest likely Central public authorities through a small serverless helper API, with offline fallback.
- Check whether a draft asks for specific records, dates and locations without storing the text.
- Save a private on-device case history and export a plain-text filing preparation pack.
- Route State and local matters to the official DoPT State portal directory before payment.

## Submission demo

- `GET /api/health` — privacy and service health contract.
- `GET /api/authorities?q=railway&level=central` — lightweight authority suggestions.
- `POST /api/analyze` — deterministic request-quality feedback; request text is not persisted.
- `GET /api/demo-status?reference=RTI-DEMO-2026-ABC123` — demo-only status boundary.
- `GET /api/chat` — reports whether the Ask Saathi assistant has a Groq key configured (`{configured: boolean}`), without exposing the key itself.
- `POST /api/chat` — Ask Saathi sidebar assistant; requires `GROQ_API_KEY` (optionally `GROQ_MODEL`, defaults to `qwen/qwen3.8-27b`) as a server-side environment variable, falls back to an on-device answer set otherwise.
- `npm test` and `npm run build` verify the citizen journey and serverless helpers.

## Important

This is not an official Government of India service and does not submit requests. It links citizens to the official RTI portals for real filing and status lookup.
