'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOpenMobileMenu } from '@/components/MobileMenuContext';
import {
    LayoutDashboard,
    Wrench,
    Clock,
    Users,
    LogOut,
    Menu,
    Bot,
    User,
    Droplets,
    Zap,
    ShieldAlert,
    CopyCheck,
    Lightbulb,
    ChevronRight,
    X
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// ข้อมูลจำลอง 31 วัน ตามภาพตัวอย่าง
const chartData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    let count = 0;
    if (day === 8) count = 4;
    if (day === 18) count = 1;
    if (day === 25) count = 10;
    if (day === 26) count = 5;
    return { day: day.toString(), count };
});

// ข้อมูลจำลองสรุปปัญหาแยกตามหมวดหมู่ (พร้อมรายการย่อยทั้งหมดตามจำนวนจริง)
const categorySummary = [
    {
        title: 'ระบบน้ำ',
        icon: Droplets,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50/70',
        borderColor: 'border-blue-100',
        totalCount: 10,
        items: [
            {
                name: 'ก๊อกน้ำอ่างล้างมือเสีย 4 ชุด',
                count: 4,
                subItems: [
                    { id: '#AW1-01', location: 'ห้องน้ำหญิง ชั้น 1 โซน A', detail: 'ก๊อกน้ำอ่างล้างมือเสีย 1 ชุด', time: '20/07/2026 10:00 น.', status: 'รับเรื่อง' },
                    { id: '#AW1-02', location: 'ห้องน้ำหญิง ชั้น 2 โซน A', detail: 'ก๊อกน้ำอ่างล้างมือเสีย 1 ชุด', time: '20/07/2026 10:30 น.', status: 'รับเรื่อง' },
                    { id: '#AM1-03', location: 'ห้องน้ำชาย ชั้น 1 โซน A', detail: 'ก๊อกน้ำอ่างล้างมือเสีย 1 ชุด', time: '20/07/2026 11:15 น.', status: 'รับเรื่อง' },
                    { id: '#AM1-04', location: 'ห้องน้ำชาย ชั้น 2 โซน A', detail: 'ก๊อกน้ำอ่างล้างมือเสีย 1 ชุด', time: '20/07/2026 11:45 น.', status: 'รับเรื่อง' },
                ]
            },
            {
                name: 'ท่อน้ำรั่ว 3 จุด',
                count: 3,
                subItems: [
                    { id: '#AW1-05', location: 'ห้องน้ำหญิง ชั้น 1 โซน B', detail: 'ท่อน้ำรั่ว 1 จุด ใต้เคาน์เตอร์', time: '20/07/2026 09:15 น.', status: 'รับเรื่อง' },
                    { id: '#AM1-06', location: 'ห้องน้ำชาย ชั้น 3 โซน A', detail: 'ท่อน้ำรั่วซึม บริเวณวาล์ว', time: '20/07/2026 13:20 น.', status: 'รับเรื่อง' },
                    { id: '#AM1-07', location: 'ห้องน้ำชาย ชั้น 1 โซน B', detail: 'ท่อน้ำทิ้งรั่วซึม', time: '20/07/2026 14:05 น.', status: 'รับเรื่อง' },
                ]
            },
            {
                name: 'สายฉีดชำระเสีย 3 ชุด',
                count: 3,
                subItems: [
                    { id: '#AW1-08', location: 'ห้องน้ำหญิง ชั้น 2 โซน B', detail: 'สายฉีดชำระเสีย 1 ชุด', time: '20/07/2026 08:30 น.', status: 'รับเรื่อง' },
                    { id: '#AM1-09', location: 'ห้องน้ำชาย ชั้น 2 โซน A', detail: 'สายฉีดชำระเสีย 1 ชุด', time: '20/07/2026 10:10 น.', status: 'รับเรื่อง' },
                    { id: '#AM1-10', location: 'ห้องน้ำชาย ชั้น 1 โซน A', detail: 'สายฉีดชำระเสีย 1 ชุด', time: '20/07/2026 12:45 น.', status: 'รับเรื่อง' },
                ]
            },
        ],
    },
    {
        title: 'สุขภัณฑ์',
        icon: Wrench,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50/70',
        borderColor: 'border-purple-100',
        totalCount: 10,
        items: [
            {
                name: 'อ่างล้างมือชำรุด 5 ชุด',
                count: 5,
                subItems: [
                    { id: '#BW1-01', location: 'ห้องน้ำหญิง ชั้น 1 โซน A', detail: 'อ่างล้างมือชำรุด 1 ชุด', time: '20/07/2026 09:00 น.', status: 'รับเรื่อง' },
                    { id: '#BW1-02', location: 'ห้องน้ำหญิง ชั้น 1 โซน B', detail: 'อ่างล้างมือชำรุด 1 ชุด', time: '20/07/2026 09:30 น.', status: 'รับเรื่อง' },
                    { id: '#BW1-03', location: 'ห้องน้ำหญิง ชั้น 2 โซน A', detail: 'อ่างล้างมือชำรุด 1 ชุด', time: '20/07/2026 10:00 น.', status: 'รับเรื่อง' },
                    { id: '#BM1-04', location: 'ห้องน้ำชาย ชั้น 1 โซน A', detail: 'อ่างล้างมือชำรุด 1 ชุด', time: '20/07/2026 11:00 น.', status: 'รับเรื่อง' },
                    { id: '#BM1-05', location: 'ห้องน้ำชาย ชั้น 2 โซน A', detail: 'อ่างล้างมือชำรุด 1 ชุด', time: '20/07/2026 11:30 น.', status: 'รับเรื่อง' },
                ]
            },
            {
                name: 'โถส้วมชำรุด 3 ชุด',
                count: 3,
                subItems: [
                    { id: '#BW1-06', location: 'ห้องน้ำหญิง ชั้น 1 โซน A', detail: 'โถส้วมชำรุด กดน้ำไม่ลง', time: '20/07/2026 08:45 น.', status: 'รับเรื่อง' },
                    { id: '#BM1-07', location: 'ห้องน้ำชาย ชั้น 1 โซน A', detail: 'โถส้วมชำรุด วาล์วค้าง', time: '20/07/2026 09:50 น.', status: 'รับเรื่อง' },
                    { id: '#BM1-08', location: 'ห้องน้ำชาย ชั้น 3 โซน A', detail: 'โถส้วมชำรุด 1 ชุด', time: '20/07/2026 12:15 น.', status: 'รับเรื่อง' },
                ]
            },
            {
                name: 'ฝารองนั่งชำรุด 2 ชุด',
                count: 2,
                subItems: [
                    { id: '#BW1-09', location: 'ห้องน้ำหญิง ชั้น 2 โซน A', detail: 'ฝารองนั่งแตกหัก', time: '20/07/2026 10:20 น.', status: 'รับเรื่อง' },
                    { id: '#BM1-10', location: 'ห้องน้ำชาย ชั้น 2 โซน B', detail: 'ฝารองนั่งหลุด', time: '20/07/2026 13:00 น.', status: 'รับเรื่อง' },
                ]
            },
        ],
    },
    {
        title: 'ระบบไฟฟ้า',
        icon: Zap,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50/70',
        borderColor: 'border-amber-100',
        totalCount: 9,
        items: [
            {
                name: 'ไฟในห้องน้ำไม่ติด 4 ดวง',
                count: 4,
                subItems: [
                    { id: '#EW1-01', location: 'ห้องน้ำหญิง ชั้น 1 โซน A', detail: 'ไฟในห้องน้ำไม่ติด 1 ดวง', time: '20/07/2026 08:15 น.', status: 'รับเรื่อง' },
                    { id: '#EW1-02', location: 'ห้องน้ำหญิง ชั้น 3 โซน B', detail: 'ไฟในห้องน้ำไม่ติด 1 ดวง', time: '20/07/2026 09:40 น.', status: 'รับเรื่อง' },
                    { id: '#EM1-03', location: 'ห้องน้ำชาย ชั้น 1 โซน A', detail: 'ไฟในห้องน้ำไม่ติด 1 ดวง', time: '20/07/2026 10:15 น.', status: 'รับเรื่อง' },
                    { id: '#EM1-04', location: 'ห้องน้ำชาย ชั้น 2 โซน B', detail: 'ไฟในห้องน้ำไม่ติด 1 ดวง', time: '20/07/2026 14:30 น.', status: 'รับเรื่อง' },
                ]
            },
            {
                name: 'หลอดไฟเสีย 3 ดวง',
                count: 3,
                subItems: [
                    { id: '#EW1-05', location: 'ห้องน้ำหญิง ชั้น 2 โซน A', detail: 'หลอดไฟเสีย 1 ดวง', time: '20/07/2026 09:00 น.', status: 'รับเรื่อง' },
                    { id: '#EM1-06', location: 'ห้องน้ำชาย ชั้น 1 โซน B', detail: 'หลอดไฟเสีย 1 ดวง', time: '20/07/2026 11:20 น.', status: 'รับเรื่อง' },
                    { id: '#EM1-07', location: 'ห้องน้ำชาย ชั้น 3 โซน A', detail: 'หลอดไฟเสีย 1 ดวง', time: '20/07/2026 13:50 น.', status: 'รับเรื่อง' },
                ]
            },
            {
                name: 'ไฟกระพริบ 2 ดวง',
                count: 2,
                subItems: [
                    { id: '#EW1-08', location: 'ห้องน้ำหญิง ชั้น 1 โซน A', detail: 'ไฟกระพริบ ถี่มาก', time: '20/07/2026 10:05 น.', status: 'รับเรื่อง' },
                    { id: '#EM1-09', location: 'ห้องน้ำชาย ชั้น 2 โซน A', detail: 'ไฟกระพริบ ไม่สว่าง', time: '20/07/2026 12:00 น.', status: 'รับเรื่อง' },
                ]
            },
        ],
    },
];

