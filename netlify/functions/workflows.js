// Holt die workflows.md jedes Agenten LIVE von GitHub und parst die WF-Ueberschriften.
// Dadurch spiegelt das Office immer den aktuellen Stand wider, ohne Redeploy.
// Braucht GITHUB_TOKEN (read-only, Repository-Contents) als Netlify-Umgebungsvariable,
// weil die Agenten-Repos privat sind. Ohne Token liefert die Funktion live:false,
// dann nutzt das Office die mitgelieferte workflows.json als Fallback.

const OWNER = 'grow-hq-team';
const SOURCES = {
  emilia: { repo: 'grow-hq-disziplin-content',       path: 'ai-team/agents/emilia-social-media/workflows.md' },
  timo:   { repo: 'grow-hq-disziplin-video',         path: 'ai-team/agents/timo-video-cutter/workflows.md' },
  katja:  { repo: 'grow-hq-kunde-sandra-loeckener',  path: 'ai-team/agents/katja-support/workflows.md' },
  julia:  { repo: 'grow-hq-kunde-grow-hq-intern',    path: 'ai-team/agents/julia-assistenz/workflows.md' },
  // Neuer Mitarbeiter: hier Repo + Pfad zu seiner workflows.md ergaenzen.
  // Sobald die Datei existiert (## WF-NN · Titel), erscheinen die Workflows automatisch.
};
const RE = /^##\s+(WF-[0-9A-Za-z]+)\s*[·:]\s*(.+?)\s*$/;

async function fetchWorkflows(token, repo, path) {
  const r = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.raw', 'User-Agent': 'grow-ki-buero' },
  });
  if (!r.ok) return null;
  const md = await r.text();
  const list = [], seen = new Set();
  for (const line of md.split('\n')) {
    const m = line.match(RE);
    if (m && !seen.has(m[2].trim())) { seen.add(m[2].trim()); list.push({ id: m[1], title: m[2].trim() }); }
  }
  return list;
}

exports.handler = async () => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ live: false }) };
  }
  const out = { live: true };
  await Promise.all(Object.entries(SOURCES).map(async ([key, s]) => {
    try { const l = await fetchWorkflows(token, s.repo, s.path); if (l && l.length) out[key] = l; } catch (e) {}
  }));
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' },
    body: JSON.stringify(out),
  };
};
