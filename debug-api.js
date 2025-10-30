#!/usr/bin/env node

/**
 * API Debugging Script for Vercel Deployment
 * Tests the deployed API at https://smart-automation-project-api.vercel.app/
 */

import fetch from 'node-fetch';

const API_BASE = 'https://smart-automation-project-api.vercel.app';

const endpoints = [
  '/',
  '/positions/public',
  '/planner/rakes/status',
  '/kpis',
  '/auth/check-email',
  '/map/routes',
  '/stockyards',
  '/customer/projects',
  '/network/sail',
  '/projects/major'
];

async function testEndpoint(path) {
  const url = `${API_BASE}${path}`;
  console.log(`\n🔍 Testing: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'API-Debug/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    let body;
    
    if (contentType?.includes('application/json')) {
      body = await response.json();
      console.log(`   Body (JSON):`, JSON.stringify(body, null, 2).slice(0, 500) + '...');
    } else {
      body = await response.text();
      console.log(`   Body (Text):`, body.slice(0, 500) + '...');
    }
    
    return { url, status: response.status, ok: response.ok, body, headers: response.headers };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { url, error: error.message };
  }
}

async function main() {
  console.log('🚀 API Debugging Script');
  console.log('Target:', API_BASE);
  console.log('Time:', new Date().toISOString());
  console.log('=' * 60);

  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 SUMMARY:');
  console.log('=' * 60);
  
  const working = results.filter(r => r.ok);
  const failing = results.filter(r => !r.ok);
  
  console.log(`✅ Working endpoints: ${working.length}`);
  working.forEach(r => console.log(`   ✓ ${r.url}`));
  
  console.log(`\n❌ Failing endpoints: ${failing.length}`);
  failing.forEach(r => console.log(`   ✗ ${r.url} - ${r.error || r.status}`));
  
  // Check for common issues
  console.log('\n🔧 DIAGNOSTICS:');
  console.log('=' * 60);
  
  const rootResult = results.find(r => r.url.endsWith('/'));
  if (!rootResult?.ok) {
    console.log('❌ Root endpoint (/) is not responding - likely deployment configuration issue');
    console.log('   Check: Vercel project root directory should be set to "apps/api"');
    console.log('   Check: Package.json "start" script should point to correct entry file');
  }
  
  if (results.every(r => !r.ok)) {
    console.log('❌ All endpoints failing - deployment may not have started properly');
    console.log('   Check: Vercel build logs for errors');
    console.log('   Check: Node.js version compatibility');
  }
  
  const has404 = results.some(r => r.status === 404);
  if (has404) {
    console.log('❌ 404 errors detected - routing configuration issue');
    console.log('   Check: Express app routes are properly defined');
    console.log('   Check: Vercel is serving the right directory');
  }
}

main().catch(console.error);