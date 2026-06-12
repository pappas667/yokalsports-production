/**
 * Yokal Sports Google Sheet -> GitHub publisher.
 * Stores the GitHub token in Script Properties, never in source code.
 * Expected tabs: rankings_history, newsletter_issues (optional).
 * Header matching is flexible; see ALIASES below.
 */
const YOKAL = {
  owner: 'pappas667',
  repo: 'yokalsports-production',
  branch: 'main',
  outputPath: '_data/north-jersey.json',
  market: 'North Jersey',
  slug: 'north-jersey',
  counties: ['Bergen','Passaic','Essex','Hudson','Morris','Sussex','Warren','Hunterdon','Somerset','Union','Middlesex']
};

const ALIASES = {
  publish_date: ['publish_date','date','week','ranking_date','snapshot_date'],
  approved: ['approved','publish','published','status'],
  season: ['season'], level: ['level','school_level'], gender: ['gender','sex'],
  sport: ['sport'], category: ['category','type','ranking_type'], rank: ['rank','ranking'],
  team: ['team','school','program'], athlete: ['athlete','player','name'], county: ['county'],
  record: ['record','team_record'], stats: ['stats','statistics','stat_line'], status: ['notes','status','movement'],
  score: ['score','yssr_score','ranking_score'], mark: ['mark','time','distance'], event: ['event'],
  position: ['position'], commit: ['commit','college_commit'], url: ['url','link'], headline: ['headline','title']
};

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Yokal Sports')
    .addItem('Configure Publisher', 'configurePublisher')
    .addItem('Publish Market', 'publishMarket')
    .addToUi();
}

function configurePublisher() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('GitHub token', 'Paste the fine-grained token. It will be stored privately in Script Properties.', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  const token = response.getResponseText().trim();
  if (!token) throw new Error('Token was empty.');
  PropertiesService.getScriptProperties().setProperty('GITHUB_TOKEN', token);
  ui.alert('Publisher configured. The token is stored in Script Properties and is not written into the sheet or repository.');
}

function publishMarket() {
  const payload = buildMarketPayload_();
  pushJsonToGitHub_(YOKAL.outputPath, payload, `YSSR data update — ${payload.generated_at.slice(0,10)}`);
  SpreadsheetApp.getUi().alert(`Published ${payload.publications.length} approved weekly snapshots to ${YOKAL.outputPath}.`);
}

function buildMarketPayload_() {
  const rankings = readSheetObjects_('rankings_history');
  if (!rankings.length) throw new Error('No rows found in rankings_history.');
  const approvedRows = rankings.filter(isApproved_);
  const rows = approvedRows.length ? approvedRows : rankings;
  const grouped = {};

  rows.forEach((raw) => {
    const r = normalizeRow_(raw);
    if (!r.publish_date || !r.sport) return;
    const date = isoDate_(r.publish_date);
    if (!grouped[date]) grouped[date] = newPublication_(date, r.season || inferSeason_(date));
    addRankingRow_(grouped[date], r);
  });

  const publications = Object.values(grouped).sort((a,b) => b.publish_date.localeCompare(a.publish_date));
  const issues = readNewsletterIssues_();
  return {
    schema_version: 2,
    market: YOKAL.market,
    slug: YOKAL.slug,
    counties: YOKAL.counties,
    generated_at: new Date().toISOString(),
    newsletter_issues: issues,
    publications
  };
}

function newPublication_(date, season) {
  return {
    publish_date: date, approved: true, season,
    high_school: { boys: { sports: [] }, girls: { sports: [] } },
    college: { men: { sports: [] }, women: { sports: [] } },
    nil_tracking: [], historical_winpct: [], charts: []
  };
}

