import { createClient, type NormalizeOAS } from 'fets';
import type openapi from './openapi';


type PetStoreAPI = NormalizeOAS<typeof openapi>;

const client = createClient<PetStoreAPI>({
  endpoint: 'https://petstore.swagger.io/v2'
})

// Function to get a pet by ID
export const getPetById = async (petId: number, apiKey: string = 'special-key') => {
  const response = await client['/pet/{petId}'].get({
    params: {
      petId
    },
    headers: {
      api_key: apiKey
    }
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch pet: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

// Function to get pets by status (avoids 404s on demo)
export const getAvailablePets = async (
  status: ('available' | 'pending' | 'sold')[] = ['available'],
  accessToken: string = 'demo'
) => {
  const response = await client['/pet/findByStatus'].get({
    query: { status },
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch pets: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export default client