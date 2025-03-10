import { validateId, validateCountryCode, sanitizeInput, handleApiError } from '../utils/index';

describe('Player ID Validation', () => {
    test('valid player IDs', () => {
        expect(validateId('aardsda01')).toBe(true);
        expect(validateId('abadan01')).toBe(true);
        expect(validateId('123456')).toBe(true);
    });

    test('invalid player IDs', () => {
        expect(validateId('')).toBe(false);
        expect(validateId(null)).toBe(false);
        expect(validateId('invalid@id')).toBe(false);
        expect(validateId('too-long-id-123')).toBe(false);
    });
});

describe('Country Code Validation', () => {
    test('valid country codes', () => {
        expect(validateCountryCode('USA')).toBe(true);
        expect(validateCountryCode('D.R.')).toBe(true);
        expect(validateCountryCode('usa')).toBe(true);
    });

    test('invalid country codes', () => {
        expect(validateCountryCode('')).toBe(false);
        expect(validateCountryCode('USAAA')).toBe(false); // Changed to 5 characters
        expect(validateCountryCode('U')).toBe(false);
        expect(validateCountryCode('123')).toBe(false);
    });
});

describe('Input Sanitization', () => {
    test('sanitize special characters', () => {
        expect(sanitizeInput('<script>alert(xss)</script>')).toBe('alert(xss)');
        expect(sanitizeInput('Aaron\'s')).toBe('Aarons');
        expect(sanitizeInput(' John Doe ')).toBe('John Doe');
    });
});

describe('API Error Handling', () => {
    test('handle network errors', () => {
        const networkError = new TypeError('Failed to fetch');
        const result = handleApiError(networkError);
        expect(result.status).toBe(503);
        expect(result.message).toBe('Unable to connect to server');
    });

    test('handle API errors', () => {
        const apiError = { status: 404, statusText: 'Not Found' };
        const result = handleApiError(apiError);
        expect(result.status).toBe(404);
        expect(result.message).toBe('Not Found');
    });

    test('handle unknown errors', () => {
        const unknownError = new Error('Unknown error');
        const result = handleApiError(unknownError);
        expect(result.status).toBe(500);
        expect(result.message).toBe('Unknown error');
    });
});