function addRankingRow_(publication, r) {
  const level = String(r.level || 'High School').toLowerCase();
  const gender = normalizeGender_(r.gender, r.sport);
  const category = String(r.category || (r.athlete ? 'Athletes' : 'Teams')).toLowerCase();
  if (category.includes('nil')) { publication.nil_tracking.push(toItem_(r)); return; }
  if (category.includes('histor')) { publication.historical_winpct.push(toItem_(r)); return; }
  const side = level.includes('college')
    ? publication.college[gender === 'girls' ? 'women' : 'men']
    : publication.high_school[gender === 'girls' ? 'girls' : 'boys'];
  let sport = side.sports.find((s) => s.name === r.sport);
  if (!sport) { sport = { name: r.sport, teams: [], athletes: [] }; side.sports.push(sport); }
  const item = toItem_(r);
  if (category.includes('athlete') || category.includes('player') || r.athlete) sport.athletes.push(item);
  else sport.teams.push(item);
  sport.teams.sort((a,b) => Number(a.rank||999)-Number(b.rank||999));
  sport.athletes.sort((a,b) => Number(a.rank||999)-Number(b.rank||999));
}

function toItem_(r) {
  const out = {};
  ['rank','team','athlete','county','record','stats','status','score','mark','event','position','commit','sport'].forEach((k) => {
    if (r[k] !== '' && r[k] != null) out[k] = r[k];
  });
  return out;
}

function readNewsletterIssues_() {
  const rows = readSheetObjects_('newsletter_issues', true);
  return rows.map(normalizeRow_).filter((r) => r.publish_date && r.url).map((r) => ({
    date: isoDate_(r.publish_date), headline: r.headline || 'The Yokal Sports Sports Report', url: r.url
  })).sort((a,b) => b.date.localeCompare(a.date)).slice(0,4);
}

function readSheetObjects_(name, optional) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) { if (optional) return []; throw new Error(`Missing required tab: ${name}`); }
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0].map(cleanHeader_);
  return values.slice(1).filter((r) => r.some((v) => String(v).trim() !== '')).map((r) => {
    const obj = {}; headers.forEach((h,i) => obj[h] = r[i]); return obj;
  });
}

function normalizeRow_(row) {
  const out = {};
  Object.keys(ALIASES).forEach((canonical) => {
    const alias = ALIASES[canonical].find((a) => Object.prototype.hasOwnProperty.call(row, cleanHeader_(a)));
    out[canonical] = alias ? row[cleanHeader_(alias)] : '';
  });
  if (!out.publish_date && row.date) out.publish_date = row.date;
  return out;
}

function isApproved_(row) {
  const n = normalizeRow_(row); const value = String(n.approved || '').trim().toLowerCase();
  if (!value) return true;
  return ['true','yes','y','1','approved','published','publish'].includes(value);
}
function normalizeGender_(gender, sport) {
  const value = `${gender || ''} ${sport || ''}`.toLowerCase();
  return /girl|women|female|softball|field hockey/.test(value) ? 'girls' : 'boys';
}
function inferSeason_(date) { const m = new Date(`${date}T12:00:00`).getMonth()+1; return m<=2||m===12?'Winter':m<=6?'Spring':m<=8?'Summer':'Fall'; }
function cleanHeader_(v) { return String(v||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''); }
function isoDate_(v) { const d = v instanceof Date ? v : new Date(v); if (isNaN(d)) return String(v).slice(0,10); return Utilities.formatDate(d, Session.getScriptTimeZone() || 'America/New_York', 'yyyy-MM-dd'); }

function pushJsonToGitHub_(filePath, data, message) {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) throw new Error('Run Yokal Sports > Configure Publisher first.');
  const api = `https://api.github.com/repos/${YOKAL.owner}/${YOKAL.repo}/contents/${filePath}`;
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  let sha = null;
  const existing = UrlFetchApp.fetch(`${api}?ref=${YOKAL.branch}`, { headers, muteHttpExceptions: true });
  if (existing.getResponseCode() === 200) sha = JSON.parse(existing.getContentText()).sha;
  const body = { message, branch: YOKAL.branch, content: Utilities.base64Encode(JSON.stringify(data,null,2), Utilities.Charset.UTF_8) };
  if (sha) body.sha = sha;
  const response = UrlFetchApp.fetch(api, { method:'put', headers, contentType:'application/json', payload:JSON.stringify(body), muteHttpExceptions:true });
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) throw new Error(`GitHub error ${response.getResponseCode()}: ${response.getContentText()}`);
}
