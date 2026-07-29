'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiCall } from '@/lib/api';
import Link from 'next/link';

interface Batch {
    id: number;
    batch_code: string;
    farm_name: string;
    harvest_date: string;
    quantity_kg: number;
    quality_grade: string;
    status: string;
}

interface QualityTestForm {
    test_type: string;
    moisture_content: string;
    defect_count: string;
    cupping_score: string;
    final_grade: 'A' | 'B' | 'C' | 'Rejected';
    notes: string;
}

export default function QualityTestPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = params.id as string;

    const [batch, setBatch] = useState<Batch | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState<QualityTestForm>({
        test_type: 'Cupping Test',
        moisture_content: '',
        defect_count: '0',
        cupping_score: '80',
        final_grade: 'A',
        notes: '',
    });

    useEffect(() => {
        fetchBatchDetail();
    }, [batchId]);

    const fetchBatchDetail = async () => {
        try {
            setLoading(true);
            const response = await apiCall(`/api/exporter/batches/${batchId}`);
            setBatch(response.batch);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFormLoading(true);

        try {
            // Validate
            if (!formData.moisture_content || parseFloat(formData.moisture_content) < 0 || parseFloat(formData.moisture_content) > 20) {
                throw new Error('Moisture content harus antara 0-20%');
            }
            if (parseInt(formData.defect_count) < 0) {
                throw new Error('Defect count tidak boleh negatif');
            }

            const response = await apiCall(`/api/exporter/quality-test/${batchId}`, {
                method: 'POST',
                body: JSON.stringify({
                    test_type: formData.test_type,
                    moisture_content: parseFloat(formData.moisture_content),
                    defect_count: parseInt(formData.defect_count),
                    cupping_score: parseFloat(formData.cupping_score) || 0,
                    final_grade: formData.final_grade,
                    notes: formData.notes || null,
                }),
            });

            setSuccess(true);
            setSuccessMessage(`✅ Quality test created! Batch status: ${response.batch_status}`);

            // Reset form
            setTimeout(() => {
                router.push('/exporter/batches');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Gagal create quality test');
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) return <div className="p-6 text-center">Memuat batch detail...</div>;
    if (error && !batch) return <div className="p-6 text-red-600 text-center">{error}</div>;
    if (!batch) return <div className="p-6 text-center">Batch tidak ditemukan</div>;

    return (
        <div className="min-h-screen bg-blue-50 p-6">
            <div className="max-w-2xl mx-auto">
                <Link href="/exporter/batches" className="text-blue-600 hover:text-blue-700 font-bold mb-6 inline-block">
                    ← Back to Batches
                </Link>

                <h1 className="text-3xl font-bold text-blue-700 mb-2">🧪 Quality Test</h1>
                <p className="text-gray-600 mb-6">{batch.batch_code} from {batch.farm_name}</p>

                {/* Batch Info Card */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-bold mb-4">Batch Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Farm</p>
                            <p className="font-bold">{batch.farm_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Harvest Date</p>
                            <p className="font-bold">{new Date(batch.harvest_date).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Quantity</p>
                            <p className="font-bold">{batch.quantity_kg} kg</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Farmer Grade</p>
                            <p className="font-bold">{batch.quality_grade}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Current Status</p>
                            <span
                                className={`inline-block px-3 py-1 rounded font-bold ${
                                    batch.status === 'new'
                                        ? 'bg-blue-100 text-blue-700'
                                        : batch.status === 'testing'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-green-100 text-green-700'
                                }`}
                            >
                {batch.status}
              </span>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-6 bg-green-100 border-2 border-green-600 rounded-lg">
                        <p className="text-green-700 font-bold">{successMessage}</p>
                        <p className="text-sm text-gray-600 mt-2">Redirecting to batch pipeline...</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Test Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Test Type *</label>
                            <select
                                name="test_type"
                                value={formData.test_type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                disabled={formLoading}
                            >
                                <option value="Cupping Test">Cupping Test</option>
                                <option value="Moisture Test">Moisture Test</option>
                                <option value="Defect Inspection">Defect Inspection</option>
                                <option value="Full Analysis">Full Analysis</option>
                            </select>
                        </div>

                        {/* Moisture Content */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Moisture Content (%) *</label>
                            <input
                                type="number"
                                name="moisture_content"
                                value={formData.moisture_content}
                                onChange={handleChange}
                                placeholder="11.5"
                                step="0.1"
                                min="0"
                                max="20"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={formLoading}
                            />
                            <p className="text-xs text-gray-500 mt-1">Ideal: 10-12%</p>
                        </div>

                        {/* Defect Count */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Defect Count *</label>
                            <input
                                type="number"
                                name="defect_count"
                                value={formData.defect_count}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={formLoading}
                            />
                        </div>

                        {/* Cupping Score */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cupping Score (0-100) *</label>
                            <input
                                type="number"
                                name="cupping_score"
                                value={formData.cupping_score}
                                onChange={handleChange}
                                placeholder="82.5"
                                step="0.5"
                                min="0"
                                max="100"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                disabled={formLoading}
                            />
                            <p className="text-xs text-gray-500 mt-1">A: 80+, B: 70-79, C: &lt;70</p>
                        </div>

                        {/* Final Grade */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Final Grade *</label>
                            <select
                                name="final_grade"
                                value={formData.final_grade}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                disabled={formLoading}
                            >
                                <option value="A">A (Premium - 80+)</option>
                                <option value="B">B (Standard - 70-79)</option>
                                <option value="C">C (Basic - &lt;70)</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Notes */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Test Notes (optional)</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Tasting notes, flavor profile, recommendations..."
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                disabled={formLoading}
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
                        disabled={formLoading}
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                        {formLoading ? 'Submitting test...' : 'Submit Quality Test'}
                    </button>
                </form>
            </div>
        </div>
    );
}