// ข้อมูลจำลองรายการแจ้งเรื่องซ้ำ (ปรับแก้ให้รายการที่ 1 เป็น "แจ้งแล้ว" และรายการซ้ำอื่นเป็น "ไม่รับเรื่อง")
const duplicateReports = [
    {
        id: 1,
        title: 'สายฉีดชำระห้องที่ 1 ชำรุด ห้องน้ำชาย ชั้น 2 โซน A',
        count: 6,
        lastReported: '10 นาทีที่แล้ว',
        subItems: [
            { id: '#REP-01', location: 'ห้องน้ำชาย ชั้น 2 โซน A (ห้องที่ 1)', detail: 'สายฉีดชำระชำรุด น้ำรั่วซึม', time: '20/07/2026 10:50 น.', status: 'รับเรื่อง' },
            { id: '#REP-02', location: 'ห้องน้ำชาย ชั้น 2 โซน A (ห้องที่ 1)', detail: 'สายฉีดชำระชำรุด Head แตก', time: '20/07/2026 10:45 น.', status: 'ไม่รับเรื่อง' },
            { id: '#REP-03', location: 'ห้องน้ำชาย ชั้น 2 โซน A (ห้องที่ 1)', detail: 'สายฉีดชำระชำรุด กดไม่ลง', time: '20/07/2026 10:30 น.', status: 'ไม่รับเรื่อง' },
            { id: '#REP-04', location: 'ห้องน้ำชาย ชั้น 2 โซน A (ห้องที่ 1)', detail: 'สายฉีดชำระชำรุด น้ำไม่ไหล', time: '20/07/2026 10:15 น.', status: 'ไม่รับเรื่อง' },
            { id: '#REP-05', location: 'ห้องน้ำชาย ชั้น 2 โซน A (ห้องที่ 1)', detail: 'สายฉีดชำระชำรุด', time: '20/07/2026 09:50 น.', status: 'ไม่รับเรื่อง' },
            { id: '#REP-06', location: 'ห้องน้ำชาย ชั้น 2 โซน A (ห้องที่ 1)', detail: 'สายฉีดชำระชำรุด', time: '20/07/2026 09:30 น.', status: 'ไม่รับเรื่อง' },
        ]
    },
    {
        id: 2,
        title: 'โถส้วมห้องที่ 1 ชำรุด ห้องน้ำหญิง ชั้น 1',
        count: 4,
        lastReported: '45 นาทีที่แล้ว',
        subItems: [
            { id: '#REP-07', location: 'ห้องน้ำหญิง ชั้น 1 (ห้องที่ 1)', detail: 'โถส้วมชำรุด กดไม่ลง', time: '20/07/2026 10:15 น.', status: 'รับเรื่อง' },
            { id: '#REP-08', location: 'ห้องน้ำหญิง ชั้น 1 (ห้องที่ 1)', detail: 'โถส้วมชำรุด น้ำค้าง', time: '20/07/2026 10:00 น.', status: 'ไม่รับเรื่อง' },
            { id: '#REP-09', location: 'ห้องน้ำหญิง ชั้น 1 (ห้องที่ 1)', detail: 'โถส้วมชำรุด กดไม่ลง', time: '20/07/2026 09:40 น.', status: 'ไม่รับเรื่อง' },
            { id: '#REP-10', location: 'ห้องน้ำหญิง ชั้น 1 (ห้องที่ 1)', detail: 'โถส้วมชำรุด', time: '20/07/2026 09:15 น.', status: 'ไม่รับเรื่อง' },
        ]
    },
    {
        id: 3,
        title: 'สายฉีดชำระห้องที่ 1 ชำรุด ห้องน้ำชาย ชั้น 3',
        count: 3,
        lastReported: '2 ชั่วโมงที่แล้ว',
        subItems: [
            { id: '#REP-11', location: 'ห้องน้ำชาย ชั้น 3 (ห้องที่ 1)', detail: 'สายฉีดชำระรั่ว', time: '20/07/2026 09:00 น.', status: 'รับเรื่อง' },
            { id: '#REP-12', location: 'ห้องน้ำชาย ชั้น 3 (ห้องที่ 1)', detail: 'สายฉีดชำระหลุด', time: '20/07/2026 08:45 น.', status: 'ไม่รับเรื่อง' },
            { id: '#REP-13', location: 'ห้องน้ำชาย ชั้น 3 (ห้องที่ 1)', detail: 'สายฉีดชำระชำรุด', time: '20/07/2026 08:30 น.', status: 'ไม่รับเรื่อง' },
        ]
    },
    {
        id: 4,
        title: 'อ่างล้างมือ 2 ชำรุด ห้องน้ำหญิง ชั้น 2',
        count: 2,
        lastReported: '5 ชั่วโมงที่แล้ว',
        subItems: [
            { id: '#REP-14', location: 'ห้องน้ำหญิง ชั้น 2 (อ่างที่ 2)', detail: 'อ่างล้างมือระบายน้ำช้า', time: '20/07/2026 06:00 น.', status: 'รับเรื่อง' },
            { id: '#REP-15', location: 'ห้องน้ำหญิง ชั้น 2 (อ่างที่ 2)', detail: 'อ่างล้างมือตัน', time: '20/07/2026 05:30 น.', status: 'ไม่รับเรื่อง' },
        ]
    },
    {
        id: 5,
        title: 'หลอดไฟเสีย 1 ดวง ห้องน้ำชาย ชั้น 1',
        count: 2,
        lastReported: '1 วันที่แล้ว',
        subItems: [
            { id: '#REP-16', location: 'ห้องน้ำชาย ชั้น 1', detail: 'หลอดไฟดับสนิท', time: '19/07/2026 15:00 น.', status: 'รับเรื่อง' },
            { id: '#REP-17', location: 'ห้องน้ำชาย ชั้น 1', detail: 'หลอดไฟเสีย', time: '19/07/2026 14:00 น.', status: 'ไม่รับเรื่อง' },
        ]
    },
];

