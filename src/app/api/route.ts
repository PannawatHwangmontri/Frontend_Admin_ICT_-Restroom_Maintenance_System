import { NextRequest, NextResponse } from 'next/server';

// URL ของ Backend จาก Environment Variable (server-side เท่านั้น)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, email, password, otp, newPassword, new_password } = body;

        // ======================================================
        // 1. ACTION: LOGIN → ส่งไปที่ POST /api/login ของ Backend
        // ======================================================
        if (action === 'login') {
            const backendRes = await fetch(`${BACKEND_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await backendRes.json();

            if (!backendRes.ok || !data.success) {
                return NextResponse.json(
                    { success: false, message: data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
                    { status: backendRes.status }
                );
            }

            // สร้าง Response พร้อม set HttpOnly Cookie เพื่อเก็บ JWT token
            const token = data.data?.token;
            const response = NextResponse.json({
                success: true,
                message: 'เข้าสู่ระบบสำเร็จ',
            });

            if (token) {
                // HttpOnly cookie: JavaScript ฝั่ง client อ่านไม่ได้ (ปลอดภัยจาก XSS)
                response.cookies.set('auth_token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 8, // 8 ชั่วโมง (ตรงกับ JWT_EXPIRES_IN ของ Backend)
                    path: '/',
                });
            }

            return response;
        }

        // ======================================================
        // 2. ACTION: FORGOT-PASSWORD → POST /api/forgot-password
        // ======================================================
        if (action === 'forgot-password') {
            const backendRes = await fetch(`${BACKEND_URL}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await backendRes.json();
            return NextResponse.json(data, { status: backendRes.status });
        }

        // ======================================================
        // 3. ACTION: RESET-PASSWORD → POST /api/reset-password
        // ======================================================
        if (action === 'reset-password') {
            const backendRes = await fetch(`${BACKEND_URL}/api/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp,
                    new_password: newPassword || new_password,
                }),
            });

            const data = await backendRes.json();
            return NextResponse.json(data, { status: backendRes.status });
        }

        // ======================================================
        // 4. ACTION: LOGOUT → ลบ Cookie
        // ======================================================
        if (action === 'logout') {
            const response = NextResponse.json({
                success: true,
                message: 'ออกจากระบบเรียบร้อยแล้ว',
            });

            // ลบ Cookie โดย set maxAge = 0
            response.cookies.set('auth_token', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 0,
                path: '/',
            });

            return response;
        }

        return NextResponse.json(
            { success: false, message: 'Action ไม่ถูกต้อง' },
            { status: 400 }
        );

    } catch (error) {
        console.error('[API Route] Error:', error);
        return NextResponse.json(
            { success: false, message: 'ไม่สามารถเชื่อมต่อกับ Backend ได้ กรุณาตรวจสอบการเชื่อมต่อ' },
            { status: 503 }
        );
    }
}
