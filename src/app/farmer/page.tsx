'use client';

import { useRouter } from 'next/navigation';
import { getUser, logout } from '@/lib/auth';

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
                <h1 className="text-4xl font-bold text-green-700 mb-2">🌱 Farmer Dashboard</h1>
                <p className="text-gray-600 mb-6">Welcome, {user?.name}!</p>

                <div className="grid gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            + Log New Harvest
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">Recent Batches</h2>
                        <p className="text-gray-500">No batches yet. Start by logging your first harvest!</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}