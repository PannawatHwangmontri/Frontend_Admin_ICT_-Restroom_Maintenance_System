import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(req: NextRequest) {
    try {
        const backendRes = await fetch(`${BACKEND_URL}/api/requests`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
    } catch (error) {
        console.error('[API Route GET /api/requests] Error:', error);
        return NextResponse.json(
            { success: false, message: 'ไม่สามารถเชื่อมต่อกับ Backend ได้' },
            { status: 503 }
        );
    }
}
