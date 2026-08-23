import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const backendRes = await fetch(`${BACKEND_URL}/api/requests/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
    } catch (error) {
        console.error(`[API Route PATCH /api/requests/${params}] Error:`, error);
        return NextResponse.json(
            { success: false, message: 'ไม่สามารถเชื่อมต่อกับ Backend เพื่ออัปเดตข้อมูลได้' },
            { status: 503 }
        );
    }
}
