'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiCall } from '@/lib/api';

interface Batch {
    id: number;
    batch_code: string;
    harvest_date: string;
    quantity_kg: number;
    quality_grade: string;
    status: string;
    farm_name: string;
    created_at: string;
}

export default function ExporterBatchPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('new');

    useEffect(() => {
        console.log('🔍 useEffect triggered on list page');
        console.log('📡 Current filter:', filter);
        fetchBatches();
    }, [filter]);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            setError('');
            const query = filter ? `?status=${filter}` : '';
            const url = `/api/exporter/batches${query}`;

            console.log(`📡 Fetching: ${url}`);

            const response = await apiCall(url);

            console.log('✅ Response received:', response);
            console.log('📦 Batches count:', response.batches?.length || 0);

            setBatches(response.batches || []);
        } catch (err: any) {
            console.error('❌ Fetch error:', err);
            setError(err.message || 'Failed to load batches');
        } finally {
            setLoading(false);
            console.log('✅ fetchBatches completed');
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-blue-100 text-blue-700';
            case 'testing':
                return 'bg-yellow-100 text-yellow-700';
            case 'passed':
                return 'bg-green-100 text-green-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            case 'exported':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    // Loading state dengan spinner
    if (loading) {
        return (
            <div className="min-h-screen bg-blue-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-blue-700 mb-6">📦 Batch Pipeline</h1>
                    <div className="bg-white p-8 rounded-lg shadow text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500">Loading batches...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state dengan retry button
    if (error) {
        return (
            <div className="min-h-screen bg-blue-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-blue-700 mb-6">📦 Batch Pipeline</h1>
                    <div className="bg-red-100 border border-red-400 p-6 rounded-lg text-red-700">
                        <p className="font-bold">❌ Error:</p>
                        <p>{error}</p>
                        <button
                            onClick={() => fetchBatches()}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                <Link href="/exporter" className="text-blue-600 hover:text-blue-700 font-bold mb-4 inline-block">
                    ← Kembali ke Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-blue-700 mb-6">📦 Batch Pipeline</h1>

                {/* Filters */}
                <div className="mb-6 flex gap-2 flex-wrap">
                    {['new', 'testing', 'passed', 'rejected', 'exported'].map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                console.log(`🔍 Filter changed to: ${status}`);
                                setFilter(status);
                            }}
                            className={`px-4 py-2 rounded font-bold transition ${
                                filter === status ? 'bg-blue-600 text-white' : 'bg-white border-2 border-gray-300 hover:border-blue-400'
                            }`}
                        >
                            {status === 'exported' ? '🚚 Exported' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Batches Table */}
                {batches.length === 0 ? (
                    <div className="bg-white p-8 rounded shadow text-center">
                        <p className="text-gray-500">No batches with status "{filter}"</p>
                        <p className="text-sm text-gray-400 mt-2">Try changing the filter or create a new batch.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-blue-100 border-b-2 border-blue-300">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-blue-700">Batch Code</th>
                                <th className="px-6 py-4 text-left font-bold text-blue-700">Farmer</th>
                                <th className="px-6 py-4 text-left font-bold text-blue-700">Date</th>
                                <th className="px-6 py-4 text-left font-bold text-blue-700">Qty (kg)</th>
                                <th className="px-6 py-4 text-left font-bold text-blue-700">Quality</th>
                                <th className="px-6 py-4 text-left font-bold text-blue-700">Status</th>
                                <th className="px-6 py-4 text-left font-bold text-blue-700">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {batches.map((batch, i) => (
                                <tr key={batch.id} className={`border-b ${i % 2 === 0 ? 'bg-gray-50' : ''} hover:bg-blue-50`}>
                                    <td className="px-6 py-4 font-bold text-blue-700 font-mono">{batch.batch_code}</td>
                                    <td className="px-6 py-4">{batch.farm_name}</td>
                                    <td className="px-6 py-4 text-sm">{new Date(batch.harvest_date).toLocaleDateString('id-ID')}</td>
                                    <td className="px-6 py-4">{batch.quantity_kg}</td>
                                    <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded font-bold text-sm ${
                                                batch.quality_grade === 'A' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {batch.quality_grade}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded font-bold text-sm ${statusColor(batch.status)}`}>
                                                {batch.status}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/exporter/batches/${batch.id}`}
                                            className="text-blue-600 hover:text-blue-700 font-bold"
                                            onClick={() => console.log(`🔗 Navigating to: /exporter/batches/${batch.id}`)}
                                        >
                                            View →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}