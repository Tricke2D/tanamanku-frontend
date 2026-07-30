'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Hapus useRouter
import Link from 'next/link';
import { apiCall } from '@/lib/api';

// Definisikan interface untuk type safety
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

interface QualityTest {
    id: number;
    test_type: string;
    final_grade: string;
    moisture_content: number;
    defect_count: number;
    notes: string | null;
    test_date: string;
}

export default function ExporterBatchDetailPage() {
    const params = useParams();
    const batchId = params.id as string;

    const [batch, setBatch] = useState<Batch | null>(null);
    const [qualityTests, setQualityTests] = useState<QualityTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('🔍 useEffect triggered');
        console.log('batchId from params:', batchId);

        if (batchId) {
            console.log('✅ batchId exists, calling fetchBatchDetail');
            // Gunakan void untuk mengabaikan promise
            void fetchBatchDetail();
        } else {
            console.log('❌ batchId missing!');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [batchId]);

    const fetchBatchDetail = async () => {
        console.log('🔴 fetchBatchDetail START');
        console.log('batchId:', batchId);

        try {
            console.log('🔴 Try block started');
            setLoading(true);
            setError('');

            console.log('🔴 About to call API...');
            console.log('URL:', `/api/exporter/batches/${batchId}`);

            const response = await apiCall(`/api/exporter/batches/${batchId}`);

            console.log('🟢 API responded:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', Object.keys(response || {}));

            // Validasi response
            if (!response.batch) {
                throw new Error('Response missing batch field!');
            }

            setBatch(response.batch);
            setQualityTests(response.quality_tests || []);

            console.log('🟢 State updated - batch:', response.batch);
            console.log('🟢 State updated - qualityTests:', response.quality_tests);

        } catch (err) {
            console.error('🔴 Fetch error:', err);
            // Handle error dengan type checking
            const errorMessage = err instanceof Error ? err.message : 'Failed to load batch';
            console.error('Error message:', errorMessage);
            if (err instanceof Error) {
                console.error('Error stack:', err.stack);
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
            console.log('🔴 fetchBatchDetail COMPLETED');
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
                                            batch.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-purple-100 text-purple-700'
                            }`}>
                                {batch.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quality Tests History */}
                {qualityTests.length > 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h2 className="text-xl font-bold text-blue-700 mb-4">🧪 Quality Test Results</h2>

                        {/* Info box: Quality testing sudah dilakukan */}
                        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                            <p className="text-blue-700 font-bold">ℹ️ Quality Testing Sudah Dilakukan</p>
                            <p className="text-sm text-blue-600 mt-2">
                                Setiap batch hanya dapat ditest sekali saja. Jika ingin merevisi hasil testing,
                                harap menghubungi farmer terkait untuk menambah batch baru.
                            </p>
                        </div>

                        {/* Quality tests history */}
                        <div className="space-y-4">
                            {qualityTests.map((test, idx) => (
                                <div key={idx} className="p-4 bg-gray-50 rounded border-l-4 border-blue-500">
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <div>
                                            <p className="text-xs text-gray-500">Test Type</p>
                                            <p className="font-bold">{test.test_type}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Grade</p>
                                            <span
                                                className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                                                    test.final_grade === 'A'
                                                        ? 'bg-green-100 text-green-700'
                                                        : test.final_grade === 'B'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {test.final_grade}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Moisture</p>
                                            <p className="font-bold">{test.moisture_content}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Defects</p>
                                            <p className="font-bold">{test.defect_count}</p>
                                        </div>
                                    </div>
                                    {test.notes && (
                                        <p className="text-sm text-gray-600 italic mt-2">&quot;{test.notes}&quot;</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                        Tested: {new Date(test.test_date).toLocaleDateString('id-ID')}
                                    </p>
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

                    {qualityTests.length > 0 ? (
                        // Batch sudah tested
                        <div className="p-4 bg-gray-100 rounded text-gray-700">
                            <p className="font-bold">✅ Quality test sudah dilakukan</p>
                            <p className="text-sm mt-1">Testing hanya dapat dilakukan sekali per batch.</p>
                        </div>
                    ) : (
                        // Batch belum tested
                        <Link
                            href={`/exporter/quality-test/${batch.id}`}
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
                        >
                            + Run Quality Test
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}