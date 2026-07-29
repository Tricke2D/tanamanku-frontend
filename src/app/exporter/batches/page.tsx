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
        fetchBatches();
    }, [filter]);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            setError('');
            const query = filter ? `?status=${filter}` : '';
            const response = await apiCall(`/api/exporter/batches${query}`);
            setBatches(response.batches || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
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
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-blue-700 mb-6">📦 Batch Pipeline</h1>

                {/* Filters */}
                <div className="mb-6 flex gap-2 flex-wrap">
                    {['new', 'testing', 'passed', 'exported'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded font-bold transition ${
                                filter === status ? 'bg-blue-600 text-white' : 'bg-white border-2 border-gray-300'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Batches Table */}
                {loading ? (
                    <div className="text-center py-8">Loading batches...</div>
                ) : error ? (
                    <div className="bg-red-100 p-6 rounded text-red-700">{error}</div>
                ) : batches.length === 0 ? (
                    <div className="bg-white p-8 rounded text-center">
                        <p className="text-gray-500">No batches with status "{filter}"</p>
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
                                <tr key={batch.id} className={`border-b ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
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