export interface User {
    id: number;
    email: string;
    name: string;
    role: 'farmer' | 'exporter' | 'admin';
}

export interface AuthResponse {
    token: string;
    user: User;
}

export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
};

export const getUser = (): User | null => {
    if (typeof window === 'undefined') return null;

    const user = localStorage.getItem('user');

    return user ? (JSON.parse(user) as User) : null;
};

export const saveAuth = (response: AuthResponse): void => {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
};

export const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};