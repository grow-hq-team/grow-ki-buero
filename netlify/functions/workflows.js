// Holt die Workflows jedes Agenten LIVE von GitHub. Neue Struktur: pro Agent ein
// Ordner `workflows/` mit einer .md-Datei pro Workflow (jede ist ein Skill/Command).
// Fallback: die alte einzelne `workflows.md`. Braucht GITHUB_TOKEN (read-only Contents)
// als Netlify-Umgebungsvariable. Ohne Token: live:false -> Office nutzt workflows.json.
//
// Pro Workflow liefern wir { command, desc }:
//   command = Frontmatter `command:`  ODER  abgeleitet als /<agent>-<dateiname>
//   desc    = Frontmatter `kurz:`     ODER  `workflow:`     ODER  Dateiname (max 90 Zeichen)

const OWNER = 'grow-hq-team';
const SOURCES = {
  emilia: { repo: 'grow-hq-disziplin-content',      dir: 'ai-team/agents/emilia-social-media' },
  timo:   { repo: 'grow-hq-disziplin-video',        dir: 'ai-team/agents/timo-video-cutter' },
  julia:  { repo: 'grow-hq-disziplin-content',      dir: 'ai-team/agents/julia-assistentin' },
  manuel: { repo: 'grow-hq-disziplin-content',      dir: 'ai-team/agents/manuel-creative-strategist' },
  katja:  { repo: 'grow-hq-kunde-sandra-loeckener', dir: 'ai-team/agents/katja-support' },
  // Neuer Mitarbeiter: hier Repo + Agenten-Ordner ergaenzen.
};
const WF_HEAD = /^##\s+(WF-[0-9A-Za-z]+)\s*[·:]\s*(.+?)\s*$/;

function ghUrl(repo, path) { return `https://api.github.com/repos/${OWNER}/${encodeURI(repo)}/contents/${encodeURI(path)}`; }
function api(token, repo, path) {
  return fetch(ghUrl(repo, path), { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'grow-ki-buero', Accept: 'application/vnd.github+json' } });
}
function raw(token, repo, path) {
  return fetch(ghUrl(repo, path), { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'grow-ki-buero', Accept: 'application/vnd.github.raw' } });
}
function frontmatter(md) {
  const m = md.match(/^---\s*([\s\S]*?)\r?\n---/);
  const o = {};
  if (m) m[1].split('\n').forEach(line => { const i = line.indexOf(':'); if (i > 0) o[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, ''); });
  return o;
}

async function listAgent(token, key, src) {
  // 1) Neue Struktur: Ordner workflows/ mit .md-Dateien
  try {
    const f = await api(token, src.repo, src.dir + '/workflows');
    if (f.ok) {
      const arr = await f.json();
      if (Array.isArray(arr)) {
        const files = arr.filter(x => x.type === 'file' && x.name.endsWith('.md') && x.name.toLowerCase() !== 'readme.md')
                         .sort((a, b) => a.name.localeCompare(b.name));
        const items = await Promise.all(files.map(async x => {
          let fm = {};
          try { const r = await raw(token, src.repo, x.path); if (r.ok) fm = frontmatter(await r.text()); } catch (e) {}
          const base = x.name.replace(/\.md$/i, '');
          const command = (fm.command || ('/' + key + '-' + base)).trim();
          const desc = (fm.kurz || fm.workflow || base).trim().slice(0, 90);
          return { command, desc };
        }));
        if (items.length) return items;
      }
    }
  } catch (e) {}
  // 2) Fallback: alte einzelne workflows.md
  try {
    const r = await raw(token, src.repo, src.dir + '/workflows.md');
    if (r.ok) {
      const md = await r.text(); const out = [], seen = new Set();
      for (const line of md.split('\n')) {
        const m = line.match(WF_HEAD);
        if (m && !seen.has(m[2].trim())) { seen.add(m[2].trim()); out.push({ command: '/' + key, desc: m[2].trim().slice(0, 90) }); }
      }
      if (out.length) return out;
    }
  } catch (e) {}
  return null;
}

exports.handler = async () => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ live: false }) };
  const out = { live: true };
  await Promise.all(Object.entries(SOURCES).map(async ([k, s]) => {
    try { const l = await listAgent(token, k, s); if (l && l.length) out[k] = l; } catch (e) {}
  }));
  return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify(out) };
};
