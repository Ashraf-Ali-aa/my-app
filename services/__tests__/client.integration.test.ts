/**
 * Live API Integration Tests
 * These tests hit the real Swagger Petstore API
 */

import { getPetById } from '../client';

describe('Live API Integration Tests', () => {
  it('should successfully fetch a real pet from live API', async () => {
    // Test against the live API - Pet ID 1 typically exists in the demo
    const pet = await getPetById(1);
    
    // Verify the response structure
    expect(pet).toBeDefined();
    expect(pet).toHaveProperty('id');
    expect(pet).toHaveProperty('name');
    expect(typeof pet.id).toBe('number');
    expect(typeof pet.name).toBe('string');
    
    // Optional properties that may or may not be present
    if (pet.status) {
      expect(['available', 'pending', 'sold']).toContain(pet.status);
    }
    
    if (pet.photoUrls) {
      expect(Array.isArray(pet.photoUrls)).toBe(true);
    }
    
    console.log('✅ Live API test successful! Pet data:', JSON.stringify(pet, null, 2));
  }, 10000); // 10 second timeout for network request

  it('should handle 404 error for non-existent pet from live API', async () => {
    // Test with a negative pet ID which should not exist
    await expect(getPetById(-1)).rejects.toThrow('Failed to fetch pet: 404');
  }, 10000);
});
