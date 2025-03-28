export const fetchWithHandling = async <T>(url: string, options?: RequestInit): Promise<T> => {
    try {
        const response = await fetch(url, options);
      
        // Handle HTTP errors
        if (!response.ok) {
            let errorData;
            try {
                const text = await response.text();
                console.error(`❌ API Error Response (Text):`, text);
                errorData = JSON.parse(text);  // Attempt JSON parsing
            } catch {
                errorData = { message: "Non-JSON error response" };
            }
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        // Verify content type
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            throw new Error(`Invalid content type: ${contentType}`);
        }

        const result = await response.json();
        console.log(`✅ API Success Response for ${url}:`, result);
        return result as T;
    } catch (error) {
        console.error(`❌ API request failed for ${url}:`, error);
        throw error; // Re-throw for component-level handling
    }
};
