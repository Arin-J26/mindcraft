import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const { GROQ_API_KEY: KEY, PORT = 3000 } = process.env;
const MODELS = (process.env.GROQ_MODELS || 'llama-3.3-70b-versatile,llama-3.1-8b-instant,openai/gpt-oss-120b,openai/gpt-oss-20b').split(',').map(s => s.trim()).filter(Boolean);
const clamp = (n, a, b, d) => (Number.isFinite(+n) ? Math.min(b, Math.max(a, +n)) : d);

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((_q, r, n) => { r.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY' }); n(); });
app.use(express.json({ limit: '200kb' }));
app.use(express.static(path.join(dir, 'public'), { maxAge: '1h' }));
app.get('/healthz', (_q, r) => r.send('ok'));
app.get('/api/status', (_q, r) => r.json({ providers: { groq: !!KEY }, models: { groq: MODELS } }));

const limiter = rateLimit({ windowMs: 60_000, limit: Number(process.env.RATE_LIMIT || 20), standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Slow down, miner!' } });

app.post('/api/chat', limiter, async (req, res) => {
  const b = req.body || {};
  if (!KEY) return res.status(400).json({ error: 'Groq is not configured on the server.' });
  const model = MODELS.includes(b.model) ? b.model : MODELS[0];
  const msgs = (Array.isArray(b.messages) ? b.messages : []).slice(-40).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', text: String(m.text || '').slice(0, 12000) }));
  if (!msgs.length) return res.status(400).json({ error: 'No messages.' });
  const system = String(b.system || '').slice(0, 4000), temp = clamp(b.temperature, 0, 2, 1), max = clamp(b.max_tokens, 64, 8192, 2048);
  const supportsTools = /gpt-oss/i.test(model);
  const tools = [];
  if (supportsTools && b.tools?.search) tools.push({ type: 'browser_search' });
  if (supportsTools && b.tools?.code) tools.push({ type: 'code_interpreter' });
  const useJson = !!b.json && !tools.length;
  const hasJsonWord = /json/i.test(system + ' ' + msgs.map(m => m.text).join(' '));
  const instructions = useJson && !hasJsonWord ? (system ? system + '\n' : '') + 'Respond with valid JSON.' : system;
  const effort = ['low', 'medium', 'high'].includes(b.reasoning) ? b.reasoning : 'medium';
  const stream = b.stream !== false;
  const payload = {
    model,
    messages: [...(instructions ? [{ role: 'system', content: instructions }] : []), ...msgs.map(m => ({ role: m.role, content: m.text }))],
    temperature: temp,
    max_completion_tokens: max,
    stream,
    ...(/gpt-oss|qwen/i.test(model) ? { reasoning_effort: effort } : {}),
    ...(tools.length ? { tools } : {}),
    ...(useJson ? { response_format: { type: 'json_object' } } : {}),
  };
  const ctl = new AbortController();
  res.on('close', () => ctl.abort());
  let up;
  try {
    up = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify(payload),
    });
    if (!up.ok) {
      const raw = await up.text(); console.error('groq', up.status, raw.slice(0, 300));
      let why = ''; try { why = JSON.parse(raw).error.message.slice(0, 160); } catch {}
      return res.status(502).json({ error: `Groq returned an error (${up.status}). ${why}` });
    }
  } catch (e) {
    if (e.name === 'AbortError') return;
    console.error(e); return res.status(502).json({ error: 'Could not reach Groq.' });
  }
  if (!stream) {
    try {
      const data = await up.json();
      if (ctl.signal.aborted) return;
      return res.json({ text: data.choices?.[0]?.message?.content || '' });
    } catch (e) {
      if (e.name === 'AbortError') return;
      console.error(e); return res.status(502).json({ error: 'Invalid response from Groq.' });
    }
  }
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.flushHeaders();
  const out = t => { if (t) res.write('data: ' + JSON.stringify({ t }) + '\n\n'); };
  try {
    const rd = up.body.getReader(), dec = new TextDecoder(); let buf = '';
    for (;;) {
      const { done, value } = await rd.read(); if (done) break;
      buf += dec.decode(value, { stream: true }); const ls = buf.split('\n'); buf = ls.pop();
      for (const l of ls) {
        if (!l.startsWith('data:')) continue;
        const raw = l.slice(5).trim();
        if (!raw || raw === '[DONE]') continue;
        try {
          const ev = JSON.parse(raw);
          if (ev.error) res.write('data: ' + JSON.stringify({ error: ev.error.message || 'Groq stream failed.' }) + '\n\n');
          else out(ev.choices?.[0]?.delta?.content);
        } catch {}
      }
    }
  } catch (e) {
    if (e.name !== 'AbortError') { console.error(e); res.write('data: ' + JSON.stringify({ error: 'The stream was interrupted.' }) + '\n\n'); }
  }
  if (ctl.signal.aborted) return;
  res.write('data: [DONE]\n\n'); res.end();
});

app.listen(PORT, () => console.log(`MINDCRAFT running on http://localhost:${PORT} (groq: ${!!KEY})`));
