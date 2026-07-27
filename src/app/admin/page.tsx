'use client';

import { useRouter } from 'next/navigation';
import { getUser, logout } from '@/lib/auth';

export default function AdminDashboard() {
    const router = useRouter();
    const user = getUser();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-purple-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-purple-700 mb-2">⚙️ Admin Dashboard</h1>
                <p className="text-gray-600 mb-6">Welcome, {user?.name}!</p>

                <div className="grid gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">System Stats</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-purple-100 rounded">
                                <p className="font-bold text-purple-700">0</p>
                                <p className="text-sm">Total Users</p>
                            </div>
                            <div className="p-4 bg-blue-100 rounded">
                                <p className="font-bold text-blue-700">0</p>
                                <p className="text-sm">Total Batches</p>
                            </div>
                            <div className="p-4 bg-green-100 rounded">
                                <p className="font-bold text-green-700">0</p>
                                <p className="text-sm">This Month</p>
                            </div>
                        </div>
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