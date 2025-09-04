#!/usr/bin/env tsx

/**
 * Test Wall API Endpoints
 * Tests the Wall of Fame/Shame API endpoints directly
 */

import fetch from 'node-fetch';

async function testWallAPI() {
  console.log('🧪 Testing Wall of Fame/Shame API endpoints...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test if the server is running
    console.log('\n1️⃣ Testing server connectivity...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    
    if (!healthResponse.ok) {
      console.log('⚠️ Health endpoint not available, but server might still be running');
    } else {
      console.log('✅ Server is responding');
    }

    // Test Wall of Fame page
    console.log('\n2️⃣ Testing Wall of Fame page...');
    const fameResponse = await fetch(`${baseUrl}/fame`);
    
    if (fameResponse.ok) {
      console.log('✅ Wall of Fame page loads successfully');
      const fameContent = await fameResponse.text();
      
      if (fameContent.includes('Failed to fetch')) {
        console.log('❌ Wall of Fame page contains error message');
      } else if (fameContent.includes('Wall of Fame')) {
        console.log('✅ Wall of Fame page content looks good');
      } else {
        console.log('⚠️ Wall of Fame page content unclear');
      }
    } else {
      console.log(`❌ Wall of Fame page failed: ${fameResponse.status} ${fameResponse.statusText}`);
    }

    // Test Wall of Shame page
    console.log('\n3️⃣ Testing Wall of Shame page...');
    const shameResponse = await fetch(`${baseUrl}/shame`);
    
    if (shameResponse.ok) {
      console.log('✅ Wall of Shame page loads successfully');
      const shameContent = await shameResponse.text();
      
      if (shameContent.includes('Failed to fetch')) {
        console.log('❌ Wall of Shame page contains error message');
      } else if (shameContent.includes('Wall of Shame')) {
        console.log('✅ Wall of Shame page content looks good');
      } else {
        console.log('⚠️ Wall of Shame page content unclear');
      }
    } else {
      console.log(`❌ Wall of Shame page failed: ${shameResponse.status} ${shameResponse.statusText}`);
    }

    console.log('\n📋 Test Summary:');
    console.log('  - If pages load without "Failed to fetch" errors, the fix is working');
    console.log('  - If pages show "No companies found", you may need test data');
    console.log('  - Run "npm run sections:test-data" to add sample companies');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

// Run the test
testWallAPI().catch(console.error);
