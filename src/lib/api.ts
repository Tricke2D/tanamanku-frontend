const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiCall(
    endpoint: string,
    options: RequestInit = {}
) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions: RequestInit = {
        ...options,
        headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API Error');
    }

    return response.json();
}

export const auth = {
    register: (email: string, password: string, name: string, role: string = 'farmer') =>
        apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, role }),
        }),

    login: (email: string, password: string) =>
        apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
};