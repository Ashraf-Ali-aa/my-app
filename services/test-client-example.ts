/**
 * Example file showing how to test the client manually
 * Run this with: npx ts-node services/test-client-example.ts
 */

import { getPetById } from './client';

async function testClient() {
  console.log('Testing Pet Store Client...\n');

  try {
    // Test case 1: Get a valid pet (ID 1 usually exists in the demo API)
    console.log('🔍 Testing getPetById(1)...');
    const pet1 = await getPetById(1);
    console.log('✅ Success! Pet data:', JSON.stringify(pet1, null, 2));
    console.log('');

    // Test case 2: Get another pet with custom API key
    console.log('🔍 Testing getPetById(2) with custom API key...');
    const pet2 = await getPetById(2, 'special-key');
    console.log('✅ Success! Pet data:', JSON.stringify(pet2, null, 2));
    console.log('');

    // Test case 3: Try to get a non-existent pet (should fail)
    console.log('🔍 Testing getPetById(999999) - should fail...');
    try {
      await getPetById(999999);
      console.log('❌ Unexpected success');
    } catch (error) {
      console.log('✅ Expected error:', (error as Error).message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testClient();
}
