'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 1. Import useRouter

export default function LoginPage() {
    const router = useRouter(); // 2. เรียกใช้งาน router
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // สเตตัสเปิด/ปิด รหัสผ่าน
    const [rememberMe, setRememberMe] = useState(false);     // สเตตัสจดจำรหัสผ่าน
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ฟังก์ชันสำหรับจัดการเข้าสู่ระบบ
    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน');
            return;
        }

        if (isLoading) return;
        setIsLoading(true);
        setError('');

        try {
            // ส่งทั้ง action: 'login' และ 'verify-password' รวมถึงส่งค่า email เพื่อให้ตรงกับ Backend
            const res = await fetch('/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'login',
                    email: username,
                    username: username,
                    password: password,
                    rememberMe: rememberMe
                }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            } else {
                // 3. เปลี่ยนหน้าไปยัง Dashboard
                router.push('/Admin/Dashboard/Overview');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto bg-slate-900 flex flex-col justify-between font-sans select-none">

            {/* 1. ภาพพื้นหลังแบบแสดงผลเต็มสัดส่วน */}
            <div
                className="absolute inset-0 bg-[length:100%_100%] bg-center bg-no-repeat z-0"
                style={{ backgroundImage: `url('/photo/ict.png')` }}
            />

            {/* Overlay ด้านบนและ โลโก้ ICT มุมซ้ายบน */}
            <div className="relative z-10 p-4 sm:p-6">
                <img
                    src="/photo/ict-logo.png"
                    alt="ICT Logo"
                    className="absolute top-4 left-4 sm:top-6 sm:left-6 w-12 sm:w-16 h-auto object-contain"
                />
            </div>

            {/* 2. Login Card อนิเมชันซูมออกมาจากมิติพื้นหลัง - ปรับ Padding Responsive ขอบจอมือถือให้สมดุล */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:p-6 md:p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[440px] bg-white shadow-2xl px-6 py-7 sm:p-10 flex flex-col justify-between min-h-[300px] sm:min-h-[340px] relative rounded-sm"
                >
                    <div>
                        {/* Header Logo & Title */}
                        <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
                            <img
                                src="/photo/ict-logo.png"
                                alt="ICT Logo"
                                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                            />
                            <span className="text-[#8b278d] font-bold text-base sm:text-lg tracking-tight">
                                ICT Restroom System
                            </span>
                        </div>

                        <h1 className="text-xl sm:text-2xl font-semibold text-[#1b1b1b] mb-5 sm:mb-6">
                            ลงชื่อเข้าใช้
                        </h1>

                        {/* ฟอร์มกรอก User และ Password */}
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="ชื่อผู้ใช้ / อีเมล"
                                    className="w-full border-b border-slate-400 py-1.5 text-xs sm:text-sm focus:border-[#0067b8] focus:outline-none transition-colors placeholder:text-slate-400"
                                    autoFocus
                                />
                            </div>

                            {/* ช่องกรอก Password พร้อม Icon รูปตาสำหรับเปิด/ปิด */}
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="รหัสผ่าน"
                                    className="w-full border-b border-slate-400 py-1.5 pr-9 text-xs sm:text-sm focus:border-[#0067b8] focus:outline-none transition-colors placeholder:text-slate-400 [&::-ms-reveal]:hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                    aria-label="Toggle Password Visibility"
                                >
                                    {showPassword ? (
                                        /* ตาเปิด: แสดงรหัสผ่าน */
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.274 4.057 5.065 7 9.542 7 4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.064-7-9.542-7-4.477 0-8.268 2.943-9.542 7z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ) : (
                                        /* ตาปิด (ตาขีด): ซ่อนรหัสผ่าน */
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* ข้อความแจ้งเตือน Error (อยู่ใต้ช่องกรอกรหัสผ่านทันที) */}
                            {error && (
                                <p className="text-xs text-[#e81123] font-normal leading-relaxed pt-0.5">
                                    {error}
                                </p>
                            )}

                            {/* จดจำรหัสผ่าน (ซ้าย) & ลืมรหัสผ่าน (ขวา) */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#0067b8] focus:ring-[#0067b8] cursor-pointer"
                                    />
                                    <span className="text-xs text-slate-600 hover:text-slate-800">
                                        จดจำรหัสผ่าน
                                    </span>
                                </label>

                                <Link
                                    href="/Admin/ForgotPassword"
                                    className="text-xs text-[#0067b8] hover:underline font-normal"
                                >
                                    ลืมรหัสผ่าน?
                                </Link>
                            </div>

                            {/* ปุ่มกดเข้าสู่ระบบ */}
                            <div className="flex justify-end pt-3">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full sm:w-auto px-8 py-2 bg-[#0067b8] text-white text-xs sm:text-sm hover:bg-[#005da6] transition-colors disabled:opacity-50 font-medium"
                                >
                                    {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}