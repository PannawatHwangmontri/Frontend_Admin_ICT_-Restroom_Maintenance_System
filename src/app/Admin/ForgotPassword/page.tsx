'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
    // State สำหรับควบคุมขั้นตอนการทำงาน (1 = กรอกอีเมล, 2 = กรอก OTP, 3 = ตั้งรหัสผ่านใหม่)
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Form States
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Toggle สเตตัสเปิด/ปิด รหัสผ่าน
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // UI Feedback States
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ฟังก์ชันจัดการย้อนกลับไปหน้าลงชื่อเข้าใช้ พร้อมข้อความแจ้งเตือนยืนยัน
    const handleBackToLogin = (e: React.MouseEvent) => {
        e.preventDefault();
        const isConfirmed = window.confirm('คุณต้องการยกเลิกและกลับไปหน้าลงชื่อเข้าใช้ใช่หรือไม่?');
        if (isConfirmed) {
            window.location.href = '/Admin/Login';
        }
    };

    // ขั้นตอนที่ 1: ส่งคำขอรหัส OTP ไปยังอีเมล
    const handleSendOTP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!email.trim()) {
            setError('กรุณากรอกชื่อผู้ใช้หรืออีเมลของคุณ');
            setSuccessMsg('');
            return;
        }

        if (isLoading) return;
        setIsLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await fetch('/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'forgot-password',
                    email: email,
                }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.message || 'ไม่พบข้อมูลบัญชีผู้ใช้นี้ในระบบ');
            } else {
                setError('');
                setSuccessMsg('เราได้ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว');
                setStep(2); // เปลี่ยนไปขั้นตอนกรอก OTP
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsLoading(false);
        }
    };

    // ขั้นตอนที่ 2: ตรวจสอบรหัส OTP
    const handleVerifyOTP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!otp.trim()) {
            setError('กรุณากรอกรหัส OTP 6 หลัก');
            return;
        }

        if (otp.trim().length < 4) {
            setError('กรุณากรอกรหัส OTP ให้ครบถ้วน');
            return;
        }

        setError('');
        setSuccessMsg('');
        setStep(3); // ย้ายไปหน้าตั้งรหัสผ่านใหม่
    };

    // ขั้นตอนที่ 3: บันทึกรหัสผ่านใหม่
    const handleSaveNewPassword = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!newPassword.trim() || !confirmPassword.trim()) {
            setError('กรุณากรอกรหัสผ่านใหม่ให้ครบถ้วนทั้ง 2 ช่อง');
            return;
        }

        if (newPassword.length < 6) {
            setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
            return;
        }

        if (isLoading) return;
        setIsLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await fetch('/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reset-password',
                    email: email,
                    otp: otp,
                    newPassword: newPassword,
                }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
            } else {
                setSuccessMsg('ตั้งรหัสผ่านใหม่สำเร็จ! กำลังพาคุณไปหน้าลงชื่อเข้าใช้...');
                setTimeout(() => {
                    window.location.href = '/Admin/Login';
                }, 2000);
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

            {/* 2. Forgot Password Card อนิเมชันซูมออกมาจากมิติพื้นหลัง */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:p-6 md:p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[440px] bg-white shadow-2xl px-6 py-7 sm:p-10 flex flex-col justify-between min-h-[300px] sm:min-h-[340px] relative rounded-sm"
                >
                    <div>
                        {/* ปุ่มกลับไปหน้าลงชื่อเข้าใช้ (อยู่บนซ้ายมือของ Card) */}
                        <div className="mb-3">
                            <button
                                onClick={handleBackToLogin}
                                className="text-xs text-[#0067b8] hover:underline font-normal flex items-center gap-1 focus:outline-none"
                            >
                                ‹ กลับไปหน้าลงชื่อเข้าใช้
                            </button>
                        </div>

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

                        {/* ================= STEP 1: กรอกอีเมล ================= */}
                        {step === 1 && (
                            <>
                                <h1 className="text-xl sm:text-2xl font-semibold text-[#1b1b1b] mb-2">
                                    ลืมรหัสผ่าน
                                </h1>
                                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                    กรุณากรอกอีเมลของคุณที่ลงทะเบียนไว้ในระบบ เราจะส่งรหัส OTP สำหรับยืนยันตัวตนไปให้
                                </p>

                                {/* ฟอร์มกรอก อีเมล / ชื่อผู้ใช้ */}
                                <form onSubmit={handleSendOTP} className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError('');
                                                setSuccessMsg('');
                                            }}
                                            placeholder="ชื่อผู้ใช้ / อีเมล"
                                            className="w-full border-b border-slate-400 py-1.5 text-xs sm:text-sm focus:border-[#0067b8] focus:outline-none transition-colors placeholder:text-slate-400"
                                            autoFocus
                                        />
                                    </div>

                                    {/* ข้อความแจ้งเตือน Error */}
                                    {error && (
                                        <p className="text-xs text-[#e81123] font-normal leading-relaxed pt-0.5">
                                            {error}
                                        </p>
                                    )}

                                    {/* แถบปุ่มกด ถัดไป */}
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-2 bg-[#0067b8] text-white text-xs sm:text-sm hover:bg-[#005da6] transition-colors disabled:opacity-50 font-medium rounded-none"
                                        >
                                            {isLoading ? 'กำลังส่ง OTP...' : 'ถัดไป'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* ================= STEP 2: กรอกรหัส OTP ================= */}
                        {step === 2 && (
                            <>
                                <h1 className="text-xl sm:text-2xl font-semibold text-[#1b1b1b] mb-2">
                                    กรอกรหัส OTP
                                </h1>
                                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                    ระบบได้ส่งรหัส OTP ไปยังอีเมล <span className="font-semibold text-slate-700">{email}</span> แล้ว
                                </p>

                                {/* ฟอร์มกรอก OTP */}
                                <form onSubmit={handleVerifyOTP} className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => {
                                                setOtp(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="รหัส OTP 6 หลัก"
                                            className="w-full border-b border-slate-400 py-1.5 text-xs sm:text-sm tracking-widest focus:border-[#0067b8] focus:outline-none transition-colors placeholder:text-slate-400 placeholder:tracking-normal"
                                            autoFocus
                                        />
                                    </div>

                                    {/* ข้อความแจ้งเตือน Error */}
                                    {error && (
                                        <p className="text-xs text-[#e81123] font-normal leading-relaxed pt-0.5">
                                            {error}
                                        </p>
                                    )}

                                    {/* ข้อความแจ้งเตือน Success */}
                                    {successMsg && (
                                        <p className="text-xs text-[#107c41] font-normal leading-relaxed pt-0.5">
                                            {successMsg}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-4">
                                        <button
                                            type="button"
                                            onClick={handleSendOTP}
                                            disabled={isLoading}
                                            className="text-xs text-[#0067b8] hover:underline font-normal focus:outline-none disabled:opacity-50"
                                        >
                                            ส่งรหัส OTP อีกครั้ง
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-2 bg-[#0067b8] text-white text-xs sm:text-sm hover:bg-[#005da6] transition-colors disabled:opacity-50 font-medium rounded-none"
                                        >
                                            ถัดไป
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* ================= STEP 3: ตั้งรหัสผ่านใหม่ ================= */}
                        {step === 3 && (
                            <>
                                <h1 className="text-xl sm:text-2xl font-semibold text-[#1b1b1b] mb-2">
                                    ตั้งรหัสผ่านใหม่
                                </h1>
                                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                    กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชี <span className="font-semibold text-slate-700">{email}</span>
                                </p>

                                {/* ฟอร์มกำหนดรหัสผ่านใหม่ */}
                                <form onSubmit={handleSaveNewPassword} className="space-y-4">
                                    {/* ช่องรหัสผ่านใหม่ */}
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="รหัสผ่านใหม่"
                                            className="w-full border-b border-slate-400 py-1.5 pr-9 text-xs sm:text-sm focus:border-[#0067b8] focus:outline-none transition-colors placeholder:text-slate-400"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                            aria-label="Toggle Password Visibility"
                                        >
                                            {showNewPassword ? (
                                                /* ตาเปิด: แสดงเมื่อมองเห็นรหัสผ่าน (text) */
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.274 4.057 5.065 7 9.542 7 4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.064-7-9.542-7-4.477 0-8.268 2.943-9.542 7z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            ) : (
                                                /* ตาปิด (มีเส้นขีด): แสดงเมื่อซ่อนรหัสผ่าน (password) */
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {/* ช่องยืนยันรหัสผ่านใหม่ */}
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="ยืนยันรหัสผ่านใหม่"
                                            className="w-full border-b border-slate-400 py-1.5 pr-9 text-xs sm:text-sm focus:border-[#0067b8] focus:outline-none transition-colors placeholder:text-slate-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                            aria-label="Toggle Password Visibility"
                                        >
                                            {showConfirmPassword ? (
                                                /* ตาเปิด: แสดงเมื่อมองเห็นรหัสผ่าน (text) */
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.274 4.057 5.065 7 9.542 7 4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.064-7-9.542-7-4.477 0-8.268 2.943-9.542 7z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            ) : (
                                                /* ตาปิด (มีเส้นขีด): แสดงเมื่อซ่อนรหัสผ่าน (password) */
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {/* ข้อความแจ้งเตือน Error */}
                                    {error && (
                                        <p className="text-xs text-[#e81123] font-normal leading-relaxed pt-0.5">
                                            {error}
                                        </p>
                                    )}

                                    {/* ข้อความแจ้งเตือน Success */}
                                    {successMsg && (
                                        <p className="text-xs text-[#107c41] font-normal leading-relaxed pt-0.5">
                                            {successMsg}
                                        </p>
                                    )}

                                    {/* ปุ่มกดบันทึกรหัสผ่านใหม่ */}
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-2 bg-[#0067b8] text-white text-xs sm:text-sm hover:bg-[#005da6] transition-colors disabled:opacity-50 font-medium rounded-none"
                                        >
                                            {isLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}