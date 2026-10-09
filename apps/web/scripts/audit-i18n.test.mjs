import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectSource } from './audit-i18n.mjs';

test('finds copy that catalog parity tests cannot see', () => {
  const issues = inspectSource(`function Page() { return <><h1>Hello world</h1><input placeholder="Your name" /><p>{busy ? "Saving changes" : "Ready now"}</p></>; }`);
  assert.deepEqual(issues.map(issue => issue.value), ['Hello world', 'Your name', 'Saving changes', 'Ready now']);
});
test('finds notifications, configuration copy, interpolated messages and English formatters', () => {
  const issues = inspectSource('const options = [{ label: "Host a night" }]; toast.error("Try again"); const x = <p>{`Welcome ${name}`}</p>; const date = new Intl.DateTimeFormat("en-US");');
  assert.deepEqual(issues.map(issue => issue.kind), ['expression', 'expression', 'expression', 'format']);
});
test('does not mistake protocol values, styles or translated keys for UI copy', () => {
  assert.deepEqual(inspectSource(`const state = "pending"; const options = { currency: "USD" }; const x = <button className={active ? "flex block" : "hidden"} title={t("button.title")} onClick={() => update("pending")}>{t("button.save")}</button>;`), []);
});
test('preserves product names and URL or email examples', () => {
  assert.deepEqual(inspectSource('<><p>Promorang</p><input placeholder="you@example.com" /><input placeholder="https://..." /><p>USD</p></>'), []);
});
test('accepts formatters driven by the selected locale', () => {
  assert.deepEqual(inspectSource('new Intl.NumberFormat(locale); new Intl.DateTimeFormat(currentUiLocale());'), []);
});
