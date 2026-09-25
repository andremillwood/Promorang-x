import { spawnSync } from "node:child_process";

const baseUrl = process.env.FIND_OR_ASK_BASE_URL || "http://127.0.0.1:4173";
const chromeCandidates = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"];

function resolveChrome() {
  for (const candidate of chromeCandidates) {
    const probe = spawnSync("bash", ["-lc", `command -v ${candidate}`], { encoding: "utf8" });
    if (probe.status === 0 && probe.stdout.trim()) return probe.stdout.trim();
  }
  throw new Error("Headless Chrome/Chromium is required for browser verification.");
}

const chrome = resolveChrome();

function render(path, width, height) {
  const url = `${baseUrl}${path}`;
  const result = spawnSync(chrome, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    `--window-size=${width},${height}`,
    "--virtual-time-budget=8000",
    "--dump-dom",
    url,
  ], { encoding: "utf8", timeout: 30000, maxBuffer: 25 * 1024 * 1024 });

  if (result.status !== 0) {
    throw new Error(`Chrome failed for ${url}: ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function requireText(html, text, label) {
  if (!html.includes(text)) throw new Error(`${label}: missing “${text}”`);
}

function requirePattern(html, pattern, label) {
  if (!pattern.test(html)) throw new Error(`${label}: expected semantic control pattern ${pattern}`);
}

const encodedQuery = encodeURIComponent("zz find or ask no result 92817");
const searchPath = `/search?q=${encodedQuery}&source=search&city=Kingston&lang=en&recovery=search_again`;
const confirmPath = `/search?q=${encodedQuery}&source=search&city=Kingston&lang=en&recovery=ask_people`;

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 },
]) {
  const search = render(searchPath, viewport.width, viewport.height);
  requireText(search, "Ask people", `${viewport.name} search recovery`);
  requireText(search, "Ask for something new", `${viewport.name} search recovery`);
  requireText(search, "Try another search", `${viewport.name} search recovery`);
  requireText(search, "Nothing is posted until you choose", `${viewport.name} search recovery`);
  requirePattern(search, /<button[^>]*type="button"[^>]*>[\s\S]{0,1600}Ask people/, `${viewport.name} keyboard control`);

  const confirm = render(confirmPath, viewport.width, viewport.height);
  requireText(confirm, "Ask people this question?", `${viewport.name} confirmation`);
  requireText(confirm, "There is no demand target", `${viewport.name} question semantics`);
  requireText(confirm, "Nothing is public until you press Post", `${viewport.name} confirmation privacy`);
}

console.log("Find-or-Ask Search/recovery browser verification passed at 390x844 and 1440x1000.");
