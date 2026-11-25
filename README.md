# MINDCRAFT (curated by Arin)
A Minecraft-style AI chat powered by Groq. The API key lives on the server, so visitors never see or enter it.

## Run locally
1. Install Node 18+.
2. `npm install`
3. `echo "GROQ_API_KEY=your_key" > .env` (get a free key at console.groq.com)
4. `npm start`, then open http://localhost:3000. With no key it runs in demo mode.

## Settings (Options → Brain)
System message, temperature, max completion tokens, stream, JSON mode, and (for `gpt-oss` models on Groq):
- Reasoning: Groq thinking effort (low, medium, high)
- Browser Search: Groq Browser Search
- Code Interpreter: Groq Code Interpreter (Python)
JSON mode is skipped while a tool is on.

## Launch (Render, Railway, Fly.io or any Node host)
- Build: `npm install`. Start: `npm start`. Health check: `/healthz`.
- Add `GROQ_API_KEY` as an environment variable. Never commit `.env`.
- `RATE_LIMIT` sets requests per minute per IP. `GROQ_MODELS` overrides the model list.
