'use client';

import { useRouter } from 'next/navigation';
import { getUser, logout } from '@/lib/auth';
import Link from 'next/link';

export default function FarmerDashboard() {
    const router = useRouter();
    const user = getUser();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-green-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-green-700 mb-2">🌱 Farmer Dashboard</h1>
                        <p className="text-gray-600">Selamat datang, {user?.name}!</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>

                {/* Quick Action Card */}
                <div className="grid gap-6">
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
                        <h2 className="text-xl font-bold mb-4">🚀 Aksi Cepat</h2>
                        <Link
                            href="/farmer/harvest/new"
                            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
                        >
                            + Log New Harvest
                        </Link>
                    </div>

                    {/* Batches Overview */}
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold mb-2">📦 My Batches</h2>
                                <p className="text-gray-600">Lihat semua harvest kamu</p>
                            </div>
                            <Link
                                href="/farmer/batches"
                                className="text-green-600 hover:text-green-700 font-bold text-lg"
                            >
                                →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}