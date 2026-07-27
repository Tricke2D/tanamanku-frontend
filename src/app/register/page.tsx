'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { saveAuth } from '@/lib/auth';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'farmer',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Validate form
            if (!formData.email || !formData.password || !formData.name) {
                setError('Email, password, dan nama harus diisi');
                setLoading(false);
                return;
            }

            console.log('Registering:', formData.email);

            const response = await auth.register(
                formData.email,
                formData.password,
                formData.name,
                formData.role
            );

            console.log('Registration success:', response);

            saveAuth(response);
            setSuccess('Registrasi berhasil! Redirecting...');

            // Delay redirect slightly
            setTimeout(() => {
                const redirectMap: Record<string, string> = {
                    farmer: '/farmer',
                    exporter: '/exporter',
                    admin: '/admin',
                };
                router.push(redirectMap[response.user.role] || '/');
            }, 1000);
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Registrasi gagal');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-green-700 mb-2">🌱 TANAMANKU</h1>
                <p className="text-gray-600 mb-6">Daftar untuk memulai</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Budi Santoso"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="budi@kerinci.id"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={loading}
                        >
                            <option value="farmer">Petani (Farmer)</option>
                            <option value="exporter">Eksportir (Exporter)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone (Opsional)
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="08123456789"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Mendaftar...' : 'Daftar'}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-4 text-sm">
                    Sudah punya akun?{' '}
                    <a href="/login" className="text-green-600 hover:text-green-700 font-bold">
                        Login di sini
                    </a>
                </p>
            </div>
        </div>
    );
}