'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAuthenticated } from '@/lib/auth';

interface User {
    id: number;
    email: string;
    name: string;
    role: 'farmer' | 'exporter' | 'admin';
}

export default function Home() {
    const router = useRouter();

    const [isClient, setIsClient] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        // Only run on client
        setIsClient(true);

        const auth = isAuthenticated();
        const userData = getUser();

        if (auth && userData) {
            setAuthenticated(true);
            setUser(userData);

            // Redirect based on role
            const redirectMap: Record<string, string> = {
                farmer: '/farmer',
                exporter: '/exporter',
                admin: '/admin',
            };

            router.push(redirectMap[userData.role] || '/');
        }
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
            <div className="max-w-2xl text-center">
                <h1 className="mb-4 text-5xl font-bold text-green-700">
                    🌱 TANAMANKU
                </h1>

                <p className="mb-8 text-xl text-gray-600">
                    Blockchain Coffee Supply Chain Transparency Platform
                </p>

                <p className="mb-8 text-gray-600">
                    Transparansi Kopi Kerinci dari Petani ke Dunia
                </p>

                <div className="flex justify-center gap-4">
                    <a
                        href="/login"
                        className="rounded-lg bg-green-600 px-8 py-3 font-bold text-white transition hover:bg-green-700"
                    >
                        Login
                    </a>

                    <a
                        href="/register"
                        className="rounded-lg bg-blue-600 px-8 py-3 font-bold text-white transition hover:bg-blue-700"
                    >
                        Daftar
                    </a>
                </div>

                {isClient && authenticated && user && (
                    <div className="mt-8 rounded-lg border-2 border-green-600 bg-green-100 p-4">
                        <p className="text-green-700">
                            Sudah login sebagai: <strong>{user.name}</strong> ({user.role})
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}