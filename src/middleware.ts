import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('auth_token')?.value;

    const isLoggedIn = Boolean(token);

    // ── ป้องกัน Dashboard routes ────────────────────────────────────
    // ถ้าไม่มี token แต่พยายามเข้า /Admin/Dashboard → redirect ไป Login
    if (pathname.startsWith('/Admin/Dashboard') && !isLoggedIn) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = '/Admin/Login';
        return NextResponse.redirect(loginUrl);
    }

    // ── ป้องกัน Login page ซ้ำซ้อน ─────────────────────────────────
    // ถ้ามี token อยู่แล้วแต่เข้า /Admin/Login → redirect ไป Dashboard
    if (pathname === '/Admin/Login' && isLoggedIn) {
        const dashboardUrl = req.nextUrl.clone();
        dashboardUrl.pathname = '/Admin/Dashboard/Overview';
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

// กำหนดว่า Middleware จะทำงานกับ path ไหนบ้าง
export const config = {
    matcher: [
        '/Admin/Dashboard/:path*',
        '/Admin/Login',
    ],
};
