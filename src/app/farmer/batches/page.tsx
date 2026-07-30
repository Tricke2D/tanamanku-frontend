'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiCall } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Batch {
    id: number;
    batch_code: string;
    harvest_date: string;
    quantity_kg: number;
    quality_grade: string;
    status: string;
    created_at: string;
}

export default function BatchListPage() {
    const router = useRouter();

    // All useState declarations first
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

    // Function declarations
    const fetchBatches = async () => {
        try {
            setLoading(true);
            setError('');
            const query = filter ? `?status=${filter}` : '';
            const response = await apiCall(`/api/farmer/batches${query}`);
            setBatches(response.batches || []);
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.message || 'Gagal load batches');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (batchId: number, batchCode: string) => {
        if (!confirm(`Delete batch ${batchCode}? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeleteLoading(batchId);
            await apiCall(`/api/farmer/batches/${batchId}`, { method: 'DELETE' });

            // Remove from list
            setBatches(batches.filter(b => b.id !== batchId));
            alert('Batch deleted successfully');
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setDeleteLoading(null);
        }
    };

    // useEffect after function declarations
    useEffect(() => {
        fetchBatches();
    }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen bg-green-50 p-6">
            <Link href="/farmer" className="text-green-600 hover:text-green-700 font-bold mb-4 inline-block">
                ← Kembali ke Dashboard
            </Link>

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-green-700">📦 My Batches</h1>
                    <Link
                        href="/farmer/harvest/new"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold"
                    >
                        + Log New Harvest
                    </Link>
                </div>

                {/* Filters */}
                <div className="mb-6 flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilter('')}
                        className={`px-4 py-2 rounded font-bold transition ${
                            filter === '' ? 'bg-green-600 text-white' : 'bg-white border-2 border-gray-300 hover:border-green-600'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('new')}
                        className={`px-4 py-2 rounded font-bold transition ${
                            filter === 'new' ? 'bg-green-600 text-white' : 'bg-white border-2 border-gray-300 hover:border-green-600'
                        }`}
                    >
                        New
                    </button>
                    <button
                        onClick={() => setFilter('testing')}
                        className={`px-4 py-2 rounded font-bold transition ${
                            filter === 'testing' ? 'bg-green-600 text-white' : 'bg-white border-2 border-gray-300 hover:border-green-600'
                        }`}
                    >
                        Testing
                    </button>
                    <button
                        onClick={() => setFilter('passed')}
                        className={`px-4 py-2 rounded font-bold transition ${
                            filter === 'passed' ? 'bg-green-600 text-white' : 'bg-white border-2 border-gray-300 hover:border-green-600'
                        }`}
                    >
                        Passed
                    </button>
                    <button
                        onClick={() => setFilter('exported')}
                        className={`px-4 py-2 rounded font-bold transition ${
                            filter === 'exported' ? 'bg-green-600 text-white' : 'bg-white border-2 border-gray-300 hover:border-green-600'
                        }`}
                    >
                        Exported
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white p-8 rounded-lg text-center text-gray-500">
                        Memuat batches...
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg">
                        Error: {error}
                    </div>
                ) : batches.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg text-center">
                        <p className="text-gray-500 mb-4">Belum ada batches. Mulai log panen kamu!</p>
                        <Link
                            href="/farmer/harvest/new"
                            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Log Harvest Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-100 border-b-2 border-green-300">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-bold text-green-700">Batch Code</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-green-700">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-green-700">Qty (kg)</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-green-700">Quality</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-green-700">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-green-700">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {batches.map((batch, index) => (
                                <tr key={batch.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : ''} hover:bg-green-50`}>
                                    <td className="px-6 py-4 font-bold text-green-700">{batch.batch_code}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(batch.harvest_date).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold">{batch.quantity_kg}</td>
                                    <td className="px-6 py-4">
                                      <span
                                          className={`px-3 py-1 rounded text-sm font-bold ${
                                              batch.quality_grade === 'A'
                                                  ? 'bg-green-100 text-green-700'
                                                  : batch.quality_grade === 'B'
                                                      ? 'bg-yellow-100 text-yellow-700'
                                                      : 'bg-orange-100 text-orange-700'
                                          }`}
                                      >
                                        {batch.quality_grade}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span
                                          className={`px-3 py-1 rounded text-sm font-bold ${
                                              batch.status === 'new'
                                                  ? 'bg-blue-100 text-blue-700'
                                                  : batch.status === 'testing'
                                                      ? 'bg-yellow-100 text-yellow-700'
                                                      : batch.status === 'passed'
                                                          ? 'bg-green-100 text-green-700'
                                                          : 'bg-purple-100 text-purple-700'
                                          }`}
                                      >
                                        {batch.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/farmer/batches/${batch.id}`}
                                                className="text-green-600 hover:text-green-700 font-bold text-sm"
                                            >
                                                View Details →
                                            </Link>
                                            {batch.status === 'new' && (
                                                <button
                                                    onClick={() => handleDelete(batch.id, batch.batch_code)}
                                                    disabled={deleteLoading === batch.id}
                                                    className="text-red-600 hover:text-red-700 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {deleteLoading === batch.id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            )}
                                        </div>
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