'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
// Hapus import apiCall karena tidak digunakan
// import { apiCall } from '@/lib/api';

// Import jsQR dengan cara yang benar
import jsQR from 'jsqr';

// Definisikan interface untuk type safety
interface BatchData {
    batch: {
        batch_code: string;
        farmer_name: string;
        harvest_date: string;
        quality_grade: string;
        quantity_kg: number;
        status: string;
        weather_condition: string;
        pest_notes: string;
    };
    quality_tests: QualityTest[];
    distribution_chain: DistributionStep[];
}

interface QualityTest {
    id: number;
    test_type: string;
    final_grade: string;
    moisture_content: number;
    defect_count: number;
    notes: string | null;
    test_date: string;
    certified_by: string;
}

interface DistributionStep {
    action_type: string;
    handler_name: string;
    handler_role: string;
    action_timestamp: string;
    notes: string | null;
}

export default function ScanPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [scanning, setScanning] = useState(true);
    const [batchData, setBatchData] = useState<BatchData | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [scanMethod, setScanMethod] = useState<'camera' | 'upload'>('camera');

    // Gunakan useCallback untuk menghindari dependency issues
    const handleScan = useCallback(async (batchCode: string) => {
        try {
            setLoading(true);
            setError('');
            const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${baseURL}/api/public/batch/${batchCode}`);

            if (!response.ok) {
                throw new Error('Batch not found');
            }

            const data = await response.json();
            setBatchData(data);
            setError('');
        } catch (err) {
            console.error('Scan error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Batch tidak ditemukan. Coba scan QR lain.';
            setError(errorMessage);
            setBatchData(null);
            setScanning(true);
        } finally {
            setLoading(false);
        }
    }, []);

    const scanQRCode = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !scanning) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const video = videoRef.current;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            ctx?.drawImage(video, 0, 0);
            const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

            if (imageData) {
                try {
                    const code = jsQR(imageData.data, imageData.width, imageData.height);

                    if (code && scanning) {
                        const url = new URL(code.data);
                        const batchCode = url.searchParams.get('batch');

                        if (batchCode) {
                            console.log(`✅ QR detected: ${batchCode}`);
                            handleScan(batchCode);
                            setScanning(false);
                            return;
                        }
                    }
                } catch (err) {
                    console.error('QR decode error:', err);
                }
            }
        }

        requestAnimationFrame(scanQRCode);
    }, [scanning, handleScan]);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
                scanQRCode();
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError('Unable to access camera. Make sure you allow camera permission.');
            setCameraActive(false);
        }
    }, [scanQRCode]);

    useEffect(() => {
        startCamera();
    }, [startCamera]);

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            setCameraActive(false);
        }
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            setError('');

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);

                    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
                    if (imageData) {
                        try {
                            const code = jsQR(imageData.data, imageData.width, imageData.height);

                            if (code) {
                                const url = new URL(code.data);
                                const batchCode = url.searchParams.get('batch');

                                if (batchCode) {
                                    console.log(`✅ QR detected from image: ${batchCode}`);
                                    handleScan(batchCode);
                                    return;
                                }
                            }
                            setError('No QR code found in the image. Please upload a valid QR code image.');
                            setLoading(false);
                        } catch (err) {
                            console.error('QR decode error:', err);
                            setError('Failed to decode QR code from image.');
                            setLoading(false);
                        }
                    }
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Upload error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to process image.';
            setError(errorMessage);
            setLoading(false);
        }
    };

    if (batchData) {
        return (
            <TransparencyView
                batch={batchData}
                onRescan={() => {
                    setBatchData(null);
                    setScanning(true);
                    startCamera();
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-green-600 to-green-800 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">🌱 TANAMANKU</h1>
                    <p className="text-green-100 text-lg">Coffee Supply Chain Transparency</p>
                </div>

                {/* Scan Method Selector */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setScanMethod('camera')}
                        className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
                            scanMethod === 'camera'
                                ? 'bg-white text-green-700'
                                : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                    >
                        📷 Camera
                    </button>
                    <button
                        onClick={() => setScanMethod('upload')}
                        className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
                            scanMethod === 'upload'
                                ? 'bg-white text-green-700'
                                : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                    >
                        📤 Upload Image
                    </button>
                </div>

                {/* Camera or Upload */}
                {scanMethod === 'camera' ? (
                    <>
                        {cameraActive && !error ? (
                            <div>
                                <div className="bg-black rounded-lg overflow-hidden mb-4 border-4 border-white shadow-lg">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        style={{ width: '100%', height: 'auto' }}
                                        className="w-full"
                                    />
                                </div>
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                                <p className="text-white text-center text-sm font-semibold mb-4">
                                    Point camera at QR code
                                </p>
                                <button
                                    onClick={() => {
                                        stopCamera();
                                        setScanning(false);
                                    }}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-bold transition"
                                >
                                    Close Camera
                                </button>
                            </div>
                        ) : error ? (
                            <div className="text-center">
                                <div className="p-6 bg-red-100 border-2 border-red-400 text-red-700 rounded-lg mb-4">
                                    <p className="font-bold mb-2">⚠️ Error</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setError('');
                                        startCamera();
                                    }}
                                    className="bg-white hover:bg-gray-100 text-green-700 font-bold px-6 py-2 rounded transition"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="text-center">
                                <div className="inline-block animate-spin">
                                    <div className="h-12 w-12 border-4 border-white border-r-transparent rounded-full"></div>
                                </div>
                                <p className="text-white mt-4 font-semibold">Scanning...</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="p-8 bg-white bg-opacity-20 rounded-lg mb-4 border-2 border-white">
                                    <p className="text-white text-lg mb-4">📷</p>
                                    <p className="text-white font-semibold">Enable Camera to Scan</p>
                                </div>
                                <button
                                    onClick={startCamera}
                                    className="w-full bg-white hover:bg-gray-100 text-green-700 font-bold py-3 px-6 rounded-lg transition"
                                >
                                    Start Scanning
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    // Upload Image Section
                    <div className="bg-white/10 rounded-lg p-8 border-2 border-dashed border-white/30">
                        <div className="text-center">
                            <p className="text-white text-4xl mb-4">🖼️</p>
                            <p className="text-white font-semibold mb-2">Upload QR Code Image</p>
                            <p className="text-white/70 text-sm mb-4">
                                Supported formats: PNG, JPG, JPEG
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                                className="w-full bg-white hover:bg-gray-100 text-green-700 font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Choose Image'}
                            </button>
                            {loading && (
                                <div className="mt-4 flex justify-center">
                                    <div className="inline-block animate-spin">
                                        <div className="h-8 w-8 border-4 border-white border-r-transparent rounded-full"></div>
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Home Link */}
                <div className="mt-8 text-center">
                    <Link href="/" className="text-white hover:text-green-100 text-sm font-semibold">
                        ← Back to Home
                    </Link>
                </div>

                {/* Info Card */}
                <div className="mt-8 p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-30">
                    <p className="text-white text-xs text-center">
                        Scan QR codes pada kemasan kopi untuk verify supply chain transparency.
                        Semua informasi dari farm hingga quality testing tersedia.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Transparency View Component
function TransparencyView({ batch, onRescan }: { batch: BatchData; onRescan: () => void }) {
    return (
        <div className="min-h-screen bg-linear-to-b from-green-50 to-blue-50 p-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={onRescan}
                        className="text-green-600 hover:text-green-700 font-bold text-sm mb-4 inline-block"
                    >
                        ← Scan Another Batch
                    </button>
                    <h1 className="text-3xl font-bold text-green-700">🌱 TANAMANKU</h1>
                    <p className="text-gray-600">Coffee Supply Chain Transparency Proof</p>
                </div>

                {/* Batch Header Card */}
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-600 mb-6">
                    <h2 className="text-2xl font-bold text-green-700 mb-4 font-mono">{batch.batch.batch_code}</h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Farmer</p>
                            <p className="font-bold text-gray-800">{batch.batch.farmer_name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Harvest Date</p>
                            <p className="font-bold text-gray-800">{new Date(batch.batch.harvest_date).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Quantity</p>
                            <p className="font-bold text-gray-800">{batch.batch.quantity_kg} kg</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Quality Grade</p>
                            <span
                                className={`inline-block px-3 py-1 rounded font-bold text-sm ${
                                    batch.batch.quality_grade === 'A'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                }`}
                            >
                                {batch.batch.quality_grade}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Weather</p>
                            <p className="font-bold text-gray-800">{batch.batch.weather_condition}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Status</p>
                            <span
                                className={`inline-block px-3 py-1 rounded font-bold text-sm ${
                                    batch.batch.status === 'passed'
                                        ? 'bg-green-100 text-green-700'
                                        : batch.batch.status === 'testing'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                {batch.batch.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Verification Badge */}
                    <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-600 rounded">
                        <p className="text-green-700 font-bold">✅ Verified on TANAMANKU Blockchain</p>
                        <p className="text-xs text-green-600 mt-1">
                            This batch has been tracked and verified through our supply chain system.
                        </p>
                    </div>

                    {batch.batch.pest_notes && (
                        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                            <p className="text-xs text-blue-600 font-semibold">NOTES</p>
                            <p className="text-sm text-blue-800 mt-1">{batch.batch.pest_notes}</p>
                        </div>
                    )}
                </div>

                {/* Quality Tests */}
                {batch.quality_tests && batch.quality_tests.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-bold text-green-700 mb-4">🧪 Quality Test Results</h2>
                        <div className="space-y-4">
                            {batch.quality_tests.map((test, idx) => (
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
                                        Certified by: {test.certified_by} on {new Date(test.test_date).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Distribution Chain */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-green-700 mb-4">🚚 Supply Chain Journey</h2>
                    {batch.distribution_chain && batch.distribution_chain.length > 0 ? (
                        <div className="space-y-4">
                            {batch.distribution_chain.map((step, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                                            {idx + 1}
                                        </div>
                                        {idx < batch.distribution_chain.length - 1 && (
                                            <div className="h-12 border-l-2 border-gray-300 my-1" />
                                        )}
                                    </div>
                                    <div className="pb-4 flex-1">
                                        <p className="font-bold text-green-700">{step.action_type}</p>
                                        <p className="text-sm text-gray-600">{step.handler_name} ({step.handler_role})</p>
                                        <p className="text-xs text-gray-500">{new Date(step.action_timestamp).toLocaleString('id-ID')}</p>
                                        {step.notes && <p className="text-sm text-gray-700 mt-1 italic">&quot;{step.notes}&quot;</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 py-4">Batch distribution data not yet available.</p>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center pb-6">
                    <button
                        onClick={onRescan}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
                    >
                        Scan Another Batch
                    </button>
                </div>
            </div>
        </div>
    );
}