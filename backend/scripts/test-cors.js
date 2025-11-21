#!/usr/bin/env node
/**
 * CORS and Authentication Smoke Test
 * Tests that CORS is properly configured and authentication endpoints are accessible
 */

const http = require('http');
const https = require('https');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testHealthEndpoint() {
  log('\n📋 Testing Health Endpoint...', 'blue');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/health`);
    
    if (response.statusCode === 200) {
      log('✅ Health endpoint is accessible', 'green');
      return true;
    } else {
      log(`❌ Health endpoint returned status ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Health endpoint failed: ${error.message}`, 'red');
    return false;
  }
}

async function testCORSPreflight() {
  log('\n📋 Testing CORS Preflight (OPTIONS)...', 'blue');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    const allowOrigin = response.headers['access-control-allow-origin'];
    const allowMethods = response.headers['access-control-allow-methods'];
    const allowHeaders = response.headers['access-control-allow-headers'];
    const allowCredentials = response.headers['access-control-allow-credentials'];
    
    log(`   Origin: ${FRONTEND_ORIGIN}`, 'yellow');
    log(`   Allow-Origin: ${allowOrigin || 'NOT SET'}`, allowOrigin ? 'green' : 'red');
    log(`   Allow-Methods: ${allowMethods || 'NOT SET'}`, allowMethods ? 'green' : 'red');
    log(`   Allow-Headers: ${allowHeaders || 'NOT SET'}`, allowHeaders ? 'green' : 'red');
    log(`   Allow-Credentials: ${allowCredentials || 'NOT SET'}`, allowCredentials ? 'green' : 'red');
    
    if (allowOrigin && (allowOrigin === FRONTEND_ORIGIN || allowOrigin === '*')) {
      log('✅ CORS preflight passed', 'green');
      return true;
    } else {
      log('❌ CORS preflight failed - origin not allowed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ CORS preflight failed: ${error.message}`, 'red');
    return false;
  }
}

async function testAuthEndpoint() {
  log('\n📋 Testing Auth Endpoint Accessibility...', 'blue');
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_ORIGIN
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    const allowOrigin = response.headers['access-control-allow-origin'];
    
    log(`   Status: ${response.statusCode}`, 'yellow');
    log(`   Allow-Origin: ${allowOrigin || 'NOT SET'}`, allowOrigin ? 'green' : 'red');
    
    // We expect 401 or 400 (invalid credentials), not 404 or 500
    if (response.statusCode === 401 || response.statusCode === 400) {
      log('✅ Auth endpoint is accessible (returned expected auth error)', 'green');
      return true;
    } else if (response.statusCode === 404) {
      log('❌ Auth endpoint not found (404)', 'red');
      return false;
    } else if (response.statusCode >= 500) {
      log(`❌ Auth endpoint server error (${response.statusCode})`, 'red');
      return false;
    } else {
      log(`⚠️  Auth endpoint returned unexpected status ${response.statusCode}`, 'yellow');
      return true; // Still accessible
    }
  } catch (error) {
    log(`❌ Auth endpoint failed: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('═══════════════════════════════════════════════', 'blue');
  log('  CORS & Authentication Smoke Test', 'blue');
  log('═══════════════════════════════════════════════', 'blue');
  log(`  API URL: ${API_BASE_URL}`, 'yellow');
  log(`  Frontend Origin: ${FRONTEND_ORIGIN}`, 'yellow');
  log('═══════════════════════════════════════════════\n', 'blue');
  
  const results = {
    health: await testHealthEndpoint(),
    cors: await testCORSPreflight(),
    auth: await testAuthEndpoint()
  };
  
  log('\n═══════════════════════════════════════════════', 'blue');
  log('  Test Results', 'blue');
  log('═══════════════════════════════════════════════', 'blue');
  log(`  Health Endpoint: ${results.health ? '✅ PASS' : '❌ FAIL'}`, results.health ? 'green' : 'red');
  log(`  CORS Preflight:  ${results.cors ? '✅ PASS' : '❌ FAIL'}`, results.cors ? 'green' : 'red');
  log(`  Auth Endpoint:   ${results.auth ? '✅ PASS' : '❌ FAIL'}`, results.auth ? 'green' : 'red');
  log('═══════════════════════════════════════════════\n', 'blue');
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    log('🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some tests failed. Please check your configuration.', 'red');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});
