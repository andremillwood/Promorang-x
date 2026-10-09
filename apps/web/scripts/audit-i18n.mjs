import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = path.join(root, 'src/i18n/coverage-baseline.json');
const displayAttributes = /^(title|description|label|placeholder|alt|aria-label|emptyMessage|tooltip|subtitle|heading)$/;
const copyProperties = /^(title|description|label|placeholder|message|helper|subtitle|heading|tooltip|emptyMessage)$/;
// Product names, standards, examples of URLs and currencies are not translated.
const invariant = /^(?:PROMORANG|Promorang|PromoCard|PromoShare|PromoKeys?|PromoPoints?|Gems?|Pieces?|Google|Google Calendar|Outlook \/ Teams|iCal \/ Apple \(\.ics\)|Instagram|Facebook|TikTok|YouTube|WhatsApp|Spotify|USD|US\$|JMD|J\$|BRL|EUR|CSV|PDF|QR|API|KYC|ROI|https?:\/\/\S*|[^\s@]+@[^\s@]+)$/;

export function isDisplayExpression(node) {
  const parent = node.parent;
  if (!parent) return false;
  if (ts.isJsxExpression(parent)) return !ts.isJsxAttribute(parent.parent) || displayAttributes.test(parent.parent.name.text);
  if (ts.isConditionalExpression(parent) && parent.condition !== node) return isDisplayExpression(parent);
  if (ts.isBinaryExpression(parent) && [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(parent.operatorToken.kind)) return isDisplayExpression(parent);
  if (ts.isPropertyAssignment(parent) && parent.initializer === node) return copyProperties.test(parent.name.getText().replace(/^['"]|['"]$/g, ''));
  if (ts.isNewExpression(parent) && parent.expression.getText() === 'Error') return true;
  if (ts.isCallExpression(parent) && parent.arguments[0] === node) return /^(?:toast\.(?:success|error|info|warning)|window\.(?:prompt|confirm|alert))$/.test(parent.expression.getText());
  return false;
}

export function inspectSource(text, filename = 'example.tsx') {
  const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true);
  const issues = [];
  function visit(node) {
    let value, kind;
    if (ts.isJsxText(node)) { value = node.text.replace(/\s+/g, ' ').trim(); kind = 'jsx'; }
    else if (ts.isStringLiteral(node) && ts.isJsxAttribute(node.parent) && displayAttributes.test(node.parent.name.text)) { value = node.text; kind = 'attribute'; }
    else if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) && isDisplayExpression(node)) { value = ts.isTemplateExpression(node) ? node.getText(source) : node.text; kind = 'expression'; }
    if (value && /[A-Za-z]{2}/.test(value) && !invariant.test(value)) {
      const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
      issues.push({ kind, value, line });
    }
    // A selected UI locale must determine format, not a hardcoded English locale.
    if (ts.isNewExpression(node) && /^Intl\.(?:NumberFormat|DateTimeFormat|RelativeTimeFormat|ListFormat|PluralRules)$/.test(node.expression.getText(source))) {
      const arg = node.arguments?.[0];
      if (!arg || arg.getText(source) === 'undefined' || (ts.isStringLiteral(arg) && /^en(?:-|$)/.test(arg.text))) {
        issues.push({ kind: 'format', value: node.getText(source), line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1 });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return issues;
}

export function reachableFiles(entry = path.join(root, 'src/main.tsx')) {
  const seen = new Set();
  function visit(file) {
    if (seen.has(file) || !/\.[cm]?[jt]sx?$/.test(file)) return;
    seen.add(file);
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    function walk(node) {
      if (ts.isStringLiteral(node) && (ts.isImportDeclaration(node.parent) || ts.isExportDeclaration(node.parent) || (ts.isCallExpression(node.parent) && node.parent.expression.kind === ts.SyntaxKind.ImportKeyword))) {
        const specifier = node.text;
        const base = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2)) : specifier.startsWith('.') ? path.resolve(path.dirname(file), specifier) : null;
        if (base) {
          const resolved = [base, `${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
          if (resolved) visit(resolved);
        }
      }
      ts.forEachChild(node, walk);
    }
    walk(source);
  }
  visit(entry);
  return [...seen];
}

export function audit() {
  return reachableFiles().filter(file => !file.includes(`${path.sep}i18n${path.sep}`)).flatMap(file => inspectSource(fs.readFileSync(file, 'utf8'), file).map(issue => ({ file: path.relative(root, file), ...issue })));
}

function fingerprint(issue) {
  return `${issue.file}:${createHash('sha256').update(`${issue.kind}:${issue.value}`).digest('hex').slice(0, 20)}`;
}

function run() {
  const issues = audit();
  const counts = {};
  for (const issue of issues) { const key = fingerprint(issue); counts[key] = (counts[key] || 0) + 1; }
  if (process.argv.includes('--write-baseline')) {
    fs.writeFileSync(baselinePath, JSON.stringify({ description: 'Known localization audit candidates. This is a migration backlog, NOT a completeness certification. Review and reduce it as surfaces are translated.', counts }, null, 2) + '\n');
    console.log(`Recorded ${issues.length} outstanding source occurrences.`);
    return;
  }
  if (process.argv.includes('--json')) { console.log(JSON.stringify(issues, null, 2)); return; }
  const baseline = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')).counts : {};
  const added = Object.keys(counts).filter(key => counts[key] > (baseline[key] || 0));
  const addedSet = new Set(added);
  const regressions = issues.filter(issue => addedSet.has(fingerprint(issue)));
  console.log(`Web i18n audit: ${issues.length} outstanding occurrences; ${regressions.length} occurrences in new/increased groups.`);
  for (const issue of (process.argv.includes('--report') ? issues : regressions).slice(0, 80)) console.log(`${issue.file}:${issue.line} [${issue.kind}] ${issue.value.slice(0, 160)}`);
  if (process.argv.includes('--strict') ? issues.length > 0 : added.length > 0) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
