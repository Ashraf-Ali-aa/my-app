// Mock the fets library completely
jest.mock('fets', () => ({
  createClient: jest.fn()
}));

describe('Pet Store Client', () => {
  let mockGet: jest.Mock;
  let getPetById: any;

  beforeEach(async () => {
    // Reset all mocks and clear module cache
    jest.clearAllMocks();
    jest.resetModules();
    
    // Create a fresh mock for the get method
    mockGet = jest.fn();
    
    // Mock the createClient function to return our mocked client
    const { createClient } = require('fets');
    createClient.mockReturnValue({
      '/pet/{petId}': {
        get: mockGet
      }
    });

    // Dynamically import the client module to get the fresh mocked version
    const clientModule = await import('../client');
    getPetById = clientModule.getPetById;
  });

  describe('getPetById', () => {
    it('should successfully fetch a pet by ID', async () => {
      // Mock successful response
      const mockPetData = {
        id: 1,
        name: 'doggie',
        status: 'available',
        category: { id: 1, name: 'Dogs' },
        photoUrls: ['string'],
        tags: [{ id: 1, name: 'friendly' }]
      };

      mockGet.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockPetData)
      });

      const result = await getPetById(1);

      expect(mockGet).toHaveBeenCalledWith({
        params: { petId: 1 },
        headers: { api_key: 'special-key' }
      });
      expect(result).toEqual(mockPetData);
    });

    it('should use custom API key when provided', async () => {
      const mockPetData = { id: 2, name: 'kitty' };
      
      mockGet.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue(mockPetData)
      });

      await getPetById(2, 'custom-api-key');

      expect(mockGet).toHaveBeenCalledWith({
        params: { petId: 2 },
        headers: { api_key: 'custom-api-key' }
      });
    });

    it('should throw error when pet is not found (404)', async () => {
      mockGet.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(getPetById(999)).rejects.toThrow('Failed to fetch pet: 404 Not Found');

      expect(mockGet).toHaveBeenCalledWith({
        params: { petId: 999 },
        headers: { api_key: 'special-key' }
      });
    });

    it('should throw error when API returns server error (500)', async () => {
      mockGet.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(getPetById(1)).rejects.toThrow('Failed to fetch pet: 500 Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));

      await expect(getPetById(1)).rejects.toThrow('Network error');
    });

    it('should handle different pet IDs', async () => {
      const testCases = [1, 10, 100, 1000];

      for (const petId of testCases) {
        mockGet.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: jest.fn().mockResolvedValue({ id: petId, name: `pet-${petId}` })
        });

        await getPetById(petId);

        expect(mockGet).toHaveBeenCalledWith({
          params: { petId },
          headers: { api_key: 'special-key' }
        });
      }
    });
  });

  describe('Integration-like tests', () => {
    it('should handle response parsing correctly', async () => {
      const mockJsonFn = jest.fn().mockResolvedValue({
        id: 1,
        category: { id: 1, name: 'Dogs' },
        name: 'doggie',
        photoUrls: ['https://example.com/photo1.jpg'],
        tags: [{ id: 1, name: 'friendly' }],
        status: 'available'
      });

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: mockJsonFn
      };

      mockGet.mockResolvedValue(mockResponse);

      const pet = await getPetById(1);

      expect(mockJsonFn).toHaveBeenCalled();
      expect(pet).toHaveProperty('id', 1);
      expect(pet).toHaveProperty('name', 'doggie');
      expect(pet).toHaveProperty('status', 'available');
      expect(pet.category).toHaveProperty('name', 'Dogs');
      expect(Array.isArray(pet.photoUrls)).toBe(true);
      expect(Array.isArray(pet.tags)).toBe(true);
    });
  });

});