/**
 * Client-side database utility
 * Use this in client components instead of directly importing from db.ts
 */

// Generic function to fetch from API routes
export async function fetchFromDB(action: string, data?: any) {
    try {
      if (data) {
        // POST request with data
        const response = await fetch(`/api/db/${action}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'An error occurred');
        }
        
        return await response.json();
      } else {
        // GET request
        const response = await fetch(`/api/db/${action}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'An error occurred');
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching from DB:', error);
      throw error;
    }
  }
  
  // Test database connection
  export async function testConnection() {
    return fetchFromDB('test-connection');
  }
  
