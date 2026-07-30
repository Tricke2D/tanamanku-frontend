'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/lib/api';
import Link from 'next/link';

interface HarvestFormData {
    harvest_date: string;
    quantity_kg: string;
    quality_grade: 'A' | 'B' | 'C';
    weather_condition: string;
    pest_notes: string;
}

export default function LogHarvestPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<HarvestFormData>({
        harvest_date: new Date().toISOString().split('T')[0],
        quantity_kg: '',
        quality_grade: 'A',
        weather_condition: 'sunny',
        pest_notes: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [batchCode, setBatchCode] = useState('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.quantity_kg || parseFloat(formData.quantity_kg) <= 0) {
                throw new Error('Quantity harus lebih dari 0');
            }

            const response = await apiCall('/api/farmer/batches', {
                method: 'POST',
                body: JSON.stringify({
                    harvest_date: formData.harvest_date,
                    quantity_kg: parseFloat(formData.quantity_kg),
                    quality_grade: formData.quality_grade,
                    weather_condition: formData.weather_condition,
                    pest_notes: formData.pest_notes || null,
                }),
            });

            console.log('✅ Batch created:', response);

            // Store QR data untuk ditampilkan
            setBatchCode(response.batch.batch_code);
            setQrCode(response.batch.qr_code_url);
            setSuccess(true);

            // ← KEY FIX: Reset form IMMEDIATELY (no setTimeout delay!)
            setFormData({
                harvest_date: new Date().toISOString().split('T')[0],
                quantity_kg: '',
                quality_grade: 'A',
                weather_condition: 'sunny',
                pest_notes: '',
            });

            // Hide success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);

        } catch (err: any) {
            console.error('Error:', err);
            setError(err.message || 'Gagal log harvest');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <Link href="/farmer" className="text-green-600 hover:text-green-700 font-bold mb-4 inline-block">
                    ← Kembali ke Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-green-700 mb-6">📋 Log New Harvest</h1>

                {success && qrCode && (
                    <div className="mb-6 p-6 bg-green-100 border-2 border-green-600 rounded-lg">
                        <h2 className="text-xl font-bold text-green-700 mb-4">✅ Harvest Logged Successfully!</h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Batch Code</p>
                                <p className="text-lg font-bold text-green-700 font-mono">{batchCode}</p>
                            </div>

                            <div className="flex justify-center p-4 bg-white rounded">
                                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = qrCode;
                                        link.download = `${batchCode}_QR.png`;
                                        link.click();
                                    }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                                >
                                    Download QR
                                </button>

                                <button
                                    onClick={() => router.push('/farmer/batches')}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
                                >
                                    View All Batches
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Harvest Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal Panen *
                            </label>
                            <input
                                type="date"
                                name="harvest_date"
                                value={formData.harvest_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Jumlah (kg) *
                            </label>
                            <input
                                type="number"
                                name="quantity_kg"
                                value={formData.quantity_kg}
                                onChange={handleChange}
                                placeholder="45.5"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                step="0.1"
                                min="0"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Quality Grade */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Grade Kualitas *
                            </label>
                            <select
                                name="quality_grade"
                                value={formData.quality_grade}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                disabled={loading}
                            >
                                <option value="A">A (Premium)</option>
                                <option value="B">B (Standar)</option>
                                <option value="C">C (Dasar)</option>
                            </select>
                        </div>

                        {/* Weather */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kondisi Cuaca *
                            </label>
                            <select
                                name="weather_condition"
                                value={formData.weather_condition}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                disabled={loading}
                            >
                                <option value="sunny">☀️ Cerah</option>
                                <option value="rainy">🌧️ Hujan</option>
                                <option value="cloudy">☁️ Mendung</option>
                            </select>
                        </div>

                        {/* Pest Notes */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Catatan Hama/Penyakit (opsional)
                            </label>
                            <textarea
                                name="pest_notes"
                                value={formData.pest_notes}
                                onChange={handleChange}
                                placeholder="Catat masalah apapun saat panen..."
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                        {loading ? 'Mencatat harvest...' : 'Log Harvest & Generate QR'}
                    </button>
                </form>
            </div>
        </div>
    );
}