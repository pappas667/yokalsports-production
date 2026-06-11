import fs from "node:fs";
import path from "node:path";

const dataPath = path.resolve("_data/north-jersey.json");
const raw = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const publications = (raw.publications || [])
  .filter((p) => p && p.approved !== false && p.publish_date)
  .sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));

export default {
  ...raw,
  publications,
  latestPublication: publications[0] || null,
  mainHubPublications: publications.slice(0, 3),
  archivedPublications: publications.slice(3),
  newsletter_issues: (raw.newsletter_issues || [])
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4)
};
