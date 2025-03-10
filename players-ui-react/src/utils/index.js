export const validateId = (value) => {
    // Check if value exists
    if (!value) return false;
    
    // Check if value is a string or number
    if (typeof value !== 'string' && typeof value !== 'number') return false;
    
    // Convert to string and check if it's a valid format (alphanumeric)
    const idString = value.toString();
    return /^[a-zA-Z0-9]+$/.test(idString);
}

export const validateCountryCode = (value) => {
    // Check if value exists
    if (!value) return false;
    
    // Check if it's a string
    if (typeof value !== 'string') return false;
    
    // Convert to uppercase
    const upperValue = value.toUpperCase();
    
    // Allow common country codes from the dataset (USA, D.R., etc.)
    return /^[A-Z.]{2,4}$/.test(upperValue);
}

export const handleApiError = (error) => {
    // Check if the error is from fetch API
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
            status: 503,
            message: 'Unable to connect to server'
        };
    }

    // Handle API response errors
    if (error.status) {
        return {
            status: error.status,
            message: error.statusText || 'Server error'
        };
    }

    // Handle network or other errors
    return {
        status: 500,
        message: error.message || 'Internal server error'
    };
};

export const checkResponse = (response) => {
    if (!response.ok) {
        throw {
            status: response.status,
            statusText: response.statusText,
            message: `HTTP error! status: ${response.status}`
        };
    }
    return response;
};

export const sanitizeInput = (value) => {
    if (!value) return '';
    
    const stringValue = String(value);
    
    // Enhanced sanitization
    return stringValue
        .replace(/<[^>]*>/g, '')
        .replace(/[<>'"]/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .trim();
}
