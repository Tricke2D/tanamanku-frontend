'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, logout } from '@/lib/auth';
import Link from 'next/link';

export default function ExporterDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const userData = getUser();
        if (!userData) {
            router.push('/login');
            return;
        }
        setUser(userData);
    }, [router]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (!isClient || !user) return null;

    return (
        <div className="min-h-screen bg-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-blue-700 mb-2">🏢 Exporter Dashboard</h1>
                        <p className="text-gray-600">Selamat datang, {user.name}!</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold"
                    >
                        Logout
                    </button>
                </div>

                {/* Main Content */}
                <div className="grid gap-6">
                    {/* Quick Action Card */}
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
                        <h2 className="text-xl font-bold mb-4">📦 Batch Pipeline</h2>
                        <Link
                            href="/exporter/batches"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
                        >
                            View All Batches
                        </Link>
                    </div>

                    {/* Info Card */}
                    <div className="bg-blue-100 border-2 border-blue-600 p-6 rounded-lg">
                        <h2 className="text-lg font-bold text-blue-700 mb-2">📋 How it works:</h2>
                        <ol className="text-sm text-blue-700 space-y-1 ml-4 list-decimal">
                            <li>View all farmer batches in pipeline</li>
                            <li>Filter by status: New, Testing, Passed, Rejected, Exported</li>
                            <li>Click batch to see details & run quality test</li>
                            <li>Submit test results (moisture, defects, cupping score, grade)</li>
                            <li>System auto-updates batch status based on grade</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}