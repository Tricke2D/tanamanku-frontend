'use client';

import { useRouter } from 'next/navigation';
import { getUser, logout } from '@/lib/auth';

export default function ExporterDashboard() {
    const router = useRouter();
    const user = getUser();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-blue-700 mb-2">📦 Exporter Dashboard</h1>
                <p className="text-gray-600 mb-6">Welcome, {user?.name}!</p>

                <div className="grid gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">Batch Pipeline</h2>
                        <div className="flex gap-4 text-center">
                            <div className="flex-1 p-3 bg-blue-100 rounded">
                                <p className="font-bold text-blue-700">0</p>
                                <p className="text-sm">New</p>
                            </div>
                            <div className="flex-1 p-3 bg-yellow-100 rounded">
                                <p className="font-bold text-yellow-700">0</p>
                                <p className="text-sm">Testing</p>
                            </div>
                            <div className="flex-1 p-3 bg-green-100 rounded">
                                <p className="font-bold text-green-700">0</p>
                                <p className="text-sm">Ready</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4">Recent Batches</h2>
                        <p className="text-gray-500">No batches yet.</p>
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