// Helper Function สร้าง subItems สำรองหากข้อมูลไม่ครบ
const getSubItems = (item: any) => {
    if (item.subItems && item.subItems.length > 0) return item.subItems;
    const count = item.count || 1;
    return Array.from({ length: count }, (_, i) => ({
        id: `#REP-${String(i + 1).padStart(2, '0')}`,
        location: item.title || `${item.category || 'ทั่วไป'} - จุดที่ ${i + 1}`,
        detail: item.name || item.title || 'รายการแจ้งความเสียหาย',
        time: item.lastReported || '20/07/2026 10:00 น.',
        status: i === 0 ? 'รับเรื่อง' : 'ไม่รับเรื่อง'
    }));
};

const normalizeStatus = (status: any) => {
    if (['รับเรื่อง', 'แจ้งแล้ว', 'กำลังดำเนินการ', 'เสร็จสิ้น'].includes(status)) return 'รับเรื่อง';
    if (['ไม่รับเรื่อง', 'ยกเลิก'].includes(status)) return 'ไม่รับเรื่อง';
    return 'รอรับเรื่อง';
};

// Custom Component สำหรับจุดกราฟ
const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.count > 0) {
        const isDay26 = payload.day === '26';
        const textX = isDay26 ? cx + 8 : cx;
        const textY = isDay26 ? cy - 8 : cy - 12;

        return (
            <g>
                <circle cx={cx} cy={cy} r={4.5} fill="#6B21A8" stroke="#FFFFFF" strokeWidth={2} />
                <text
                    x={textX}
                    y={textY}
                    fill="#6B21A8"
                    fontSize={10.5}
                    fontWeight="600"
                    textAnchor={isDay26 ? 'start' : 'middle'}
                >
                    {payload.count} ครั้ง
                </text>
            </g>
        );
    }
    return null;
};

// Custom Component สำหรับแกน X
const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={12} textAnchor="middle" fill="#4B5563" fontSize={11}>
                {payload.value}
            </text>
            {payload.value === '31' && (
                <text x={20} y={0} dy={12} textAnchor="start" fill="#6B21A8" fontSize={11} fontWeight="600">
                    วัน
                </text>
            )}
        </g>
    );
};

