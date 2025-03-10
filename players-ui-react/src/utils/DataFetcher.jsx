export default async function fetchData() {
    try {
        const response = await fetch('/v1/players');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data) {
            throw new Error('No data received from server');
        }
        
        return data;
    } catch (error) {
        // Log the error for debugging
        console.error('Error fetching players:', error.message);
        
        // Throw a more specific error for better error handling
        if (error.name === 'TypeError') {
            throw new Error('Network error or invalid JSON response');
        }
        
        // Re-throw the error to be handled by the caller
        throw error;
    }
}
