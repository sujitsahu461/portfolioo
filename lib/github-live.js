/**
 * @fileoverview Public GitHub activity for one account, shared by /api/github and Sujit AI.
 *
 * Reads only public data for one account (no token needed):
 *   - profile and repositories from the GitHub REST API
 *   - the contribution calendar from the public contributions page
 *   - the latest commit messages from the most recently pushed repositories
 * Results are cached in memory for 10 minutes and at the CDN edge, so a visitor
 * never costs more than a handful of GitHub requests per cache window.
 * If GitHub is unreachable the endpoint answers 502 and the page shows a plain
 * "could not load" state with a link to the profile. Nothing is invented.
 */

const USER = process.env.GITHUB_USER || 'sujitsahu461';
const TTL_MS = 10 * 60 * 1000;
const UA = { 'User-Agent': 'portfolio-github-activity', Accept: 'application/vnd.github+json' };

let cache = null;

async function gh(path) {
  const r = await fetch('https://api.github.com' + path, { headers: UA });
  if (!r.ok) throw new Error('GitHub API ' + r.status + ' for ' + path);
  return r.json();
}

/** Parse the public contribution calendar HTML into [{ date, count, level }]. */
function parseCalendar(html) {
  const cells = {};
  const cellRe = /<td[^>]*data-date="([\d-]+)"[^>]*id="([^"]+)"[^>]*data-level="(\d)"/g;
  let m;
  while ((m = cellRe.exec(html))) cells[m[2]] = { date: m[1], level: Number(m[3]), count: 0 };

  const tipRe = /<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g;
  while ((m = tipRe.exec(html))) {
    const c = cells[m[1]];
    if (!c) continue;
    const n = /^(\d[\d,]*) contribution/.exec(m[2].trim());
    c.count = n ? Number(n[1].replace(/,/g, '')) : 0;
  }
  const days = Object.values(cells).sort((a, b) => (a.date < b.date ? -1 : 1));
  const t = /([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i.exec(html);
  return { days, total: t ? Number(t[1].replace(/,/g, '')) : days.reduce((s, d) => s + d.count, 0) };
}

async function build() {
  const [profile, repos] = await Promise.all([
    gh('/users/' + USER),
    gh('/users/' + USER + '/repos?per_page=100&sort=pushed'),
  ]);

  const own = repos.filter((r) => !r.fork);

  // Language mix by repository count (primary language of each non-fork repo).
  const langCount = {};
  own.forEach((r) => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
  const languages = Object.entries(langCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Contribution calendar (public page).
  let calendar = null;
  try {
    const r = await fetch('https://github.com/users/' + USER + '/contributions', {
      headers: { 'User-Agent': UA['User-Agent'], 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (r.ok) {
      const parsed = parseCalendar(await r.text());
      if (parsed.days.length > 30) calendar = parsed;
    }
  } catch (_) { /* leave calendar null */ }

  // Latest commits from the most recently pushed repositories.
  const recentRepos = own.slice(0, 4);
  const commitLists = await Promise.all(recentRepos.map(async (r) => {
    try {
      const list = await gh('/repos/' + USER + '/' + r.name + '/commits?author=' + USER + '&per_page=3');
      return list.map((c) => ({
        repo: r.name,
        repoUrl: r.html_url,
        message: String(c.commit.message || '').split('\n')[0].slice(0, 120),
        at: c.commit.author && c.commit.author.date,
        url: c.html_url,
      }));
    } catch (_) { return []; }
  }));
  const commits = [].concat(...commitLists)
    .filter((c) => c.at)
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 8);

  return {
    user: USER,
    profile: {
      name: profile.name,
      bio: profile.bio,
      url: profile.html_url,
      avatar: profile.avatar_url,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      since: profile.created_at,
    },
    stars: own.reduce((s, r) => s + r.stargazers_count, 0),
    languages,
    repos: own.map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
    })),
    calendar,
    commits,
    fetchedAt: new Date().toISOString(),
  };
}

/** Cached for 10 minutes; serves stale data if GitHub is briefly unreachable. */
async function getGithubData() {
  if (!cache || Date.now() - cache.at > TTL_MS) {
    try {
      cache = { at: Date.now(), data: await build() };
    } catch (err) {
      if (!cache) throw err;
    }
  }
  return cache.data;
}

module.exports = { getGithubData, USER };