export default function Dashboard() {
    const openMobileMenu = useOpenMobileMenu();

    // State สำหรับข้อมูลแจ้งซ่อมจริงจาก DB
    const [rawRequests, setRawRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ดึงข้อมูลจริงจาก Backend API (เฉพาะครั้งแรกที่แสดง Loader เพื่อไม่ให้ UI กระตุก)
    const fetchRequests = async (isInitial = false) => {
        try {
            if (isInitial) setIsLoading(true);
            const res = await fetch('/api/requests', { cache: 'no-store' });
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                setRawRequests(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch requests in Overview:', error);
        } finally {
            if (isInitial) setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchRequests(true);

        const refreshOnReturn = () => {
            if (document.visibilityState === 'visible') fetchRequests(false);
        };

        window.addEventListener('focus', refreshOnReturn);
        document.addEventListener('visibilitychange', refreshOnReturn);
        const refreshInterval = window.setInterval(refreshOnReturn, 15000);

        return () => {
            window.removeEventListener('focus', refreshOnReturn);
            document.removeEventListener('visibilitychange', refreshOnReturn);
            window.clearInterval(refreshInterval);
        };
    }, []);

    // 1. คำนวณ Metric Cards (เดือนนี้)
    const metrics = React.useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const currentMonthReqs = rawRequests.filter(r => {
            const d = new Date(r.reported_at || Date.now());
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });

        const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const prevMonthReqs = rawRequests.filter(r => {
            const d = new Date(r.reported_at || Date.now());
            return d.getFullYear() === prevMonthDate.getFullYear() && d.getMonth() === prevMonthDate.getMonth();
        });

        const totalThisMonth = currentMonthReqs.length;
        const totalPrevMonth = prevMonthReqs.length;

        let diffPercent = 0;
        if (totalPrevMonth > 0) {
            diffPercent = Math.round(((totalThisMonth - totalPrevMonth) / totalPrevMonth) * 100);
        } else if (totalThisMonth > 0) {
            diffPercent = 100;
        }

        const pendingCount = currentMonthReqs.filter(r => normalizeStatus(r.status) === 'รอรับเรื่อง').length;
        const acceptedCount = currentMonthReqs.filter(r => normalizeStatus(r.status) === 'รับเรื่อง').length;
        const rejectedCount = currentMonthReqs.filter(r => normalizeStatus(r.status) === 'ไม่รับเรื่อง').length;

        return {
            totalThisMonth: rawRequests.length > 0 ? totalThisMonth : 0,
            diffPercent,
            pendingCount: rawRequests.length > 0 ? pendingCount : 0,
            acceptedCount: rawRequests.length > 0 ? acceptedCount : 0,
            rejectedCount: rawRequests.length > 0 ? rejectedCount : 0,
        };
    }, [rawRequests]);

    // 1.1 รายการเรื่องที่รอรับจาก DB ในเดือนปัจจุบัน
    const pendingRequests = React.useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        return rawRequests
            .filter(r => {
                const d = new Date(r.reported_at || Date.now());
                return d.getFullYear() === currentYear && d.getMonth() === currentMonth && normalizeStatus(r.status) === 'รอรับเรื่อง';
            })
            .sort((a, b) => new Date(b.reported_at || 0).getTime() - new Date(a.reported_at || 0).getTime())
            .map(r => {
                const d = new Date(r.reported_at || Date.now());
                const timeStr = !isNaN(d.getTime())
                    ? d.toLocaleString('th-TH', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) + ' น.'
                    : 'ไม่ระบุเวลา';

                return {
                    id: r.ticket_number || `#REQ-${r.id}`,
                    dbId: r.id,
                    location: r.location || 'ไม่ระบุสถานที่',
                    detail: r.issue_summary || 'ไม่มีรายละเอียดปัญหา',
                    priority: r.priority || 'ปกติ',
                    time: timeStr,
                    status: 'รอรับเรื่อง'
                };
            });
    }, [rawRequests]);

    // 2. คำนวณข้อมูลกราฟเส้น (31 วันในเดือนนี้)
    const chartData = React.useMemo(() => {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const countsByDay: { [day: number]: number } = {};

        rawRequests.forEach(r => {
            const d = new Date(r.reported_at || Date.now());
            if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
                const dayNum = d.getDate();
                countsByDay[dayNum] = (countsByDay[dayNum] || 0) + 1;
            }
        });

        return Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            return { day: day.toString(), count: countsByDay[day] || 0 };
        });
    }, [rawRequests]);

    // 3. คำนวณสรุปแยกหมวดหมู่จาก DB จริง
    const categorySummary = React.useMemo(() => {
        const defaultCats: { [key: string]: any } = {
            'ระบบน้ำ': { title: 'ระบบน้ำ', icon: Droplets, color: 'text-blue-600', bgColor: 'bg-blue-50/70', borderColor: 'border-blue-100', itemsMap: {} },
            'สุขภัณฑ์': { title: 'สุขภัณฑ์', icon: Wrench, color: 'text-purple-600', bgColor: 'bg-purple-50/70', borderColor: 'border-purple-100', itemsMap: {} },
            'ระบบไฟฟ้า': { title: 'ระบบไฟฟ้า', icon: Zap, color: 'text-amber-600', bgColor: 'bg-amber-50/70', borderColor: 'border-amber-100', itemsMap: {} },
        };

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        rawRequests.forEach(r => {
            const reportedDate = new Date(r.reported_at || Date.now());
            if (reportedDate.getFullYear() !== currentYear || reportedDate.getMonth() !== currentMonth) {
                return;
            }

            const summary = r.issue_summary || '';
            let catKey = 'ระบบน้ำ';
            if (summary.includes('ไฟ') || summary.includes('หลอดไฟ') || summary.includes('ปลั๊ก') || summary.includes('สวิตช์')) {
                catKey = 'ระบบไฟฟ้า';
            } else if (
                summary.includes('ส้วม') ||
                summary.includes('โถ') ||
                summary.includes('อ่าง') ||
                summary.includes('กระจก') ||
                summary.includes('ประตู') ||
                summary.includes('ชักโครก') ||
                summary.includes('ฝารองนั่ง') ||
                summary.includes('สุขภัณฑ์')
            ) {
                catKey = 'สุขภัณฑ์';
            }

            const problemName = summary.trim() || 'ไม่มีรายละเอียดปัญหา';
            if (!defaultCats[catKey].itemsMap[problemName]) {
                defaultCats[catKey].itemsMap[problemName] = [];
            }

            const timeStr = reportedDate.toLocaleString('th-TH', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }) + ' น.';

            defaultCats[catKey].itemsMap[problemName].push({
                id: r.ticket_number || `#REQ-${r.id}`,
                location: r.location || 'ไม่ระบุสถานที่',
                detail: r.issue_summary || 'ไม่มีรายละเอียด',
                time: timeStr,
                status: normalizeStatus(r.status)
            });
        });

        return Object.values(defaultCats).map(cat => {
            const items = Object.entries(cat.itemsMap).map(([name, subItems]: [string, any]) => ({
                name: `${name} (${subItems.length} รายการ)`,
                count: subItems.length,
                subItems
            }));

            const totalCount = items.reduce((acc, curr) => acc + curr.count, 0);

            return {
                title: cat.title,
                icon: cat.icon,
                color: cat.color,
                bgColor: cat.bgColor,
                borderColor: cat.borderColor,
                totalCount,
                items: items.length > 0 ? items : [{ name: 'ไม่มีเรื่องแจ้งซ่อมในหมวดนี้', count: 0, subItems: [] }]
            };
        });
    }, [rawRequests]);

    // 4. คำนวณรายการแจ้งซ้ำจาก DB จริง (เฉพาะเดือนปัจจุบัน)
    const duplicateReports = React.useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const groupMap: { [key: string]: any[] } = {};

        rawRequests.forEach(r => {
            const reportedDate = new Date(r.reported_at || Date.now());
            if (reportedDate.getFullYear() !== currentYear || reportedDate.getMonth() !== currentMonth) {
                return;
            }

            const key = `${r.location || ''} - ${r.issue_summary || ''}`;
            if (!groupMap[key]) groupMap[key] = [];
            groupMap[key].push(r);
        });

        const duplicates = Object.entries(groupMap)
            .filter(([_, items]) => items.length > 1)
            .map(([title, items], index) => {
                const sorted = items.sort((a, b) => new Date(b.reported_at || 0).getTime() - new Date(a.reported_at || 0).getTime());
                const latestDate = sorted[0].reported_at ? new Date(sorted[0].reported_at) : new Date();
                const lastReported = latestDate.toLocaleString('th-TH', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                }) + ' น.';

                const subItems = sorted.map(item => {
                    const d = item.reported_at ? new Date(item.reported_at) : new Date();
                    return {
                        id: item.ticket_number || `#REQ-${item.id}`,
                        location: item.location || 'ไม่ระบุสถานที่',
                        detail: item.issue_summary || 'ไม่มีรายละเอียด',
                        time: d.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' น.',
                        status: normalizeStatus(item.status)
                    };
                });

                return {
                    id: index + 1,
                    title: title,
                    count: items.length,
                    lastReported,
                    subItems
                };
            })
            .sort((a, b) => b.count - a.count);

        return duplicates;
    }, [rawRequests]);

    // 5. คำนวณ AI Insight จาก DB จริง (rule-based analysis)
    const aiInsight = React.useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const monthReqs = rawRequests.filter(r => {
            const d = new Date(r.reported_at || Date.now());
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });

        const total = monthReqs.length;

        // วิเคราะห์หมวดหมู่
        const catCount: { [key: string]: number } = { 'ระบบน้ำ': 0, 'สุขภัณฑ์': 0, 'ระบบไฟฟ้า': 0 };
        monthReqs.forEach(r => {
            const s = r.issue_summary || '';
            if (s.includes('ไฟ') || s.includes('หลอดไฟ') || s.includes('ปลั๊ก') || s.includes('สวิตช์')) {
                catCount['ระบบไฟฟ้า']++;
            } else if (
                s.includes('ส้วม') ||
                s.includes('โถ') ||
                s.includes('อ่าง') ||
                s.includes('กระจก') ||
                s.includes('ประตู') ||
                s.includes('ชักโครก') ||
                s.includes('ฝารองนั่ง') ||
                s.includes('สุขภัณฑ์')
            ) {
                catCount['สุขภัณฑ์']++;
            } else {
                catCount['ระบบน้ำ']++;
            }
        });

        const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];
        const topCatName = topCat ? topCat[0] : 'ระบบน้ำ';
        const topCatCount = topCat ? topCat[1] : 0;
        const topCatPct = total > 0 ? Math.round((topCatCount / total) * 100) : 0;

        // วิเคราะห์สถานที่
        const locCount: { [key: string]: number } = {};
        monthReqs.forEach(r => {
            const loc = r.location || 'ไม่ระบุสถานที่';
            locCount[loc] = (locCount[loc] || 0) + 1;
        });
        const topLoc = Object.entries(locCount).sort((a, b) => b[1] - a[1])[0];
        const topLocName = topLoc ? topLoc[0] : null;
        const topLocCount = topLoc ? topLoc[1] : 0;

        // รายการรอรับเรื่อง
        const pendingCount = monthReqs.filter(r => normalizeStatus(r.status) === 'รอรับเรื่อง').length;
        // อัตราการรับเรื่อง
        const acceptedCount = monthReqs.filter(r => normalizeStatus(r.status) === 'รับเรื่อง').length;
        const acceptRate = total > 0 ? Math.round((acceptedCount / total) * 100) : 0;

        // รายการแจ้งซ้ำ (สถานที่+ปัญหาเดิม)
        const dupGroups = Object.values(
            monthReqs.reduce((acc: { [k: string]: any[] }, r) => {
                const k = `${r.location || ''}-${r.issue_summary || ''}`;
                if (!acc[k]) acc[k] = [];
                acc[k].push(r);
                return acc;
            }, {})
        ).filter(g => g.length > 2);

        // สร้างข้อเสนอแนะ (rule-based)
        const suggestions: string[] = [];

        if (topCatCount > 0) {
            suggestions.push(`ควรตรวจเช็คและบำรุงรักษาอุปกรณ์ **${topCatName}** เชิงป้องกัน เนื่องจากมีการแจ้งซ่อมสูงสุด ${topCatCount} ครั้งในเดือนนี้ (${topCatPct}% ของทั้งหมด)`);
        }
        if (topLocName && topLocCount >= 2) {
            suggestions.push(`**${topLocName}** มีปัญหาซ้ำ ${topLocCount} รายการ ควรพิจารณาตรวจสอบโครงสร้างระบบให้ครอบคลุม`);
        }
        if (pendingCount > 0) {
            suggestions.push(`มีรายการ **รอรับเรื่อง ${pendingCount} รายการ** ในเดือนนี้ ควรดำเนินการให้ครบโดยเร็ว`);
        }
        if (dupGroups.length > 0) {
            suggestions.push(`ตรวจพบรายการแจ้งซ้ำ ${dupGroups.length} กลุ่ม ควรพิจารณาซ่อมแบบถาวรเพื่อลดการแจ้งซ้ำ`);
        }
        if (catCount['ระบบไฟฟ้า'] >= 3) {
            suggestions.push(`หลอดไฟ/ระบบไฟฟ้ามีปัญหา ${catCount['ระบบไฟฟ้า']} ครั้ง ควรพิจารณาเปลี่ยนยกเซ็ตในโซนที่มีปัญหาซ้ำ`);
        }
        if (suggestions.length === 0) {
            suggestions.push('สถานะโดยรวมของเดือนนี้อยู่ในเกณฑ์ปกติ ยังไม่พบจุดเสี่ยงที่ต้องดำเนินการเร่งด่วน');
        }

        // สร้างข้อความสรุป
        let summaryText = '';
        if (total === 0) {
            summaryText = 'ยังไม่มีการแจ้งซ่อมในเดือนนี้';
        } else {
            summaryText = `เดือนนี้มีการแจ้งซ่อมทั้งหมด ${total} รายการ`;
            if (topLocName && topLocCount >= 2) {
                summaryText += ` โดยสถานที่ที่มีปัญหาบ่อยที่สุดคือ ${topLocName} (${topLocCount} รายการ)`;
            }
            summaryText += ` หมวดหมู่ที่มีปัญหามากที่สุดคือ ${topCatName} (${topCatPct}%)`;
            summaryText += ` อัตราการรับเรื่อง ${acceptRate}%`;
        }

        return { summaryText, suggestions, total };
    }, [rawRequests]);

    // State สำหรับ Popup / Modal รายละเอียดการแจ้งซ่อม
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const menuItems = [
        { title: 'Dashboard Overview', icon: LayoutDashboard, active: true },
        { title: 'รายการแจ้งซ่อม', icon: Wrench, active: false },
        { title: 'รายงานความคืบหน้า', icon: Clock, active: false },
        { title: 'สถานะห้องน้ำ', icon: Users, active: false },
    ];

    return (
        <div className="flex min-h-screen bg-[#F6F0FE] font-sans text-gray-800 relative overflow-x-hidden">
            {/* ---------------- Main Content ---------------- */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full min-w-0">
                {/* Top Navbar Header */}
                <header className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={openMobileMenu}
                            className="md:hidden p-2 rounded-lg hover:bg-purple-200/60 text-[#4C1D95] shrink-0"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#4C1D95] truncate">
                            Dashboard Overview
                        </h2>
                    </div>

                    {/* ปุ่มผู้ใช้งาน */}
                    <div className="flex items-center gap-3 shrink-0 relative">
                        <span className="text-sm font-bold text-gray-900 hidden sm:inline">Admin</span>
                        <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-black shadow-sm overflow-hidden shrink-0">
                            <User className="w-5 h-5 fill-black text-black" />
                        </div>
                    </div>
                </header>

                {/* ---------------- Summary Metric Cards (4 Cards) ---------------- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white border-2 border-[#7C3AED] rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                            เรื่องแจ้งทั้งหมด (เดือนนี้)
                        </p>
                        <div className="text-4xl font-semibold text-[#5607cc] mb-2">{metrics.totalThisMonth}</div>
                        <p className="text-xs text-purple-700 font-semibold flex items-center gap-1">
                            <span>{metrics.diffPercent >= 0 ? `↗ ${metrics.diffPercent}%` : `↘ ${Math.abs(metrics.diffPercent)}%`}</span>
                            <span className="text-gray-400 font-normal">จากเดือนก่อน</span>
                        </p>
                    </div>

                    <div
                        onClick={() => {
                            if (pendingRequests.length > 0) {
                                setSelectedItem({
                                    category: 'เรื่องที่รอรับ',
                                    title: 'รายการเรื่องที่รอรับ (เดือนปัจจุบัน)',
                                    name: `เรื่องที่รอรับทั้งหมด (${pendingRequests.length} รายการ)`,
                                    count: pendingRequests.length,
                                    subItems: pendingRequests
                                });
                            }
                        }}
                        className={`bg-white border-2 border-[#7C3AED] rounded-2xl p-5 shadow-sm transition-all ${pendingRequests.length > 0 ? 'cursor-pointer hover:shadow-md group' : ''
                            }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-gray-500">เรื่องที่รอรับ</p>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                                เดือนปัจจุบัน
                            </span>
                        </div>
                        <div className="text-4xl font-semibold text-[#D97706] mb-2">{metrics.pendingCount}</div>
                        <p className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 inline shrink-0" />
                            <span>{pendingRequests.length > 0 ? 'คลิกดูรายการที่รอรับ' : 'ไม่มีรายการค้างรับ'}</span>
                        </p>
                    </div>

                    <div className="bg-white border-2 border-[#7C3AED] rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 mb-1">รับเรื่อง</p>
                        <div className="text-4xl font-semibold text-[#108653] mb-2">{metrics.acceptedCount}</div>
                        <p className="text-xs text-gray-400">มีเจ้าหน้าที่รับผิดชอบ</p>
                    </div>

                    <div className="bg-white border-2 border-[#7C3AED] rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 mb-1">ไม่รับเรื่อง</p>
                        <div className="text-4xl font-semibold text-[#e83455] mb-2">{metrics.rejectedCount}</div>
                        <p className="text-xs text-gray-400 font-medium">รายละเอียดข้อมูลซ้ำกัน</p>
                    </div>
                </div>

                {/* ---------------- Line Chart Section ---------------- */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm mb-6 w-full overflow-hidden">
                    <div className="flex justify-between items-start gap-2 mb-3">
                        <h3 className="text-sm sm:text-base font-bold text-[#6B21A8] leading-snug">
                            แนวโน้มเรื่องแจ้งซ่อม เดือนนี้
                        </h3>
                        <span className="text-xs text-purple-700 font-medium text-right shrink-0">
                            ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH')}
                        </span>
                    </div>
                    <p className="text-xs text-purple-700 font-medium mb-4">จำนวนแจ้งซ่อม</p>

                    <div className="relative h-72 w-full outline-none min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{ top: 12, right: 35, left: -20, bottom: 4 }}
                                style={{ outline: 'none' }}
                            >
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E9D5FF" />
                                <XAxis
                                    dataKey="day"
                                    axisLine={{ stroke: '#E5E7EB' }}
                                    tickLine={false}
                                    tick={<CustomXAxisTick />}
                                />
                                <YAxis
                                    domain={[0, 50]}
                                    ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]}
                                    tick={{ fontSize: 11, fill: '#4B5563' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#D1D5DB', strokeWidth: 1.5 }}
                                    wrapperStyle={{ outline: 'none' }}
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '12px',
                                        border: '1px solid #E9D5FF',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        outline: 'none'
                                    }}
                                    formatter={(value) => [`${value} ครั้ง`, 'จำนวนแจ้งซ่อม']}
                                    labelFormatter={(label) => `วันที่ ${label}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#6B21A8"
                                    strokeWidth={2}
                                    isAnimationActive={true}
                                    animationDuration={1500}
                                    animationEasing="ease-in-out"
                                    dot={<CustomDot />}
                                    activeDot={{ r: 6, fill: '#6B21A8', stroke: '#FFFFFF', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ---------------- ตารางสรุปแยกหมวดหมู่ ---------------- */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm mb-6">
                    <div className="mb-4">
                        <h3 className="text-base font-bold text-[#6B21A8]">
                            สรุปรายการความเสียหาย แยกตามหมวดหมู่
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categorySummary.map((cat, idx) => {
                            const CatIcon = cat.icon;
                            return (
                                <div key={idx} className={`p-4 rounded-xl border ${cat.borderColor} ${cat.bgColor} flex flex-col justify-between`}>
                                    <div>
                                        {/* หัวข้อหมวดหมู่ + ยอดรวม */}
                                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/60">
                                            <div className="flex items-center gap-2">
                                                <CatIcon className={`w-5 h-5 ${cat.color}`} />
                                                <h4 className="font-bold text-sm text-gray-800">{cat.title}</h4>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500">
                                                รวม {cat.totalCount} รายการ
                                            </span>
                                        </div>

                                        {/* รายการเสียหาย (กดดูรายการทั้งหมดย่อยได้) */}
                                        <ul className="space-y-2 mb-3">
                                            {cat.items.map((item, itemIdx) => (
                                                <li
                                                    key={itemIdx}
                                                    onClick={() => setSelectedItem({ category: cat.title, ...item })}
                                                    className="flex justify-between items-center text-xs text-gray-700 bg-white p-2.5 rounded-xl border border-gray-100 hover:border-purple-300 hover:shadow-sm cursor-pointer transition-all group"
                                                >
                                                    <span className="truncate pr-2 font-medium group-hover:text-purple-700">
                                                        • {item.name}
                                                    </span>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <span className="font-semibold text-gray-800 bg-gray-100 group-hover:bg-purple-100 group-hover:text-purple-800 px-2 py-0.5 rounded-md text-[11px]">
                                                            {item.count} รายการ
                                                        </span>
                                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* สรุปรายการความเสียหายประจำหมวด */}
                                    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-gray-100 text-xs">
                                        <p className="font-semibold text-gray-700 mb-1">
                                            สรุปความเสียหายหมวด{cat.title}:
                                        </p>
                                        <p className="font-bold text-[#6B21A8] leading-relaxed">
                                            {cat.items.map((item) => item.name).join(' , ')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ---------------- Section 2 ส่วน: คัดกรองเรื่องซ้ำ + AI Insight ---------------- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* กล่อง 1: คัดกรองรายการแจ้งเรื่องซ้ำกัน */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 bg-purple-100 text-[#6B21A8] rounded-lg flex items-center justify-center shrink-0">
                                <CopyCheck className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-base text-gray-900">
                                คัดกรองรายการแจ้งเรื่องซ้ำกันมากที่สุด
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            รายการที่ได้รับการร้องเรียนซ้ำจากผู้ใช้งานหลายคน (จัดกลุ่มให้อัตโนมัติ)
                        </p>

                        <div className="h-64 overflow-y-auto pr-2 space-y-2.5 scrollbar-thin scrollbar-thumb-purple-200">
                            {duplicateReports.map((item, index) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItem({ category: 'รายการแจ้งเรื่องซ้ำ', ...item })}
                                    className="p-3 bg-purple-50/50 hover:bg-purple-100/70 rounded-xl border border-purple-100 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
                                >
                                    <div className="pr-2 min-w-0">
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs font-bold text-purple-800 bg-purple-200/70 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                                {index + 1}
                                            </span>
                                            <h4 className="text-xs font-semibold text-gray-800 group-hover:text-purple-900 leading-snug break-words">
                                                {item.title}
                                            </h4>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-1 pl-7">
                                            แจ้งล่าสุด {item.lastReported}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right self-end sm:self-center pl-7 sm:pl-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedItem({ category: 'รายการแจ้งเรื่องซ้ำ', ...item });
                                            }}
                                            className="inline-block px-3 py-1 bg-[#7C3AED] hover:bg-purple-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                                        >
                                            แจ้งซ้ำ {item.count} ครั้ง
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* กล่อง 2: AI Insight ประจำเดือน (คำนวณจากข้อมูลจริง) */}
                    <div className="bg-white border border-purple-200 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 bg-[#E9D5FF] rounded-lg flex items-center justify-center text-[#6B21A8] shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-base text-gray-900">AI Insight ประจำเดือน</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            วิเคราะห์ภาพรวมการแจ้งซ่อมและคำแนะนำเพื่อการบำรุงรักษาเชิงป้องกัน
                        </p>

                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center py-8">
                                <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-700 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="h-64 overflow-y-auto pr-2 space-y-3 text-xs text-gray-600 leading-relaxed scrollbar-thin scrollbar-thumb-purple-200">
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-1.5 flex items-center gap-1.5 text-xs">
                                        <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" />
                                        สรุปภาพรวมปัญหาประจำเดือน
                                    </h4>
                                    <p className="text-gray-600 leading-relaxed">
                                        {aiInsight.summaryText}
                                    </p>
                                </div>

                                <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100">
                                    <h4 className="font-bold text-[#4C1D95] mb-1.5 flex items-center gap-1.5 text-xs">
                                        <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                                        ข้อเสนอแนะในการปรับปรุง
                                    </h4>
                                    {aiInsight.total === 0 ? (
                                        <p className="text-gray-500 italic">ยังไม่มีข้อมูลเพียงพอสำหรับสร้างข้อเสนอแนะ</p>
                                    ) : (
                                        <ul className="space-y-1.5 text-gray-700">
                                            {aiInsight.suggestions.map((s, i) => (
                                                <li key={i} className="flex gap-2">
                                                    <span className="text-purple-500 shrink-0 mt-0.5">•</span>
                                                    <span dangerouslySetInnerHTML={{ __html: s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ---------------- Pop-up Modal สำหรับแสดงรายละเอียดรายการทั้งหมด ---------------- */}
                {selectedItem && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 relative max-h-[90vh] flex flex-col">
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Modal Header */}
                            <div className="flex items-start gap-3 mb-4 shrink-0 pr-6">
                                <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-[#6B21A8] shrink-0 mt-0.5">
                                    <Wrench className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-snug">
                                        {selectedItem.category === 'รายการแจ้งเรื่องซ้ำ'
                                            ? 'รายละเอียดรายการแจ้งซ่อม'
                                            : selectedItem.category === 'เรื่องที่รอรับ'
                                                ? 'รายละเอียดเรื่องที่รอรับ (เดือนปัจจุบัน)'
                                                : `รายการแจ้งปัญหา: ${selectedItem.category}`}
                                    </h3>
                                    <p className="text-xs font-semibold text-purple-700 mt-0.5">
                                        {selectedItem.category === 'รายการแจ้งเรื่องซ้ำ' ? (
                                            <span>หมวดหมู่: <span className="font-bold text-purple-700">รายการแจ้งเรื่องซ้ำ</span></span>
                                        ) : selectedItem.category === 'เรื่องที่รอรับ' ? (
                                            <span>สถานะ: <span className="font-bold text-amber-600">เรื่องที่รอรับ </span></span>
                                        ) : (
                                            <span>รายการความเสียหายเฉพาะ: <span className="font-bold text-purple-700">{selectedItem.name}</span></span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Modal Body / Scrollable Content */}
                            <div className="overflow-y-auto pr-1 space-y-3.5 flex-1 scrollbar-thin scrollbar-thumb-purple-200">
                                {/* การ์ดสรุปสำหรับ รายการแจ้งเรื่องซ้ำ (ตามภาพตัวอย่าง) */}
                                {selectedItem.category === 'รายการแจ้งเรื่องซ้ำ' && (
                                    <div className="space-y-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-100 text-xs">
                                        <div>
                                            <span className="text-gray-500 font-medium">ชื่อรายการ / อาการความเสียหาย:</span>
                                            <p className="font-bold text-gray-800 text-sm mt-1 leading-snug">
                                                {selectedItem.title || selectedItem.name}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-purple-100/80 pt-2.5">
                                            <span className="text-gray-500 font-medium">จำนวนที่แจ้ง / รายการ:</span>
                                            <span className="font-bold text-purple-800 text-sm">{selectedItem.count} รายการ</span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-purple-100/80 pt-2.5">
                                            <span className="text-gray-500 font-medium">เวลาที่แจ้งล่าสุด:</span>
                                            <span className="font-semibold text-gray-700">{selectedItem.lastReported || '10 นาทีที่แล้ว'}</span>
                                        </div>
                                    </div>
                                )}

                                {/* แสดงรายการย่อยทั้งหมดตามจำนวนจริง */}
                                <div>
                                    <h4 className="font-bold text-xs text-purple-900 mb-2.5">
                                        {selectedItem.category === 'รายการแจ้งเรื่องซ้ำ'
                                            ? `รายการที่แจ้งซ้ำทั้งหมด (${(selectedItem.subItems || getSubItems(selectedItem)).length} รายการ)`
                                            : selectedItem.category === 'เรื่องที่รอรับ'
                                                ? `รายการเรื่องที่รอรับ (${(selectedItem.subItems || getSubItems(selectedItem)).length} รายการ)`
                                                : `รายการความเสียหายทั้งหมด (${(selectedItem.subItems || getSubItems(selectedItem)).length} รายการ)`}
                                    </h4>
                                    <div className="space-y-2.5">
                                        {(selectedItem.subItems || getSubItems(selectedItem)).map((sub: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="bg-purple-50/40 border border-purple-100/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:bg-purple-50 transition-colors"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <h5 className="font-bold text-[#4C1D95] text-xs sm:text-sm truncate">
                                                        {sub.id} - {sub.location}
                                                    </h5>
                                                    <p className="text-xs text-gray-600 font-medium mt-1 truncate">
                                                        {sub.detail}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 mt-1">
                                                        {sub.time}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`font-bold text-xs px-3 py-1 rounded-xl shrink-0 ${sub.status === 'รับเรื่อง'
                                                        ? 'bg-[#DCFCE7] text-[#15803D]'
                                                        : sub.status === 'ไม่รับเรื่อง'
                                                            ? 'bg-red-100 text-red-600'
                                                            : 'bg-yellow-100 text-yellow-600'
                                                        }`}
                                                >
                                                    {sub.status || 'รอรับเรื่อง'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Button */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between shrink-0 gap-2">
                                {selectedItem.category === 'เรื่องที่รอรับ' ? (
                                    <Link
                                        href="/Admin/Dashboard/complaints"
                                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5"
                                    >
                                        <span>ไปจัดการในหน้ารับเรื่อง</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                ) : <div />}
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="px-5 py-2.5 bg-[#6B21A8] hover:bg-purple-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                                >
                                    ปิดหน้าต่าง
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
