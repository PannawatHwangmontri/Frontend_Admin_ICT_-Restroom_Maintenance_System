"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface LiffProfile {
    displayName: string;
    pictureUrl?: string;
    userId: string;
}

export default function LiffPage() {
    const [profile, setProfile] = useState<LiffProfile | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const initLiff = async () => {
            const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

            if (!liffId) {
                setError("ไม่พบ LIFF ID ในการตั้งค่า");
                return;
            }

            try {
                const liff = (await import("@line/liff")).default;
                await liff.init({ liffId });

                if (liff.isLoggedIn()) {
                    const p = await liff.getProfile();
                    setProfile({
                        displayName: p.displayName,
                        pictureUrl: p.pictureUrl,
                        userId: p.userId,
                    });
                } else {
                    setError("ยังไม่ได้เข้าสู่ระบบผ่าน LINE");
                }
            } catch {
                setError("เกิดข้อผิดพลาดในการเชื่อมต่อ LINE");
            }
        };

        initLiff();
    }, []);

    return (
        <main className="min-h-screen flex items-center justify-center bg-green-50 p-4">
            <div className="relative bg-white p-10 shadow-2xl w-full max-w-[440px] flex flex-col items-center text-center">
                <div className="mb-6 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#06C755] rounded-sm flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm tracking-wider">LINE</span>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-800 tracking-wide">ICT Restroom System</h1>
                </div>

                {profile ? (
                    <div className="space-y-4 flex flex-col items-center">
                        {profile.pictureUrl && (
                            <Image
                                src={profile.pictureUrl}
                                alt={profile.displayName}
                                width={80}
                                height={80}
                                className="rounded-full"
                                unoptimized
                            />
                        )}

                        <strong className="text-gray-900">{profile.displayName}</strong>

                        <span className="text-gray-500 text-sm">{profile.userId}</span>
                    </div>
                ) : error ? (
                    <p className="text-red-600 text-sm font-medium" aria-live="assertive">
                        {error}
                    </p>
                ) : (
                    <p className="text-gray-600 text-sm">กำลังโหลดข้อมูล...</p>
                )}
            </div>
        </main>
    );
}