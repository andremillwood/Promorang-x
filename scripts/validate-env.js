#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define required environment variables for different environments
const requiredEnvVars = {
  development: [
    'VITE_API_BASE_URL',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ],
  production: [
    'VITE_API_BASE_URL',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY' // Only needed in backend
  ]
};

// Check if we're in development or production mode
const isProduction = process.env.NODE_ENV === 'production';
const env = isProduction ? 'production' : 'development';

console.log(`Validating ${env} environment variables...`);

// Check for missing environment variables
const missingVars = [];
const currentEnvVars = Object.keys(process.env);

requiredEnvVars[env].forEach(varName => {
  if (!currentEnvVars.includes(varName) || !process.env[varName]) {
    missingVars.push(varName);
  }
});

// Check for placeholder values in production
if (isProduction) {
  const placeholderVars = [];
  requiredEnvVars[env].forEach(varName => {
    if (process.env[varName] && process.env[varName].includes('<')) {
      placeholderVars.push(varName);
    }
  });

  if (placeholderVars.length > 0) {
    console.error('❌ Error: The following environment variables contain placeholder values:');
    placeholderVars.forEach(varName => {
      console.error(`  - ${varName}: ${process.env[varName]}`);
    });
    process.exit(1);
  }
}

// Report results
if (missingVars.length > 0) {
  console.error(`❌ Error: The following required environment variables are missing:`);
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error('\nPlease ensure all required environment variables are set before deployment.');
  process.exit(1);
}

console.log('✅ All required environment variables are set.');

// Check for sensitive data in client-side code
if (isProduction) {
  console.log('\nChecking for sensitive data in client-side code...');
  
  const sensitivePatterns = [
    /SUPABASE_SERVICE_KEY/,
    /PASSWORD/i,
    /SECRET/i,
    /API_KEY/i,
    /TOKEN/i,
    /PRIVATE_KEY/i
  ];

  const frontendDir = path.join(__dirname, '../frontend/src');
  const filesToCheck = [
    path.join(frontendDir, '**/*.ts'),
    path.join(frontendDir, '**/*.tsx'),
    path.join(frontendDir, '**/*.js'),
    path.join(frontendDir, '**/*.jsx')
  ];

  const { glob } = require('glob');
  const files = glob.sync(filesToCheck, { nodir: true });
  
  let hasSensitiveData = false;
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(content) && !content.includes('process.env')) {
        console.error(`❌ Potential sensitive data found in ${file}: ${pattern}`);
        hasSensitiveData = true;
      }
    });
  });

  if (hasSensitiveData) {
    console.error('\n❌ Error: Potential sensitive data found in client-side code.');
    console.error('Please ensure all sensitive data is properly managed using environment variables.');
    process.exit(1);
  }
  
  console.log('✅ No sensitive data found in client-side code.');
}
