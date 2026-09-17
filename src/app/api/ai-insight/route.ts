import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { requests = [], total = 0, catCount = {}, topCatName = '', topLocName = '', topLocCount = 0, pendingCount = 0, acceptedCount = 0 } = body;

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        // หากไม่มี API Key ให้ตอบกลับเพื่อให้ Frontend ใช้ Rule-based Fallback
        if (!apiKey) {
            return NextResponse.json({
                success: false,
                isRealAI: false,
                message: 'ไม่พบ GEMINI_API_KEY ในไฟล์ .env.local',
            });
        }

        // เตรียมข้อมูลสรุปสำหรับส่งให้ AI (เพื่อประหยัด Token และให้ผลลัพธ์แม่นยำ)
        const sampleIssues = requests.slice(0, 30).map((r: any) => ({
            location: r.location || 'ไม่ระบุ',
            issue: r.issue_summary || 'ไม่ระบุ',
            status: r.status || 'รอรับเรื่อง',
        }));

        const promptText = `
คุณเป็นผู้เชี่ยวชาญด้านการบริหารจัดการอาคารและระบบสุขาภิบาล (Facility Maintenance Expert) 
หน้าที่ของคุณคือวิเคราะห์ข้อมูลสถิติการแจ้งซ่อมห้องน้ำประจำเดือนของหน่วยงาน เพื่อสรุปภาพรวมและให้คำแนะนำเชิงป้องกัน (Preventive Maintenance)

ข้อมูลสถิติประจำเดือนนี้:
- จำนวนการแจ้งซ่อมทั้งหมด: ${total} รายการ
- หมวดหมู่ที่มีการแจ้งซ่อม: ${JSON.stringify(catCount)}
- หมวดหมู่ที่เสียบ่อยที่สุด: ${topCatName || 'ไม่มีข้อมูล'}
- สถานที่ที่พบปัญหาบ่อยที่สุด: ${topLocName ? `${topLocName} (${topLocCount} ครั้ง)` : 'ไม่มี'}
- รอดำเนินการรับเรื่อง: ${pendingCount} รายการ
- รับเรื่องแล้ว: ${acceptedCount} รายการ
- ตัวอย่างรายการปัญหาที่ได้รับแจ้ง (ล่าสุด):
${sampleIssues.map((s: any, idx: number) => `${idx + 1}. [${s.location}] ${s.issue} (สถานะ: ${s.status})`).join('\n')}

คำสั่ง:
1. วิเคราะห์และสรุปภาพรวมปัญหาประจำเดือนในประโยคที่เข้าใจง่าย กระชับ ตรงประเด็น
2. ให้ข้อเสนอแนะเชิงป้องกันและแนวทางแก้ไขที่เป็นรูปธรรม 4-5 ข้อ (สามารถใช้ Markdown **ตัวหนา** เพื่อเน้นข้อความสำคัญได้)
3. ตอบกลับเป็น JSON เท่านั้น ตามรูปแบบนี้ ห้ามมีคำอธิบายอื่นนอก JSON:
{
  "summaryText": "ข้อความสรุปภาพรวมปัญหาประจำเดือน...",
  "suggestions": [
    "ข้อเสนอแนะที่ 1",
    "ข้อเสนอแนะที่ 2",
    "ข้อเสนอแนะที่ 3",
    "ข้อเสนอแนะที่ 4"
  ]
}
`.trim();

        // ลองเรียก Gemini Model (gemini-3.6-flash ล่าสุด)
        const models = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
        let aiResult = null;
        const errors: string[] = [];

        for (const model of models) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [
                                {
                                    parts: [{ text: promptText }],
                                }
                            ],
                            generationConfig: {
                                temperature: 0.4,
                                maxOutputTokens: 4096,
                                responseMimeType: 'application/json',
                            },
                        }),
                    }
                );

                if (!response.ok) {
                    const errData = await response.text();
                    errors.push(`[${model}] status ${response.status}: ${errData}`);
                    continue;
                }

                const data = await response.json();
                const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (rawText) {
                    try {
                        const parsed = JSON.parse(rawText.trim());
                        if (parsed.summaryText && Array.isArray(parsed.suggestions)) {
                            aiResult = parsed;
                            break;
                        } else {
                            errors.push(`[${model}] json missing fields: ${rawText}`);
                        }
                    } catch (e: any) {
                        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
                        try {
                            const parsed = JSON.parse(cleanJson);
                            if (parsed.summaryText && Array.isArray(parsed.suggestions)) {
                                aiResult = parsed;
                                break;
                            } else {
                                errors.push(`[${model}] clean json missing fields: ${cleanJson}`);
                            }
                        } catch (err2: any) {
                            errors.push(`[${model}] parse error: ${e.message}, raw: ${rawText}`);
                        }
                    }
                } else {
                    errors.push(`[${model}] no rawText in response: ${JSON.stringify(data)}`);
                }
            } catch (err: any) {
                errors.push(`[${model}] fetch catch: ${err.message}`);
            }
        }

        if (!aiResult) {
            console.warn('[AI Insight] Failed to generate with Gemini. Errors:', errors);
            return NextResponse.json({
                success: false,
                isRealAI: false,
                errors,
            });
        }

        return NextResponse.json({
            success: true,
            isRealAI: true,
            summaryText: aiResult.summaryText,
            suggestions: aiResult.suggestions,
        });
    } catch (error: any) {
        console.error('[API Route /api/ai-insight Error]:', error);
        return NextResponse.json(
            { success: false, isRealAI: false, error: error.message },
            { status: 500 }
        );
    }
}
