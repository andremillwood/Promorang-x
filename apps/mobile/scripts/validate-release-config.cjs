const fs = require('node:fs');
const path = require('node:path');

const mobileRoot = path.resolve(__dirname, '..');
const appConfig = JSON.parse(fs.readFileSync(path.join(mobileRoot, 'app.json'), 'utf8')).expo;
const easConfig = JSON.parse(fs.readFileSync(path.join(mobileRoot, 'eas.json'), 'utf8'));
const errors = [];

if (appConfig.ios?.bundleIdentifier !== 'com.promorang.mobile') errors.push('iOS bundle identifier must be com.promorang.mobile.');
if (appConfig.android?.package !== 'com.promorang.mobile') errors.push('Android package must be com.promorang.mobile.');
if (appConfig.scheme !== 'promorang') errors.push('Expo scheme must remain promorang unless OAuth and payment redirects are migrated together.');
if (!appConfig.owner) errors.push('Expo owner is missing. Run `npx eas-cli init` from apps/mobile and commit the owner.');
if (!appConfig.extra?.eas?.projectId) errors.push('EAS projectId is missing. Run `npx eas-cli init` from apps/mobile and commit the generated project ID.');
if (!appConfig.ios?.usesAppleSignIn) errors.push('Sign in with Apple entitlement is not enabled.');
if (!easConfig.build?.production?.environment) errors.push('The EAS production environment is not selected.');
if (easConfig.build?.production?.env?.EXPO_PUBLIC_ENABLE_DEMO_LOGIN !== 'false') errors.push('Demo login must be disabled in production builds.');

if (errors.length) {
  console.error('Mobile release configuration is incomplete:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Mobile release configuration is complete.');
