'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiCall } from '@/lib/api';

export default function ExporterBatchDetailPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = params.id as string;

    const [batch, setBatch] = useState<any>(null);
    const [qualityTests, setQualityTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (batchId) {
            fetchBatchDetail();
        }
    }, [batchId]);

    const fetchBatchDetail = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiCall(`/api/exporter/batches/${batchId}`);
            setBatch(response.batch);
            setQualityTests(response.quality_tests || []);
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to load batch');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6 text-center">Loading batch detail...</div>;
    if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;
    if (!batch) return <div className="p-6 text-center">Batch not found</div>;

    return (
        <div className="min-h-screen bg-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/exporter/batches" className="text-blue-600 hover:text-blue-700 font-bold mb-6 inline-block">
                    ← Back to Batches
                </Link>

                <h1 className="text-3xl font-bold text-blue-700 mb-6">{batch.batch_code}</h1>

                {/* Batch Information Card */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-bold mb-4">📋 Batch Information</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Farm Name</p>
                            <p className="font-bold text-lg">{batch.farm_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Harvest Date</p>
                            <p className="font-bold text-lg">{new Date(batch.harvest_date).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Quantity</p>
                            <p className="font-bold text-lg">{batch.quantity_kg} kg</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Farmer Grade</p>
                            <span className={`inline-block px-3 py-1 rounded font-bold ${
                                batch.quality_grade === 'A' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                {batch.quality_grade}
              </span>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500 mb-1">Current Status</p>
                            <span className={`inline-block px-3 py-1 rounded font-bold ${
                                batch.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                    batch.status === 'testing' ? 'bg-yellow-100 text-yellow-700' :
                                        batch.status === 'passed' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                            }`}>
                {batch.status.toUpperCase()}
              </span>
                        </div>
                    </div>
                </div>

                {/* Quality Tests History */}
                {qualityTests.length > 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h2 className="text-xl font-bold mb-4">🧪 Quality Tests History</h2>
                        <div className="space-y-3">
                            {qualityTests.map((test) => (
                                <div key={test.id} className="p-4 bg-gray-50 rounded border-l-4 border-blue-500">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Test Type</p>
                                            <p className="font-bold">{test.test_type}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Grade</p>
                                            <span className={`inline-block px-3 py-1 rounded font-bold text-sm ${
                                                test.final_grade === 'A' ? 'bg-green-100 text-green-700' :
                                                    test.final_grade === 'B' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                            }`}>
                        {test.final_grade}
                      </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Moisture</p>
                                            <p className="font-bold">{test.moisture_content}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Defects</p>
                                            <p className="font-bold">{test.defect_count}</p>
                                        </div>
                                    </div>
                                    {test.notes && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-sm text-gray-600 italic">{test.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg mb-6">
                        <p className="text-blue-700">No quality tests yet for this batch.</p>
                    </div>
                )}

                {/* Action Button */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">🔬 Quality Testing</h2>
                    <Link
                        href={`/exporter/quality-test/${batch.id}`}
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
                    >
                        + Run Quality Test
                    </Link>
                </div>
            </div>
        </div>
    );
}