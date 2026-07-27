'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { saveAuth } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await auth.login(email, password);
            saveAuth(response);

            // Redirect based on role
            const redirectMap: Record<string, string> = {
                farmer: '/farmer',
                exporter: '/exporter',
                admin: '/admin',
            };

            router.push(redirectMap[response.user.role] || '/');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-green-700 mb-2">🌱 TANAMANKU</h1>
                <p className="text-gray-600 mb-6">Blockchain Coffee Supply Chain Transparency</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="budi@kerinci.id"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-4 text-sm">
                    Belum punya akun?{' '}
                    <a href="/register" className="text-green-600 hover:text-green-700 font-bold">
                        Daftar di sini
                    </a>
                </p>

                {/* Test Credentials */}
                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-700">
                    <p className="font-bold mb-1">Test Credentials:</p>
                    <p>Email: budi@kerinci.id</p>
                    <p>Password: password123</p>
                </div>
            </div>
        </div>
    );
}