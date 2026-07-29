'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiCall } from '@/lib/api';
import Link from 'next/link';

interface Batch {
    id: number;
    batch_code: string;
    harvest_date: string;
    quantity_kg: number;
    quality_grade: string;
    weather_condition: string;
    pest_notes: string;
    qr_code_url: string;
    status: string;
    farm_name: string;
    location_lat: number;
    location_lng: number;
}

interface DistributionStep {
    id: number;
    action_type: string;
    handler_name: string;
    handler_role: string;
    action_timestamp: string;
    location_lat: number;
    location_lng: number;
    notes: string;
}

export default function BatchDetailPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = params.id as string;

    const [batch, setBatch] = useState<Batch | null>(null);
    const [distribution, setDistribution] = useState<DistributionStep[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (batchId) fetchBatchDetail();
    }, [batchId]);

    const fetchBatchDetail = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiCall(`/api/farmer/batches/${batchId}`);
            setBatch(response.batch);
            setDistribution(response.distribution_chain || []);
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.message || 'Gagal load batch detail');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6 text-center">Memuat batch detail...</div>;
    if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;
    if (!batch) return <div className="p-6 text-center">Batch tidak ditemukan</div>;

    return (
        <div className="min-h-screen bg-green-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link href="/farmer/batches" className="text-green-600 hover:text-green-700 font-bold mb-6 inline-block">
                    ← Kembali
                </Link>

                <h1 className="text-3xl font-bold text-green-700 mb-6">📦 Batch Details</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Batch Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Batch Card */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-2xl font-bold text-green-700 mb-6 font-mono">{batch.batch_code}</h2>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Tanggal Panen</p>
                                    <p className="font-bold text-lg">{new Date(batch.harvest_date).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Jumlah</p>
                                    <p className="font-bold text-lg">{batch.quantity_kg} kg</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Grade Kualitas</p>
                                    <span
                                        className={`inline-block px-4 py-1 rounded font-bold ${
                                            batch.quality_grade === 'A' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                    >
                    {batch.quality_grade}
                  </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Cuaca</p>
                                    <p className="font-bold text-lg">{batch.weather_condition}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500 mb-1">Catatan Hama/Penyakit</p>
                                    <p className="font-bold">{batch.pest_notes || 'Tidak ada'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500 mb-1">Status</p>
                                    <span
                                        className={`inline-block px-4 py-2 rounded font-bold ${
                                            batch.status === 'new'
                                                ? 'bg-blue-100 text-blue-700'
                                                : batch.status === 'testing'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-green-100 text-green-700'
                                        }`}
                                    >
                    {batch.status.toUpperCase()}
                  </span>
                                </div>
                            </div>
                        </div>

                        {/* Distribution Timeline */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold mb-6">🚚 Supply Chain Journey</h2>
                            {distribution.length === 0 ? (
                                <p className="text-gray-500 text-center py-6">Belum ada data distribusi. Batch sedang menunggu processing.</p>
                            ) : (
                                <div className="space-y-4">
                                    {distribution.map((step, index) => (
                                        <div key={step.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                                                    {index + 1}
                                                </div>
                                                {index < distribution.length - 1 && (
                                                    <div className="h-16 border-l-3 border-gray-300 my-1" />
                                                )}
                                            </div>
                                            <div className="pb-4 flex-1">
                                                <p className="font-bold text-green-700 text-lg">{step.action_type}</p>
                                                <p className="text-sm text-gray-600">{step.handler_name} ({step.handler_role})</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(step.action_timestamp).toLocaleString('id-ID')}
                                                </p>
                                                {step.notes && (
                                                    <p className="text-sm text-gray-700 mt-2 italic">{step.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: QR Code */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow sticky top-6">
                            <h2 className="text-lg font-bold mb-6">🔐 QR Code</h2>
                            {batch.qr_code_url && (
                                <>
                                    <div className="bg-gray-100 p-4 rounded flex justify-center mb-4 border-2 border-gray-300">
                                        <img src={batch.qr_code_url} alt="QR Code" className="w-40 h-40" />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = batch.qr_code_url;
                                            link.download = `${batch.batch_code}_QR.png`;
                                            link.click();
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-3 transition"
                                    >
                                        Download QR
                                    </button>
                                    <p className="text-xs text-gray-500 text-center">
                                        Scan untuk verify batch (transparency proof untuk pembeli)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}