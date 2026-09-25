'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useOpenMobileMenu } from '@/components/MobileMenuContext';
import {
    LayoutDashboard,
    Wrench,
    Clock,
    Users,
    Menu,
    User,
    Droplets,
    Zap,
    Download,
    Trash2,
    Eye,
    CheckCircle2,
    X,
    Bot,
    ShieldAlert,
    Lightbulb,
    FileSpreadsheet,
    CheckSquare,
    Square,
    Calendar,
    History,
    BarChart3,
    TrendingUp,
    ChevronRight,
    ChevronDown,
    Filter,
    Layers,
    Loader2,
    Sparkles,
    FileText,
    RefreshCw
} from 'lucide-react';

interface Complaint {
    id: string;
    code: string;
    date: string;
    displayDate: string;
    rawDate?: Date;
    location: string;
    category: string;
    problem: string;
    severity: string;
    status: string;
    repeatCount: number;
    imageUrl: string;
    note: string;
    repeatRejectNote?: string;
    line_user_id?: string;
    is_repeat_blocked?: boolean;
}

interface SubComplaint extends Complaint {
    uniqueId: string;
    repeatIndex: number;
}

interface GroupedComplaint extends Complaint {
    primaryCode: string;
    subItems: SubComplaint[];
}

interface CategoryModalData {
    category: string;
    problem: string;
}

// ข้อมูลจำลองสำรองกรณีไม่สามารถดึงจาก Backend ได้
const initialComplaints: Complaint[] = [
    {
        id: '1',
        code: '#AW1-01',
        date: '2026-07-20',
        displayDate: '20/07/2026 10:00 น.',
        location: 'ห้องน้ำหญิง ชั้น 1 โซน A',
        category: 'ระบบน้ำ',
        problem: 'สายฉีดชำระเสีย 3 ชุด',
        severity: 'ปกติ',
        status: 'รับเรื่อง',
        repeatCount: 5,
        imageUrl: '/photo/ปัญหาสายชำระชำรุด.jpg',
        note: '',
        is_repeat_blocked: false
    },
    {
        id: '2',
        code: '#AW1-02',
        date: '2026-07-20',
        displayDate: '20/07/2026 10:30 น.',
        location: 'ห้องน้ำหญิง ชั้น 2 โซน A',
        category: 'ระบบน้ำ',
        problem: 'สายฉีดชำระเสีย 3 ชุด',
        severity: 'ปกติ',
        status: 'รอรับเรื่อง',
        repeatCount: 3,
        imageUrl: '/photo/ปัญหาสายชำระชำรุด.jpg',
        note: '',
        is_repeat_blocked: false
    },
    {
        id: '3',
        code: '#AM1-03',
        date: '2026-07-20',
        displayDate: '20/07/2026 11:15 น.',
        location: 'ห้องน้ำชาย ชั้น 1 โซน A',
        category: 'ระบบน้ำ',
        problem: 'ท่อน้ำรั่ว 3 จุด',
        severity: 'เร่งด่วน',
        status: 'รอรับเรื่อง',
        repeatCount: 2,
        imageUrl: '/photo/ปัญหาสายชำระชำรุด.jpg',
        note: '',
        is_repeat_blocked: false
    },
    {
        id: '4',
        code: '#ES1-04',
        date: '2026-07-19',
        displayDate: '19/07/2026 14:20 น.',
        location: 'ห้องน้ำชาย ชั้น 2 โซน B',
        category: 'ระบบไฟฟ้า',
        problem: 'หลอดไฟเสีย 3 หลอด',
        severity: 'ปกติ',
        status: 'รับเรื่อง',
        repeatCount: 1,
        imageUrl: '/photo/ปัญหาสายชำระชำรุด.jpg',
        note: '',
        is_repeat_blocked: false
    },
    {
        id: '5',
        code: '#ST2-05',
        date: '2026-07-18',
        displayDate: '18/07/2026 09:00 น.',
        location: 'ห้องน้ำหญิง ชั้น 3 โซน A',
        category: 'สุขภัณฑ์',
        problem: 'โถส้วมชำรุด 3 ชุด',
        severity: 'เร่งด่วน',
        status: 'ไม่รับเรื่อง',
        repeatCount: 1,
        imageUrl: '/photo/ปัญหาสายชำระชำรุด.jpg',
        note: 'ข้อมูลซ้ำซ้อนกับเคส #ST2-01 ที่กำลังดำเนินการอยู่',
        is_repeat_blocked: false
    }
];

// ปรับแต่งสถานะให้มี 3 สถานะ: รอรับเรื่อง (สีเหลือง), รับเรื่อง (สีเขียว), ไม่รับเรื่อง (สีแดง)
const renderStatusBadge = (status: string) => {
    if (status === 'รับเรื่อง') {
        return (
            <span className="inline-block w-[90px] py-1.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#059669] border border-[#A7F3D0] text-center shadow-xs">
                รับเรื่อง
            </span>
        );
    }
    if (status === 'ไม่รับเรื่อง') {
        return (
            <span className="inline-block w-[90px] py-1.5 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] text-center shadow-xs">
                ไม่รับเรื่อง
            </span>
        );
    }
    // รอรับเรื่อง (สีเหลือง)
    return (
        <span className="inline-block w-[90px] py-1.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] text-center shadow-xs">
            รอรับเรื่อง
        </span>
    );
};

export default function ComplaintsPage() {
    const openMobileMenu = useOpenMobileMenu();

    // State จัดการข้อมูลรายการแจ้งซ่อม
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // State จัดการตารางที่กำลังเลือกโหมดลบ ('latest' หรือ 'all') เพื่อให้แยกกันแสดงผล UI
    const [deleteModeTable, setDeleteModeTable] = useState<'latest' | 'all' | null>(null);

    // State จัดการ Dropdown ยุบ/คลี่ตาราง
    const [isLatestOpen, setIsLatestOpen] = useState(true);
    const [isAllOpen, setIsAllOpen] = useState(true);

    const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
    const [selectedStatus, setSelectedStatus] = useState('ทั้งหมด');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [toastMessage, setToastMessage] = useState('');
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [exportOption, setExportOption] = useState('complaints');
    const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
    const [remarkNote, setRemarkNote] = useState('');
    const [viewImageModal, setViewImageModal] = useState(false);
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [categoryModalData, setCategoryModalData] = useState<CategoryModalData | null>(null);
    const [selectedHistoryYear, setSelectedHistoryYear] = useState<number | null>(null);

    // State สำหรับการเลือกจำนวนปีย้อนหลัง (ไม่รวมปีปัจจุบัน)
    const [yearsBack, setYearsBack] = useState(3);
    const [isMonthlyHistoryOpen, setIsMonthlyHistoryOpen] = useState(false);
    const [isYearlyHistoryOpen, setIsYearlyHistoryOpen] = useState(false);
    const [selectedHistoryMonthStart, setSelectedHistoryMonthStart] = useState(0);
    const [selectedHistoryMonthEnd, setSelectedHistoryMonthEnd] = useState(new Date().getMonth());
    const [selectedHistoryMonthYear, setSelectedHistoryMonthYear] = useState(new Date().getFullYear());

    const [autoRejectModalOpen, setAutoRejectModalOpen] = useState(false);
    const [autoRejectNote, setAutoRejectNote] = useState('');
    const [pendingAcceptComplaint, setPendingAcceptComplaint] = useState<Complaint | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    // ฟังก์ชันสำหรับดาวน์โหลดรูปภาพ
    const handleDownloadImage = async (url: string, filename: string) => {
        try {
            if (!url) return;

            if (url.startsWith('data:')) {
                const a = document.createElement('a');
                a.href = url;
                let ext = 'jpg';
                const match = url.match(/data:image\/([a-zA-Z0-9]+);/);
                if (match && match[1]) {
                    ext = match[1] === 'jpeg' ? 'jpg' : match[1];
                }
                a.download = `${filename}.${ext}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showToast('ดาวน์โหลดรูปภาพเรียบร้อยแล้ว');
                return;
            }

            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            let ext = 'jpg';
            if (url.includes('.')) {
                const parts = url.split('.');
                const lastPart = parts[parts.length - 1].split('?')[0];
                if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(lastPart.toLowerCase())) {
                    ext = lastPart;
                }
            }
            a.download = `${filename}.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
            showToast('ดาวน์โหลดรูปภาพเรียบร้อยแล้ว');
        } catch (error) {
            console.error('Download error:', error);
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.download = `${filename}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    // โหลดรูปภาพความเสียหายอัตโนมัติทันทีเมื่อเปิดดูรายละเอียดปัญหา
    useEffect(() => {
        if (!activeComplaint) {
            setIsLoadingImage(false);
            return;
        }

        let isCancelled = false;
        const complaintId = activeComplaint.id;

        // ถ้ามีรูป base64 หรือ url โหลดสมบูรณ์แล้ว ไม่จำเป็นต้อง fetch ซ้ำ
        if (activeComplaint.imageUrl && (activeComplaint.imageUrl.startsWith('data:') || activeComplaint.imageUrl.startsWith('http'))) {
            setIsLoadingImage(false);
            return;
        }

        const fetchFullComplaintImage = async () => {
            try {
                setIsLoadingImage(true);
                const res = await fetch(`/api/requests/${complaintId}`);
                const data = await res.json();
                if (!isCancelled && data.success && data.data?.image_url) {
                    setActiveComplaint((prev) =>
                        prev && prev.id === complaintId
                            ? { ...prev, imageUrl: data.data.image_url }
                            : prev
                    );
                }
            } catch (err) {
                console.error('Failed to load complaint image automatically:', err);
            } finally {
                if (!isCancelled) {
                    setIsLoadingImage(false);
                }
            }
        };

        fetchFullComplaintImage();

        return () => {
            isCancelled = true;
        };
    }, [activeComplaint?.id]);

    const isUpdatingRef = useRef(isUpdating);
    useEffect(() => {
        isUpdatingRef.current = isUpdating;
    }, [isUpdating]);

    // ดึงข้อมูลรายการแจ้งซ่อมจริงจาก Backend API
    const fetchComplaints = async (isInitial = false) => {
        try {
            if (isInitial) setIsLoading(true);

            const res = await fetch('/api/requests', { cache: 'no-store' });
            const result = await res.json();

            if (res.ok && result.success && Array.isArray(result.data)) {
                // คำนวณความถี่การแจ้งซ้ำตามสถานที่ ปัญหา และเฉพาะวันเดียวกัน
                const repeatMap = new Map<string, number>();
                result.data.forEach((item: any) => {
                    const loc = (item.location || '').trim();
                    const prob = (item.issue_summary || '').trim();
                    const d = item.reported_at ? new Date(item.reported_at) : new Date();
                    const dateIso = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
                    const key = `${dateIso}__${loc}__${prob}`;
                    repeatMap.set(key, (repeatMap.get(key) || 0) + 1);
                });

                const mapped: Complaint[] = result.data.map((item: any) => {
                    const d = item.reported_at ? new Date(item.reported_at) : new Date();
                    const dateIso = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
                    const dateStr = !isNaN(d.getTime())
                        ? d.toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) + ' น.'
                        : 'ไม่ระบุเวลา';

                    let cat = 'ระบบน้ำ';
                    const summary = item.issue_summary || '';
                    if (summary.includes('ไฟ') || summary.includes('หลอดไฟ') || summary.includes('ปลั๊ก') || summary.includes('สวิตช์')) {
                        cat = 'ระบบไฟฟ้า';
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
                        cat = 'สุขภัณฑ์';
                    }

                    // รับเฉพาะสถานะมาตรฐาน 3 สถานะ
                    const currentStatus = ['รับเรื่อง', 'แจ้งแล้ว', 'กำลังดำเนินการ', 'เสร็จสิ้น'].includes(item.status)
                        ? 'รับเรื่อง'
                        : ['ไม่รับเรื่อง', 'ยกเลิก'].includes(item.status)
                            ? 'ไม่รับเรื่อง'
                            : 'รอรับเรื่อง';

                    const loc = (item.location || '').trim();
                    const prob = (item.issue_summary || '').trim();
                    const key = `${dateIso}__${loc}__${prob}`;
                    const count = repeatMap.get(key) || 1;

                    return {
                        id: String(item.id),
                        code: item.ticket_number || `#REQ-${item.id}`,
                        date: dateIso,
                        displayDate: dateStr,
                        rawDate: d,
                        location: loc || 'ไม่ระบุสถานที่',
                        category: cat,
                        problem: prob || 'ไม่มีรายละเอียด',
                        severity: (item.priority === 'สูง' || item.priority === 'วิกฤต' || item.priority === 'HIGH' || item.priority === 'URGENT') ? 'เร่งด่วน' : 'ปกติ',
                        status: currentStatus,
                        repeatCount: count,
                        imageUrl: item.image_url || '',
                        note: item.remark || '',
                        repeatRejectNote: '',
                        line_user_id: item.line_user_id || undefined,
                        is_repeat_blocked: Boolean(item.is_repeat_blocked),
                    };
                });

                setComplaints(mapped);
            } else {
                if (isInitial) {
                    setComplaints([]);
                    showToast(result.message || 'ไม่พบข้อมูลจาก Backend');
                }
            }
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
            if (isInitial) {
                showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Backend');
                setComplaints([]);
            }
        } finally {
            if (isInitial) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints(true);

        const refreshData = () => {
            if (document.visibilityState === 'visible' && !isUpdatingRef.current) {
                fetchComplaints(false);
            }
        };

        window.addEventListener('focus', refreshData);
        document.addEventListener('visibilitychange', refreshData);
        const interval = setInterval(refreshData, 4000);

        return () => {
            window.removeEventListener('focus', refreshData);
            document.removeEventListener('visibilitychange', refreshData);
            clearInterval(interval);
        };
    }, []);

    // State สำหรับ AI Insight ประจำเดือน (ขับเคลื่อนด้วย Gemini AI จริง)
    const [aiInsight, setAiInsight] = useState<{
        summaryText: string;
        suggestions: string[];
        isRealAI: boolean;
    }>({
        summaryText: 'กำลังประมวลผลข้อมูลการแจ้งซ่อมประจำเดือน...',
        suggestions: [
            'เพิ่มรอบการตรวจเช็คสภาพอุปกรณ์สุขภัณฑ์และสายฉีดชำระเป็นประจำทุกสัปดาห์',
            'จัดซื้อสำรองอะไหล่ประเภทชุดสายฉีดชำระ วาล์วน้ำ และหลอดไฟ LED ล่วงหน้า',
            'ดำเนินการเปลี่ยนอุปกรณ์ทันทีที่มีการแจ้งซ้ำเกิน 2 ครั้งในจุดเดียวกัน'
        ],
        isRealAI: false,
    });
    const [isAiLoading, setIsAiLoading] = useState(false);

    const fetchAiInsight = async () => {
        if (complaints.length === 0) return;
        setIsAiLoading(true);
        try {
            const now = new Date();
            const curY = now.getFullYear();
            const curM = now.getMonth();
            const monthComplaints = complaints.filter((c) => {
                const d = c.rawDate ? new Date(c.rawDate) : new Date(c.date);
                return d.getFullYear() === curY && d.getMonth() === curM;
            });

            const catCount: { [k: string]: number } = { 'ระบบน้ำ': 0, 'สุขภัณฑ์': 0, 'ระบบไฟฟ้า': 0 };
            monthComplaints.forEach((c) => {
                if (catCount[c.category] !== undefined) catCount[c.category]++;
            });
            const sortedCat = Object.entries(catCount).sort((a, b) => b[1] - a[1]);
            const topCatName = sortedCat[0]?.[0] || 'ระบบน้ำ';

            const locCount: { [k: string]: number } = {};
            monthComplaints.forEach((c) => {
                locCount[c.location] = (locCount[c.location] || 0) + 1;
            });
            const sortedLoc = Object.entries(locCount).sort((a, b) => b[1] - a[1]);
            const topLocName = sortedLoc[0]?.[0] || '';
            const topLocCount = sortedLoc[0]?.[1] || 0;

            const pendingCount = monthComplaints.filter((c) => c.status === 'รอรับเรื่อง').length;
            const acceptedCount = monthComplaints.filter((c) => c.status === 'รับเรื่อง').length;

            const res = await fetch('/api/ai-insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requests: monthComplaints.map(c => ({ location: c.location, issue_summary: c.problem, status: c.status })),
                    total: monthComplaints.length,
                    catCount,
                    topCatName,
                    topLocName,
                    topLocCount,
                    pendingCount,
                    acceptedCount,
                }),
            });
            const data = await res.json();
            if (data.success && data.isRealAI) {
                setAiInsight({
                    summaryText: data.summaryText,
                    suggestions: data.suggestions,
                    isRealAI: true,
                });
            }
        } catch (err) {
            console.warn('[Complaints AI Insight Error]:', err);
        } finally {
            setIsAiLoading(false);
        }
    };

    useEffect(() => {
        if (complaints.length > 0 && !aiInsight.isRealAI) {
            fetchAiInsight();
        }
    }, [complaints.length]);

    const filteredComplaints = useMemo(() => {
        return complaints
            .filter((item) => {
                const matchCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
                const matchStatus = selectedStatus === 'ทั้งหมด' || item.status === selectedStatus;
                const itemDate = item.date;
                const matchStart = !startDate || itemDate >= startDate;
                const matchEnd = !endDate || itemDate <= endDate;
                return matchCategory && matchStatus && matchStart && matchEnd;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [complaints, selectedCategory, selectedStatus, startDate, endDate]);

    // สร้างข้อมูลการเปรียบเทียบย้อนหลังแบบ Dynamic จากข้อมูลจริงในฐานข้อมูล DB (ตามจำนวนปีที่เลือก ไม่รวมปีปัจจุบัน)
    const displayedYearlyData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years: {
            year: number;
            totalRepairs: number;
            categories: { name: string; count: number }[];
        }[] = [];

        const count = Math.max(1, yearsBack);
        const startYear = currentYear - count;
        const endYear = currentYear - 1;

        for (let y = startYear; y <= endYear; y++) {
            const yearComplaints = complaints.filter((item) => {
                const d = item.rawDate ? new Date(item.rawDate) : new Date(item.date);
                const itemYear = !isNaN(d.getTime()) ? d.getFullYear() : null;
                return itemYear === y;
            });

            const waterCount = yearComplaints.filter((c) => c.category === 'ระบบน้ำ').length;
            const sanitaryCount = yearComplaints.filter((c) => c.category === 'สุขภัณฑ์').length;
            const electricCount = yearComplaints.filter((c) => c.category === 'ระบบไฟฟ้า').length;

            years.push({
                year: y,
                totalRepairs: yearComplaints.length,
                categories: [
                    { name: 'ระบบน้ำ', count: waterCount },
                    { name: 'สุขภัณฑ์', count: sanitaryCount },
                    { name: 'ระบบไฟฟ้า', count: electricCount },
                ],
            });
        }
        return years;
    }, [complaints, yearsBack]);

    const thaiMonths = useMemo(() => [
        { value: 0, label: 'มกราคม' },
        { value: 1, label: 'กุมภาพันธ์' },
        { value: 2, label: 'มีนาคม' },
        { value: 3, label: 'เมษายน' },
        { value: 4, label: 'พฤษภาคม' },
        { value: 5, label: 'มิถุนายน' },
        { value: 6, label: 'กรกฎาคม' },
        { value: 7, label: 'สิงหาคม' },
        { value: 8, label: 'กันยายน' },
        { value: 9, label: 'ตุลาคม' },
        { value: 10, label: 'พฤศจิกายน' },
        { value: 11, label: 'ธันวาคม' },
    ], []);

    const availableYears = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const yearsSet = new Set<number>();
        yearsSet.add(currentYear);
        complaints.forEach((c) => {
            const d = c.rawDate ? new Date(c.rawDate) : new Date(c.date);
            if (!isNaN(d.getTime())) {
                yearsSet.add(d.getFullYear());
            }
        });
        return Array.from(yearsSet).sort((a, b) => b - a);
    }, [complaints]);

    const selectedMonthData = useMemo(() => {
        const start = Math.min(selectedHistoryMonthStart, selectedHistoryMonthEnd);
        const end = Math.max(selectedHistoryMonthStart, selectedHistoryMonthEnd);

        const records = complaints.filter((item) => {
            const itemDate = item.rawDate ? new Date(item.rawDate) : new Date(item.date);
            if (isNaN(itemDate.getTime())) return false;
            const itemYear = itemDate.getFullYear();
            const itemMonth = itemDate.getMonth();
            return itemYear === selectedHistoryMonthYear && itemMonth >= start && itemMonth <= end;
        });

        const startMonthName = thaiMonths[start]?.label || '';
        const endMonthName = thaiMonths[end]?.label || '';
        const label = start === end
            ? `${startMonthName} ${selectedHistoryMonthYear}`
            : `${startMonthName} - ${endMonthName} ${selectedHistoryMonthYear}`;

        const waterCount = records.filter(i => i.category === 'ระบบน้ำ').length;
        const sanitaryCount = records.filter(i => i.category === 'สุขภัณฑ์').length;
        const electricCount = records.filter(i => i.category === 'ระบบไฟฟ้า').length;

        return {
            year: selectedHistoryMonthYear,
            startMonth: start,
            endMonth: end,
            label,
            totalRepairs: records.length,
            records,
            categories: [
                { name: 'ระบบน้ำ', count: waterCount },
                { name: 'สุขภัณฑ์', count: sanitaryCount },
                { name: 'ระบบไฟฟ้า', count: electricCount },
            ],
        };
    }, [complaints, selectedHistoryMonthYear, selectedHistoryMonthStart, selectedHistoryMonthEnd, thaiMonths]);

    const historicalAnalysis = useMemo(() => {
        if (!displayedYearlyData.length) {
            return {
                maxYear: '-',
                maxYearCount: 0,
                maxSystemYear: '-',
                maxSystemName: 'ไม่มีข้อมูล',
                maxSystemCount: 0,
            };
        }

        let maxYearObj = displayedYearlyData[0];
        let maxSystemYear = displayedYearlyData[0].year;
        let maxSystemName = '';
        let maxSystemCount = 0;

        displayedYearlyData.forEach((y) => {
            if (y.totalRepairs > maxYearObj.totalRepairs) {
                maxYearObj = y;
            }
            y.categories.forEach((c) => {
                if (c.count > maxSystemCount) {
                    maxSystemCount = c.count;
                    maxSystemName = c.name;
                    maxSystemYear = y.year;
                }
            });
        });

        return {
            maxYear: maxYearObj.totalRepairs > 0 ? maxYearObj.year : '-',
            maxYearCount: maxYearObj.totalRepairs,
            maxSystemYear: maxSystemCount > 0 ? maxSystemYear : '-',
            maxSystemName: maxSystemCount > 0 ? maxSystemName : 'ไม่มีข้อมูล',
            maxSystemCount,
        };
    }, [displayedYearlyData]);

    // จัดกลุ่มรายการแจ้งซ่อมจริงตามสถานที่ ปัญหา และเฉพาะวันเดียวกัน (แสดงผลรวมรายการซ้ำจากข้อมูลจริงใน DB)
    const groupedComplaintsByRepeat = useMemo(() => {
        const groupMap = new Map<string, Complaint[]>();

        filteredComplaints.forEach((item) => {
            const loc = (item.location || '').trim().toLowerCase();
            const cat = (item.category || '').trim();
            const prob = (item.problem || '').trim().toLowerCase();
            const dateStr = item.date || '';
            const key = `${dateStr}__${loc}__${cat}__${prob}`;

            if (!groupMap.has(key)) {
                groupMap.set(key, []);
            }
            groupMap.get(key)!.push(item);
        });

        const groups: GroupedComplaint[] = [];

        groupMap.forEach((items) => {
            if (items.length === 0) return;

            // เรียงตามเวลาเก่าไปใหม่ เพื่อให้รายการแรกสุดที่ผู้ใช้แจ้งเป็นรายการหลัก (Primary Ticket)
            const sortedItems = [...items].sort((a, b) => {
                const timeA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
                const timeB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
                return timeA - timeB;
            });

            const primaryItem = sortedItems[0];
            const duplicateItems = sortedItems.slice(1);

            const effectiveRepeatCount = Math.max(sortedItems.length, primaryItem.repeatCount || 1);

            // แสดงเฉพาะรายการที่มีการแจ้งซ้ำเท่านั้น (repeatCount > 1)
            if (effectiveRepeatCount <= 1) return;

            const subItems: SubComplaint[] = duplicateItems.map((sub, idx) => ({
                ...sub,
                uniqueId: String(sub.id),
                repeatIndex: idx + 2,
                note: sub.note || '',
            }));

            groups.push({
                ...primaryItem,
                repeatCount: effectiveRepeatCount,
                primaryCode: primaryItem.code,
                subItems: subItems,
            });
        });

        // จัดเรียง: กลุ่มที่มีการแจ้งซ้ำมากที่สุดไว้ด้านบนสุด หากเท่ากันให้เรียงตามเวลาล่าสุด
        return groups.sort((a, b) => {
            if (b.repeatCount !== a.repeatCount) {
                return b.repeatCount - a.repeatCount;
            }
            const dateA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
            const dateB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
            return dateB - dateA;
        });
    }, [filteredComplaints]);

    const toggleGroupExpand = (groupId: string) => {
        setExpandedGroupIds(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    // คำนวณสรุปความเสียหาย แยกตามหมวดหมู่แบบ Dynamic จากข้อมูลจริงใน DB
    const filteredCategorySummary = useMemo(() => {
        const categories = [
            {
                title: 'ระบบน้ำ',
                icon: Droplets,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-100',
            },
            {
                title: 'สุขภัณฑ์',
                icon: Wrench,
                color: 'text-purple-600',
                bgColor: 'bg-[#FDF4FF]',
                borderColor: 'border-purple-100',
            },
            {
                title: 'ระบบไฟฟ้า',
                icon: Zap,
                color: 'text-amber-600',
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-100',
            },
        ];

        return categories.map((cat) => {
            const catComplaints = filteredComplaints.filter((c) => c.category === cat.title);
            const probMap = new Map<string, number>();

            catComplaints.forEach((c) => {
                const p = c.problem.trim();
                probMap.set(p, (probMap.get(p) || 0) + 1);
            });

            let items = Array.from(probMap.entries()).map(([name, count]) => ({
                name,
                count,
            }));

            // Fallback กรณีไม่มีข้อมูลในหมวดหมู่นั้น
            if (items.length === 0) {
                if (cat.title === 'ระบบน้ำ') {
                    items = [
                        { name: 'สายฉีดชำระชำรุด', count: 0 },
                        { name: 'ก๊อกน้ำรั่ว/ซึม', count: 0 },
                        { name: 'ท่อน้ำรั่ว', count: 0 },
                    ];
                } else if (cat.title === 'สุขภัณฑ์') {
                    items = [
                        { name: 'โถสุขภัณฑ์ชำรุด', count: 0 },
                        { name: 'อ่างล้างมือชำรุด', count: 0 },
                        { name: 'ฝารองนั่งชำรุด', count: 0 },
                    ];
                } else {
                    items = [
                        { name: 'หลอดไฟเสีย/ไม่ติด', count: 0 },
                        { name: 'ไฟกระพริบ', count: 0 },
                        { name: 'ปลั๊กไฟ/สวิตช์ชำรุด', count: 0 },
                    ];
                }
            }

            return {
                ...cat,
                items,
            };
        });
    }, [filteredComplaints]);

    const allRepeatTableIds = useMemo(() => {
        return groupedComplaintsByRepeat.flatMap(g => [g.id, ...g.subItems.map(s => s.id)]);
    }, [groupedComplaintsByRepeat]);

    const handleSelectAll = () => {
        if (deleteModeTable === 'all') {
            const isAllSelected = allRepeatTableIds.length > 0 && allRepeatTableIds.every(id => selectedIds.includes(id));
            if (isAllSelected) {
                setSelectedIds(prev => prev.filter(id => !allRepeatTableIds.includes(id)));
            } else {
                setSelectedIds(prev => Array.from(new Set([...prev, ...allRepeatTableIds])));
            }
        } else {
            if (selectedIds.length === filteredComplaints.length && filteredComplaints.length > 0) {
                setSelectedIds([]);
            } else {
                setSelectedIds(filteredComplaints.map((item) => item.id));
            }
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleToggleRepeatBlocked = async (id: string, isBlocked: boolean) => {
        setComplaints((prev) =>
            prev.map((c) => (c.id === id ? { ...c, is_repeat_blocked: isBlocked } : c))
        );

        try {
            const res = await fetch(`/api/requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_repeat_blocked: isBlocked }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                showToast(
                    isBlocked
                        ? 'ปิดการแจ้งซ้ำสำหรับรายการนี้เรียบร้อยแล้ว'
                        : 'เปิดรับการแจ้งซ้ำตามปกติแล้ว'
                );
            } else {
                throw new Error(data.message || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            console.error('Failed to toggle repeat blocked:', error);
            showToast('เกิดข้อผิดพลาดในการอัปเดตสถานะการแจ้งซ้ำ');
            setComplaints((prev) =>
                prev.map((c) => (c.id === id ? { ...c, is_repeat_blocked: !isBlocked } : c))
            );
        }
    };

    // ลบรายการที่เลือก เชื่อมต่อ Backend DB
    const confirmDelete = async () => {
        if (selectedIds.length === 0) return;

        setIsUpdating(true);
        try {
            const results = await Promise.all(
                selectedIds.map(async (id) => {
                    const res = await fetch(`/api/requests/${id}`, {
                        method: 'DELETE',
                    });
                    const data = await res.json();
                    return { id, success: res.ok && data.success };
                })
            );

            const successfulIds = results.filter((r) => r.success).map((r) => r.id);
            const failedCount = results.length - successfulIds.length;

            if (successfulIds.length > 0) {
                setComplaints((prev) => prev.filter((item) => !successfulIds.includes(item.id)));
            }

            if (failedCount === 0) {
                showToast(`ลบรายการที่เลือกเรียบร้อยแล้ว (${successfulIds.length} รายการ)`);
            } else if (successfulIds.length > 0) {
                showToast(`ลบสำเร็จ ${successfulIds.length} รายการ (ล้มเหลว ${failedCount} รายการ)`);
            } else {
                showToast('ไม่สามารถลบรายการได้ กรุณาลองใหม่อีกครั้ง');
            }
        } catch (error) {
            console.error('Failed to delete requests:', error);
            showToast('เกิดข้อผิดพลาดในการลบรายการ');
        } finally {
            setIsUpdating(false);
            setSelectedIds([]);
            setDeleteModalOpen(false);
            setDeleteModeTable(null);
        }
    };

    const extractFloorName = (loc: string): string => {
        if (!loc) return 'ไม่ระบุชั้น';
        const match = loc.match(/ชั้น\s*([0-9]+|[A-Za-z0-9]+)/i);
        if (match) return `ชั้น ${match[1]}`;
        return 'ไม่ระบุชั้น';
    };

    const formatDateDisplay = (dateStr: string): string => {
        if (!dateStr || dateStr === 'ไม่ระบุวันที่') return 'ไม่ระบุวันที่';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    };

    const exportData = (type: string, format: 'excel' | 'csv' = exportFormat) => {
        const dateStr = new Date().toISOString().slice(0, 10);
        const printDate = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

        if (format === 'excel') {
            let htmlContent = '';
            let filename = `export_report_${dateStr}.xls`;

            if (type === 'complaints') {
                filename = `complaints_report_${dateStr}.xls`;
                const totalCount = filteredComplaints.length;

                // Frequency per floor
                const floorCounts: Record<string, number> = {};
                filteredComplaints.forEach((c) => {
                    const f = extractFloorName(c.location);
                    floorCounts[f] = (floorCounts[f] || 0) + 1;
                });
                const sortedFloors = Object.keys(floorCounts).sort((a, b) => {
                    const numA = parseInt(a.replace(/\D/g, ''), 10);
                    const numB = parseInt(b.replace(/\D/g, ''), 10);
                    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                    return a.localeCompare(b);
                });
                const floorStats = sortedFloors.map((floor) => ({
                    floor,
                    count: floorCounts[floor],
                    percentage: totalCount > 0 ? ((floorCounts[floor] / totalCount) * 100).toFixed(1) + '%' : '0.0%'
                }));

                // Status breakdown
                const statusCounts: Record<string, number> = {};
                filteredComplaints.forEach((c) => {
                    const s = c.status || 'ไม่ระบุ';
                    statusCounts[s] = (statusCounts[s] || 0) + 1;
                });
                const statusStats = Object.keys(statusCounts).map((status) => ({
                    status,
                    count: statusCounts[status],
                    percentage: totalCount > 0 ? ((statusCounts[status] / totalCount) * 100).toFixed(1) + '%' : '0.0%'
                }));

                // Daily frequency breakdown
                const dailyCounts: Record<string, number> = {};
                filteredComplaints.forEach((c) => {
                    const d = c.date || 'ไม่ระบุวันที่';
                    dailyCounts[d] = (dailyCounts[d] || 0) + 1;
                });
                const sortedDates = Object.keys(dailyCounts).sort((a, b) => {
                    if (a === 'ไม่ระบุวันที่') return 1;
                    if (b === 'ไม่ระบุวันที่') return -1;
                    return new Date(a).getTime() - new Date(b).getTime();
                });
                const dailyStats = sortedDates.map((d) => ({
                    date: d,
                    display: formatDateDisplay(d),
                    count: dailyCounts[d],
                    percentage: totalCount > 0 ? ((dailyCounts[d] / totalCount) * 100).toFixed(1) + '%' : '0.0%'
                }));

                htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>รายการแจ้งซ่อม</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body, table { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11pt; color: #1e293b; }
  .title { font-size: 15pt; font-weight: bold; color: #581c87; padding: 10px 4px; }
  .meta-hdr { font-weight: bold; background-color: #f1f5f9; color: #334155; padding: 6px 10px; border: 1px solid #cbd5e1; }
  .meta-val { border: 1px solid #cbd5e1; padding: 6px 10px; }
  .section-hdr { background-color: #6b21a8; color: #ffffff; font-weight: bold; font-size: 12pt; padding: 8px 12px; }
  .sub-hdr { background-color: #f3e8ff; color: #6b21a8; font-weight: bold; text-align: center; border: 1px solid #d8b4fe; padding: 8px 10px; }
  .th-col { background-color: #6b21a8; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #581c87; padding: 10px 8px; }
  .td-cell { border: 1px solid #cbd5e1; padding: 8px 10px; vertical-align: top; mso-number-format: "\\@"; white-space: normal; word-break: break-word; }
  .td-center { border: 1px solid #cbd5e1; padding: 8px 10px; vertical-align: top; text-align: center; mso-number-format: "\\@"; }
  .zebra { background-color: #faf5ff; }
  .total-row { background-color: #f3e8ff; font-weight: bold; border-top: 2px solid #9333ea; }
</style>
</head>
<body>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
  <tr>
    <td colspan="4" class="title">รายงานสรุปข้อมูลการแจ้งซ่อมห้องน้ำ ICT Restroom Maintenance</td>
  </tr>
  <tr>
    <td class="meta-hdr">วันที่ส่งออกข้อมูล:</td>
    <td colspan="3" class="meta-val">${printDate}</td>
  </tr>
  <tr>
    <td class="meta-hdr" style="background-color: #ede9fe; color: #4c1d95; font-size: 12pt;">จำนวนเรื่องแจ้งเข้าทั้งหมด:</td>
    <td colspan="3" class="meta-val" style="font-weight: bold; font-size: 13pt; color: #6b21a8;">${totalCount} รายการ</td>
  </tr>
</table>

<br/>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
  <thead>
    <tr>
      <th colspan="3" class="section-hdr">📊 สถิติความถี่ในการแจ้งแต่ละชั้น</th>
    </tr>
    <tr>
      <th class="sub-hdr" style="width: 140pt;">ชั้น</th>
      <th class="sub-hdr" style="width: 160pt;">ความถี่ (จำนวนครั้งที่แจ้ง)</th>
      <th class="sub-hdr" style="width: 160pt;">สัดส่วนความถี่ (%)</th>
    </tr>
  </thead>
  <tbody>
    ${floorStats.map((item, idx) => `
    <tr class="${idx % 2 === 1 ? 'zebra' : ''}">
      <td class="td-center" style="font-weight: 600;">${item.floor}</td>
      <td class="td-center">${item.count} รายการ</td>
      <td class="td-center" style="font-weight: bold; color: #6b21a8;">${item.percentage}</td>
    </tr>`).join('')}
    <tr class="total-row">
      <td class="td-center">รวมทุกชั้น</td>
      <td class="td-center">${totalCount} รายการ</td>
      <td class="td-center">100.0%</td>
    </tr>
  </tbody>
</table>

<br/>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
  <thead>
    <tr>
      <th colspan="3" class="section-hdr" style="background-color: #0369a1;">📌 สรุปสถานะการดำเนินการ</th>
    </tr>
    <tr>
      <th class="sub-hdr" style="width: 180pt; color: #0369a1; background-color: #e0f2fe; border-color: #bae6fd;">สถานะ</th>
      <th class="sub-hdr" style="width: 140pt; color: #0369a1; background-color: #e0f2fe; border-color: #bae6fd;">จำนวน (รายการ)</th>
      <th class="sub-hdr" style="width: 140pt; color: #0369a1; background-color: #e0f2fe; border-color: #bae6fd;">สัดส่วน (%)</th>
    </tr>
  </thead>
  <tbody>
    ${statusStats.map((item, idx) => `
    <tr class="${idx % 2 === 1 ? 'zebra' : ''}">
      <td class="td-center" style="font-weight: 600;">${item.status}</td>
      <td class="td-center">${item.count} รายการ</td>
      <td class="td-center" style="font-weight: bold; color: #0284c7;">${item.percentage}</td>
    </tr>`).join('')}
  </tbody>
</table>

<br/>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
  <thead>
    <tr>
      <th colspan="3" class="section-hdr" style="background-color: #581c87;">📅 สถิติความถี่การแจ้งซ่อมตามวันที่</th>
    </tr>
    <tr>
      <th class="sub-hdr" style="width: 160pt;">วันที่แจ้ง</th>
      <th class="sub-hdr" style="width: 160pt;">ความถี่ (จำนวนครั้งที่แจ้ง)</th>
      <th class="sub-hdr" style="width: 140pt;">สัดส่วนความถี่ (%)</th>
    </tr>
  </thead>
  <tbody>
    ${dailyStats.map((item, idx) => `
    <tr class="${idx % 2 === 1 ? 'zebra' : ''}">
      <td class="td-center" style="font-weight: 600;">${item.display}</td>
      <td class="td-center" style="font-weight: bold; color: #581c87;">${item.count} รายการ</td>
      <td class="td-center" style="font-weight: bold; color: #7e22ce;">${item.percentage}</td>
    </tr>`).join('')}
    <tr class="total-row">
      <td class="td-center">รวมทั้งหมด</td>
      <td class="td-center">${totalCount} รายการ</td>
      <td class="td-center">100.0%</td>
    </tr>
  </tbody>
</table>

<br/>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
  <colgroup>
    <col style="width: 100pt; min-width: 100pt;" />
    <col style="width: 150pt; min-width: 150pt;" />
    <col style="width: 250pt; min-width: 250pt;" />
    <col style="width: 130pt; min-width: 130pt;" />
    <col style="width: 280pt; min-width: 280pt;" />
    <col style="width: 120pt; min-width: 120pt;" />
    <col style="width: 130pt; min-width: 130pt;" />
    <col style="width: 260pt; min-width: 260pt;" />
  </colgroup>
  <thead>
    <tr>
      <th colspan="8" class="section-hdr">📋 รายละเอียดรายการแจ้งซ่อมทั้งหมด (${totalCount} รายการ)</th>
    </tr>
    <tr>
      <th class="th-col">ID</th>
      <th class="th-col">วัน/เดือน/ปี</th>
      <th class="th-col">สถานที่</th>
      <th class="th-col">หมวดหมู่</th>
      <th class="th-col">ปัญหา</th>
      <th class="th-col">ระดับความสำคัญ</th>
      <th class="th-col">สถานะ</th>
      <th class="th-col">หมายเหตุ</th>
    </tr>
  </thead>
  <tbody>
    ${filteredComplaints.map((item, idx) => `
    <tr class="${idx % 2 === 1 ? 'zebra' : ''}">
      <td class="td-center" style="font-weight: bold;">${item.code || ''}</td>
      <td class="td-center">${item.displayDate || item.date || ''}</td>
      <td class="td-cell">${item.location || ''}</td>
      <td class="td-center">${item.category || ''}</td>
      <td class="td-cell">${item.problem || ''}</td>
      <td class="td-center">${item.severity || ''}</td>
      <td class="td-center">${item.status || ''}</td>
      <td class="td-cell">${item.note || ''}</td>
    </tr>`).join('')}
  </tbody>
</table>
</body>
</html>`;
            } else if (type === 'category') {
                filename = `category_summary_${dateStr}.xls`;
                const totalCatItems = filteredCategorySummary.reduce((sum, cat) => sum + cat.items.reduce((s, it) => s + it.count, 0), 0);

                htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<style>
  body, table { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11pt; color: #1e293b; }
  .title { font-size: 15pt; font-weight: bold; color: #581c87; padding: 8px 4px; }
  .section-hdr { background-color: #6b21a8; color: #ffffff; font-weight: bold; font-size: 12pt; padding: 8px 12px; }
  .th-col { background-color: #6b21a8; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #581c87; padding: 10px 8px; }
  .td-cell { border: 1px solid #cbd5e1; padding: 8px 10px; vertical-align: top; mso-number-format: "\\@"; white-space: normal; word-break: break-word; }
  .td-center { border: 1px solid #cbd5e1; padding: 8px 10px; vertical-align: top; text-align: center; mso-number-format: "\\@"; }
  .zebra { background-color: #faf5ff; }
  .total-row { background-color: #f3e8ff; font-weight: bold; border-top: 2px solid #9333ea; }
</style>
</head>
<body>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
  <tr><td colspan="3" class="title">รายงานสรุปรายการแจ้งซ่อมตามหมวดหมู่</td></tr>
  <tr><td style="font-weight: bold; background-color: #f1f5f9;">วันที่ส่งออก:</td><td colspan="2">${printDate}</td></tr>
  <tr><td style="font-weight: bold; background-color: #ede9fe; color: #4c1d95;">จำนวนรายการความเสียหายรวม:</td><td colspan="2" style="font-weight: bold; color: #6b21a8;">${totalCatItems} รายการ</td></tr>
</table>
<br/>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
  <colgroup>
    <col style="width: 180pt; min-width: 180pt;" />
    <col style="width: 280pt; min-width: 280pt;" />
    <col style="width: 140pt; min-width: 140pt;" />
  </colgroup>
  <thead>
    <tr>
      <th class="th-col">หมวดหมู่</th>
      <th class="th-col">รายการความเสียหาย</th>
      <th class="th-col">จำนวน (รายการ)</th>
    </tr>
  </thead>
  <tbody>
    ${(() => {
        let rowsHtml = '';
        let rowIdx = 0;
        filteredCategorySummary.forEach((cat) => {
            cat.items.forEach((item) => {
                rowsHtml += `
                <tr class="${rowIdx % 2 === 1 ? 'zebra' : ''}">
                  <td class="td-cell" style="font-weight: 600;">${cat.title}</td>
                  <td class="td-cell">${item.name}</td>
                  <td class="td-center">${item.count} รายการ</td>
                </tr>`;
                rowIdx++;
            });
        });
        return rowsHtml;
    })()}
    <tr class="total-row">
      <td colspan="2" class="td-center">รวมจำนวนรายการทั้งหมด</td>
      <td class="td-center">${totalCatItems} รายการ</td>
    </tr>
  </tbody>
</table>
</body>
</html>`;
            } else if (type === 'monthly') {
                filename = `monthly_summary_${selectedHistoryMonthYear}_${selectedMonthData.startMonth + 1}_to_${selectedMonthData.endMonth + 1}_${dateStr}.xls`;
                htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<style>
  body, table { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11pt; color: #1e293b; }
  .title { font-size: 15pt; font-weight: bold; color: #581c87; padding: 8px 4px; }
  .section-hdr { background-color: #6b21a8; color: #ffffff; font-weight: bold; font-size: 12pt; padding: 8px 12px; }
  .th-col { background-color: #6b21a8; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #581c87; padding: 10px 8px; }
  .td-cell { border: 1px solid #cbd5e1; padding: 8px 10px; vertical-align: top; mso-number-format: "\\@"; white-space: normal; word-break: break-word; }
  .td-center { border: 1px solid #cbd5e1; padding: 8px 10px; vertical-align: top; text-align: center; mso-number-format: "\\@"; }
  .zebra { background-color: #faf5ff; }
</style>
</head>
<body>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
  <tr><td colspan="5" class="title">รายงานสรุปการแจ้งซ่อมประจำช่วงเดือน (${selectedMonthData.label})</td></tr>
  <tr><td style="font-weight: bold; background-color: #f1f5f9;">วันที่ส่งออก:</td><td colspan="4">${printDate}</td></tr>
</table>
<br/>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
  <colgroup>
    <col style="width: 160pt; min-width: 160pt;" />
    <col style="width: 150pt; min-width: 150pt;" />
    <col style="width: 130pt; min-width: 130pt;" />
    <col style="width: 130pt; min-width: 130pt;" />
    <col style="width: 130pt; min-width: 130pt;" />
  </colgroup>
  <thead>
    <tr>
      <th class="th-col">ช่วงเดือน/ปี</th>
      <th class="th-col">จำนวนรายการทั้งหมด</th>
      <th class="th-col">ระบบน้ำ</th>
      <th class="th-col">สุขภัณฑ์</th>
      <th class="th-col">ระบบไฟฟ้า</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="td-center" style="font-weight: 600;">${selectedMonthData.label}</td>
      <td class="td-center" style="font-weight: bold; color: #6b21a8;">${selectedMonthData.totalRepairs} รายการ</td>
      <td class="td-center">${selectedMonthData.categories[0]?.count || 0}</td>
      <td class="td-center">${selectedMonthData.categories[1]?.count || 0}</td>
      <td class="td-center">${selectedMonthData.categories[2]?.count || 0}</td>
    </tr>
  </tbody>
</table>
${selectedMonthData.records.length > 0 ? `
<br/>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
  <colgroup>
    <col style="width: 100pt; min-width: 100pt;" />
    <col style="width: 150pt; min-width: 150pt;" />
    <col style="width: 250pt; min-width: 250pt;" />
    <col style="width: 280pt; min-width: 280pt;" />
    <col style="width: 130pt; min-width: 130pt;" />
  </colgroup>
  <thead>
    <tr><th colspan="5" class="section-hdr">รายการแจ้งซ่อมในช่วงเดือนที่เลือก (${selectedMonthData.records.length} รายการ)</th></tr>
    <tr>
      <th class="th-col">ID</th>
      <th class="th-col">วัน/เดือน/ปี</th>
      <th class="th-col">สถานที่</th>
      <th class="th-col">หมวดหมู่/ปัญหา</th>
      <th class="th-col">สถานะ</th>
    </tr>
  </thead>
  <tbody>
    ${selectedMonthData.records.map((r, idx) => `
    <tr class="${idx % 2 === 1 ? 'zebra' : ''}">
      <td class="td-center" style="font-weight: bold;">${r.code}</td>
      <td class="td-center">${r.displayDate}</td>
      <td class="td-cell">${r.location}</td>
      <td class="td-cell">${r.category} - ${r.problem}</td>
      <td class="td-center">${r.status}</td>
    </tr>`).join('')}
  </tbody>
</table>` : ''}
</body>
</html>`;
            } else if (type === 'yearly') {
                filename = `yearly_history_${dateStr}.xls`;
                htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<style>
  body, table { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11pt; color: #1e293b; }
  .title { font-size: 15pt; font-weight: bold; color: #581c87; padding: 8px 4px; }
  .th-col { background-color: #6b21a8; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #581c87; padding: 10px 8px; }
  .td-center { border: 1px solid #cbd5e1; padding: 8px 10px; vertical-align: top; text-align: center; mso-number-format: "\\@"; }
  .zebra { background-color: #faf5ff; }
</style>
</head>
<body>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
  <tr><td colspan="5" class="title">รายงานสรุปประวัติการแจ้งซ่อมรายปีย้อนหลัง</td></tr>
  <tr><td style="font-weight: bold; background-color: #f1f5f9;">วันที่ส่งออก:</td><td colspan="4">${printDate}</td></tr>
</table>
<br/>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
  <colgroup>
    <col style="width: 100pt; min-width: 100pt;" />
    <col style="width: 150pt; min-width: 150pt;" />
    <col style="width: 140pt; min-width: 140pt;" />
    <col style="width: 140pt; min-width: 140pt;" />
    <col style="width: 140pt; min-width: 140pt;" />
  </colgroup>
  <thead>
    <tr>
      <th class="th-col">ปี</th>
      <th class="th-col">จำนวนรายการรวม</th>
      <th class="th-col">ระบบน้ำ</th>
      <th class="th-col">สุขภัณฑ์</th>
      <th class="th-col">ระบบไฟฟ้า</th>
    </tr>
  </thead>
  <tbody>
    ${displayedYearlyData.map((data, idx) => `
    <tr class="${idx % 2 === 1 ? 'zebra' : ''}">
      <td class="td-center" style="font-weight: 600;">${data.year}</td>
      <td class="td-center" style="font-weight: bold; color: #6b21a8;">${data.totalRepairs}</td>
      <td class="td-center">${data.categories[0]?.count || 0}</td>
      <td class="td-center">${data.categories[1]?.count || 0}</td>
      <td class="td-center">${data.categories[2]?.count || 0}</td>
    </tr>`).join('')}
  </tbody>
</table>
</body>
</html>`;
            } else if (type === 'ai') {
                filename = `ai_insight_${dateStr}.xls`;
                htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<style>
  body, table { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11pt; color: #1e293b; }
  .title { font-size: 15pt; font-weight: bold; color: #581c87; padding: 8px 4px; }
  .th-col { background-color: #6b21a8; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #581c87; padding: 10px 8px; }
  .td-cell { border: 1px solid #cbd5e1; padding: 10px; vertical-align: top; mso-number-format: "\\@"; white-space: normal; word-break: break-word; }
  .zebra { background-color: #faf5ff; }
</style>
</head>
<body>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
  <tr><td colspan="2" class="title">AI Insight ประจำเดือน - บทวิเคราะห์ปัญหาและแนวทางป้องกัน</td></tr>
  <tr><td style="font-weight: bold; background-color: #f1f5f9; width: 180pt;">วันที่ส่งออก:</td><td>${printDate}</td></tr>
</table>
<br/>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
  <colgroup>
    <col style="width: 200pt; min-width: 200pt;" />
    <col style="width: 500pt; min-width: 500pt;" />
  </colgroup>
  <thead>
    <tr>
      <th class="th-col">ส่วนงาน</th>
      <th class="th-col">รายละเอียด / ข้อเสนอแนะ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="td-cell" style="font-weight: bold; color: #6b21a8;">สรุปภาพรวมปัญหาประจำเดือน</td>
      <td class="td-cell">${aiInsight.summaryText || ''}</td>
    </tr>
    ${aiInsight.suggestions.map((s, idx) => `
    <tr class="${idx % 2 === 1 ? 'zebra' : ''}">
      <td class="td-cell" style="font-weight: 600;">ข้อเสนอแนะในการปรับปรุง ${idx + 1}</td>
      <td class="td-cell">${s}</td>
    </tr>`).join('')}
  </tbody>
</table>
</body>
</html>`;
            }

            const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return;
        }

        // CSV Format
        let csvContent = '';
        let filename = `export_report_${dateStr}.csv`;

        if (type === 'complaints') {
            filename = `complaints_report_${dateStr}.csv`;
            const totalCount = filteredComplaints.length;

            // Frequency per floor
            const floorCounts: Record<string, number> = {};
            filteredComplaints.forEach((c) => {
                const f = extractFloorName(c.location);
                floorCounts[f] = (floorCounts[f] || 0) + 1;
            });
            const sortedFloors = Object.keys(floorCounts).sort((a, b) => {
                const numA = parseInt(a.replace(/\D/g, ''), 10);
                const numB = parseInt(b.replace(/\D/g, ''), 10);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return a.localeCompare(b);
            });
            const floorStats = sortedFloors.map((floor) => ({
                floor,
                count: floorCounts[floor],
                percentage: totalCount > 0 ? ((floorCounts[floor] / totalCount) * 100).toFixed(1) + '%' : '0.0%'
            }));

            // Status breakdown
            const statusCounts: Record<string, number> = {};
            filteredComplaints.forEach((c) => {
                const s = c.status || 'ไม่ระบุ';
                statusCounts[s] = (statusCounts[s] || 0) + 1;
            });
            const statusStats = Object.keys(statusCounts).map((status) => ({
                status,
                count: statusCounts[status],
                percentage: totalCount > 0 ? ((statusCounts[status] / totalCount) * 100).toFixed(1) + '%' : '0.0%'
            }));

            // Daily frequency breakdown
            const dailyCounts: Record<string, number> = {};
            filteredComplaints.forEach((c) => {
                const d = c.date || 'ไม่ระบุวันที่';
                dailyCounts[d] = (dailyCounts[d] || 0) + 1;
            });
            const sortedDates = Object.keys(dailyCounts).sort((a, b) => {
                if (a === 'ไม่ระบุวันที่') return 1;
                if (b === 'ไม่ระบุวันที่') return -1;
                return new Date(a).getTime() - new Date(b).getTime();
            });
            const dailyStats = sortedDates.map((d) => ({
                date: d,
                display: formatDateDisplay(d),
                count: dailyCounts[d],
                percentage: totalCount > 0 ? ((dailyCounts[d] / totalCount) * 100).toFixed(1) + '%' : '0.0%'
            }));

            const lines: string[] = [];
            lines.push('"=== รายงานสรุปข้อมูลการแจ้งซ่อมห้องน้ำ ICT Restroom Maintenance ==="');
            lines.push(`"วันที่พิมพ์รายงาน:","${printDate}"`);
            lines.push(`"จำนวนเรื่องแจ้งเข้าทั้งหมด:","${totalCount} รายการ"`);
            lines.push('""');

            lines.push('"=== สถิติความถี่ในการแจ้งแต่ละชั้น ==="');
            lines.push('"ชั้น","ความถี่ (จำนวนครั้งที่แจ้ง)","สัดส่วนความถี่ (%)"');
            floorStats.forEach((item) => {
                lines.push(`"${item.floor}","${item.count} รายการ","${item.percentage}"`);
            });
            lines.push(`"รวมทุกชั้น","${totalCount} รายการ","100.0%"`);
            lines.push('""');

            lines.push('"=== สรุปสถานะการดำเนินการ ==="');
            lines.push('"สถานะ","จำนวน (รายการ)","สัดส่วน (%)"');
            statusStats.forEach((item) => {
                lines.push(`"${item.status}","${item.count} รายการ","${item.percentage}"`);
            });
            lines.push('""');

            lines.push('"=== ความถี่การแจ้งซ่อมตามวันที่ ==="');
            lines.push('"วันที่แจ้ง","ความถี่ (จำนวนครั้งที่แจ้ง)","สัดส่วนความถี่ (%)"');
            dailyStats.forEach((item) => {
                lines.push(`"${item.display}","${item.count} รายการ","${item.percentage}"`);
            });
            lines.push(`"รวมทั้งหมด","${totalCount} รายการ","100.0%"`);
            lines.push('""');

            lines.push(`"=== รายละเอียดรายการแจ้งซ่อมทั้งหมด (${totalCount} รายการ) ==="`);
            lines.push('"ID","วัน/เดือน/ปี","สถานที่","หมวดหมู่","ปัญหา","ระดับความสำคัญ","สถานะ","หมายเหตุ"');
            filteredComplaints.forEach((item) => {
                lines.push([
                    `"${(item.code || '').replace(/"/g, '""')}"`,
                    `"${(item.displayDate || item.date || '').replace(/"/g, '""')}"`,
                    `"${(item.location || '').replace(/"/g, '""')}"`,
                    `"${(item.category || '').replace(/"/g, '""')}"`,
                    `"${(item.problem || '').replace(/"/g, '""')}"`,
                    `"${(item.severity || '').replace(/"/g, '""')}"`,
                    `"${(item.status || '').replace(/"/g, '""')}"`,
                    `"${(item.note || '').replace(/"/g, '""')}"`
                ].join(','));
            });

            csvContent = lines.join('\r\n');
        } else if (type === 'category') {
            filename = `category_summary_${dateStr}.csv`;
            const totalCatItems = filteredCategorySummary.reduce((sum, cat) => sum + cat.items.reduce((s, it) => s + it.count, 0), 0);
            const lines: string[] = [];
            lines.push('"=== รายงานสรุปรายการแจ้งซ่อมตามหมวดหมู่ ==="');
            lines.push(`"วันที่พิมพ์รายงาน:","${printDate}"`);
            lines.push(`"จำนวนรายการความเสียหายรวม:","${totalCatItems} รายการ"`);
            lines.push('""');
            lines.push('"หมวดหมู่","รายการความเสียหาย","จำนวน (รายการ)"');
            filteredCategorySummary.forEach((cat) => {
                cat.items.forEach((item) => {
                    lines.push([`"${cat.title}"`, `"${item.name}"`, `"${item.count}"`].join(','));
                });
            });
            csvContent = lines.join('\r\n');
        } else if (type === 'monthly') {
            filename = `monthly_summary_${selectedHistoryMonthYear}_${selectedMonthData.startMonth + 1}_to_${selectedMonthData.endMonth + 1}_${dateStr}.csv`;
            const lines: string[] = [];
            lines.push('"=== รายงานสรุปการแจ้งซ่อมประจำช่วงเดือน ==="');
            lines.push(`"ช่วงเดือน/ปี:","${selectedMonthData.label}"`);
            lines.push(`"จำนวนรายการทั้งหมด:","${selectedMonthData.totalRepairs} รายการ"`);
            lines.push('""');
            lines.push('"ช่วงเดือน/ปี","จำนวนรายการทั้งหมด","ระบบน้ำ","สุขภัณฑ์","ระบบไฟฟ้า"');
            lines.push([
                `"${selectedMonthData.label}"`,
                `"${selectedMonthData.totalRepairs}"`,
                `"${selectedMonthData.categories[0]?.count || 0}"`,
                `"${selectedMonthData.categories[1]?.count || 0}"`,
                `"${selectedMonthData.categories[2]?.count || 0}"`
            ].join(','));

            if (selectedMonthData.records.length > 0) {
                lines.push('""');
                lines.push(`"=== รายการแจ้งซ่อมในช่วงเดือนที่เลือก (${selectedMonthData.records.length} รายการ) ==="`);
                lines.push('"ID","วัน/เดือน/ปี","สถานที่","หมวดหมู่/ปัญหา","สถานะ"');
                selectedMonthData.records.forEach((r) => {
                    lines.push([
                        `"${r.code}"`,
                        `"${r.displayDate}"`,
                        `"${r.location}"`,
                        `"${r.category} - ${r.problem}"`,
                        `"${r.status}"`
                    ].join(','));
                });
            }
            csvContent = lines.join('\r\n');
        } else if (type === 'yearly') {
            filename = `yearly_history_${dateStr}.csv`;
            const lines: string[] = [];
            lines.push('"=== รายงานสรุปประวัติการแจ้งซ่อมรายปีย้อนหลัง ==="');
            lines.push(`"วันที่พิมพ์รายงาน:","${printDate}"`);
            lines.push('""');
            lines.push('"ปี","จำนวนรายการ","ระบบน้ำ","สุขภัณฑ์","ระบบไฟฟ้า"');
            displayedYearlyData.forEach((data) => {
                lines.push([
                    `"${data.year}"`,
                    `"${data.totalRepairs}"`,
                    `"${data.categories[0]?.count || 0}"`,
                    `"${data.categories[1]?.count || 0}"`,
                    `"${data.categories[2]?.count || 0}"`
                ].join(','));
            });
            csvContent = lines.join('\r\n');
        } else if (type === 'ai') {
            filename = `ai_insight_${dateStr}.csv`;
            const lines: string[] = [];
            lines.push('"=== AI Insight ประจำเดือน ==="');
            lines.push(`"วันที่พิมพ์รายงาน:","${printDate}"`);
            lines.push('""');
            lines.push('"ส่วนงาน","รายละเอียด / ข้อเสนอแนะ"');
            lines.push(`"สรุปภาพรวมปัญหาประจำเดือน","${(aiInsight.summaryText || '').replace(/"/g, '""')}"`);
            aiInsight.suggestions.forEach((s, idx) => {
                lines.push([`"ข้อเสนอแนะในการปรับปรุง ${idx + 1}"`, `"${s.replace(/"/g, '""')}"`].join(','));
            });
            csvContent = lines.join('\r\n');
        }

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportToCSV = (type: string) => {
        exportData(type, exportFormat);
    };

    const handleExecuteExport = () => {
        setIsExportOpen(false);
        exportData(exportOption, exportFormat);
        showToast(`ส่งออกไฟล์ ${exportFormat === 'excel' ? 'Excel (.xls)' : 'CSV (.csv)'} เรียบร้อยแล้ว`);
    };

    // รับเรื่องรายการเดี่ยว หรือเปิด Modal รายการซ้ำ
    const handleAcceptMain = async () => {
        if (!activeComplaint) return;

        setIsUpdating(true);
        try {
            // ค้นหารายการทั้งหมดในข้อมูลซ้ำของวันเดียวกัน
            const sameDayDuplicates = complaints.filter(
                c => c.date === activeComplaint.date &&
                    (c.location || '').trim().toLowerCase() === (activeComplaint.location || '').trim().toLowerCase() &&
                    (c.problem || '').trim().toLowerCase() === (activeComplaint.problem || '').trim().toLowerCase()
            );

            const groupSubItems = (activeComplaint as any).subItems || [];
            const targetIds = Array.from(new Set([
                activeComplaint.id,
                ...groupSubItems.map((s: any) => s.id),
                ...sameDayDuplicates.map(d => d.id)
            ]));

            // ส่งคำขอเปลี่ยนสถานะเป็น 'แจ้งแล้ว' (รับเรื่อง) ไปยัง Backend สำหรับทุกรายการในกลุ่มของวันนั้น
            await Promise.all(targetIds.map(id =>
                fetch(`/api/requests/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'แจ้งแล้ว',
                        notification_message: 'เจ้าหน้าที่รับเรื่องเรียบร้อยแล้ว กำลังเตรียมการเข้าซ่อม'
                    }),
                })
            ));

            // อัปเดตสถานะใน State ของทุกรายการที่ซ้ำในวันนั้นเป็น 'รับเรื่อง'
            setComplaints((prev) =>
                prev.map((item) =>
                    targetIds.includes(item.id)
                        ? { ...item, status: 'รับเรื่อง', note: '' }
                        : item
                )
            );

            showToast(targetIds.length > 1
                ? `รับเรื่องรายการและข้อมูลซ้ำของวันเดียวกันรวม ${targetIds.length} รายการเรียบร้อยแล้ว`
                : 'รับเรื่องเรียบร้อยแล้ว'
            );
        } catch (error) {
            console.error('Error accepting complaint:', error);
            showToast('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        } finally {
            setIsUpdating(false);
            setActiveComplaint(null);
            setRemarkNote('');
        }
    };

    // รับเรื่องรายการหลัก + ปรับรายการซ้ำที่เหลือเป็นไม่รับเรื่องใน Backend DB
    const confirmAcceptWithAutoReject = async () => {
        if (!pendingAcceptComplaint) return;

        setIsUpdating(true);
        try {
            // 1. อัปเดตรายการหลักเป็น 'รับเรื่อง'
            await fetch(`/api/requests/${pendingAcceptComplaint.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'แจ้งแล้ว',
                    notification_message: 'เจ้าหน้าที่รับเรื่องเรียบร้อยแล้ว กำลังเตรียมการเข้าซ่อม'
                }),
            });

            // 2. ค้นหารายการซ้ำอื่นๆ ในระบบที่มีสถานที่และปัญหาเดียวกัน
            const noteToUse = autoRejectNote.trim() || `ข้อมูลซ้ำซ้อนกับรายการแรก (${pendingAcceptComplaint.code}) ที่รับเรื่องแล้ว`;
            const duplicateItems = complaints.filter(
                c => c.id !== pendingAcceptComplaint.id &&
                    c.location === pendingAcceptComplaint.location &&
                    c.problem === pendingAcceptComplaint.problem &&
                    c.status === 'รอรับเรื่อง'
            );

            if (duplicateItems.length > 0) {
                await Promise.all(duplicateItems.map(dup =>
                    fetch(`/api/requests/${dup.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            status: 'ไม่รับเรื่อง',
                            remark: noteToUse,
                            notification_message: `ไม่รับเรื่อง: ${noteToUse}`
                        }),
                    })
                ));
            }

            // อัปเดต state
            setComplaints((prev) =>
                prev.map((item) => {
                    if (item.id === pendingAcceptComplaint.id) {
                        return {
                            ...item,
                            status: 'รับเรื่อง',
                            repeatRejectNote: noteToUse
                        };
                    }
                    if (
                        item.location === pendingAcceptComplaint.location &&
                        item.problem === pendingAcceptComplaint.problem &&
                        item.status === 'รอรับเรื่อง'
                    ) {
                        return {
                            ...item,
                            status: 'ไม่รับเรื่อง',
                            note: noteToUse,
                            repeatRejectNote: noteToUse
                        };
                    }
                    return item;
                })
            );

            showToast(`รับเรื่องรายการที่ 1 เรียบร้อย รายการที่เหลือถูกปรับเป็นไม่รับเรื่องอัตโนมัติ`);
        } catch (error) {
            console.error('Error confirming accept with auto reject:', error);
            showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setIsUpdating(false);
            setAutoRejectModalOpen(false);
            setActiveComplaint(null);
            setPendingAcceptComplaint(null);
            setRemarkNote('');
            setAutoRejectNote('');
        }
    };

    // ปฏิเสธไม่รับเรื่อง เชื่อมต่อ Backend DB (อัปเดตทุกรายการในข้อมูลซ้ำของวันเดียวกัน)
    const handleRejectMain = async () => {
        if (!activeComplaint) return;

        const noteToSave = remarkNote.trim() || 'ไม่รับเรื่อง (ข้อมูลซ้ำซ้อน/รายละเอียดไม่ชัดเจน)';
        setIsUpdating(true);
        try {
            // ค้นหารายการทั้งหมดในข้อมูลซ้ำของวันเดียวกัน
            const sameDayDuplicates = complaints.filter(
                c => c.date === activeComplaint.date &&
                    (c.location || '').trim().toLowerCase() === (activeComplaint.location || '').trim().toLowerCase() &&
                    (c.problem || '').trim().toLowerCase() === (activeComplaint.problem || '').trim().toLowerCase()
            );

            const groupSubItems = (activeComplaint as any).subItems || [];
            const targetIds = Array.from(new Set([
                activeComplaint.id,
                ...groupSubItems.map((s: any) => s.id),
                ...sameDayDuplicates.map(d => d.id)
            ]));

            await Promise.all(targetIds.map(id =>
                fetch(`/api/requests/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'ไม่รับเรื่อง',
                        remark: noteToSave,
                        notification_message: `ไม่รับเรื่อง: ${noteToSave}`
                    }),
                })
            ));

            setComplaints((prev) =>
                prev.map((item) =>
                    targetIds.includes(item.id)
                        ? {
                            ...item,
                            status: 'ไม่รับเรื่อง',
                            note: noteToSave,
                            repeatRejectNote: noteToSave
                        }
                        : item
                )
            );

            showToast(targetIds.length > 1
                ? `บันทึกไม่รับเรื่องข้อมูลซ้ำของวันเดียวกันรวม ${targetIds.length} รายการเรียบร้อยแล้ว`
                : 'บันทึกการไม่รับเรื่องเรียบร้อยแล้ว'
            );
        } catch (error) {
            console.error('Error rejecting complaint:', error);
            showToast('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        } finally {
            setIsUpdating(false);
            setActiveComplaint(null);
            setRemarkNote('');
        }
    };

    const isAcceptDisabled = remarkNote.trim().length > 0;

    return (
        <div className="flex min-h-screen bg-[#F7F2FE] font-sans text-gray-800 relative overflow-x-hidden">
            {toastMessage && (
                <div className="fixed top-5 right-5 z-[100] bg-purple-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-purple-400 animate-in fade-in slide-in-from-top-3 duration-200 font-sans">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                    <span className="text-sm font-semibold">{toastMessage}</span>
                </div>
            )}

            <main className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto w-full min-w-0 font-sans">
                <header className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={openMobileMenu}
                            className="md:hidden p-2 rounded-lg hover:bg-purple-200/60 text-[#4C1D95] shrink-0"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#4C1D95] truncate">
                            รายการแจ้งซ่อม
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 relative">
                        <span className="text-sm font-bold text-gray-900 hidden sm:inline">Admin</span>
                        <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-black shadow-xs overflow-hidden shrink-0">
                            <User className="w-5 h-5 fill-black text-black" />
                        </div>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-start gap-3 w-full md:w-auto">
                        <div className="relative inline-flex items-center w-full sm:w-auto">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="appearance-none bg-[#6B21A8] hover:bg-purple-900 text-white text-xs sm:text-sm font-bold rounded-2xl pl-5 pr-10 py-2.5 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors w-full sm:w-auto"
                            >
                                <option value="ทั้งหมด">เลือกหมวดหมู่ปัญหา (ทั้งหมด)</option>
                                <option value="ระบบน้ำ">เลือกหมวดหมู่ปัญหา (ระบบน้ำ)</option>
                                <option value="สุขภัณฑ์">เลือกหมวดหมู่ปัญหา (สุขภัณฑ์)</option>
                                <option value="ระบบไฟฟ้า">เลือกหมวดหมู่ปัญหา (ระบบไฟฟ้า)</option>
                            </select>
                            <Filter className="w-4 h-4 text-white absolute right-4 pointer-events-none" />
                        </div>

                        <div className="relative inline-flex items-center w-full sm:w-auto">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="appearance-none bg-[#6B21A8] hover:bg-purple-900 text-white text-xs sm:text-sm font-bold rounded-2xl pl-5 pr-10 py-2.5 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors w-full sm:w-auto"
                            >
                                <option value="ทั้งหมด">เลือกสถานะ (ทั้งหมด)</option>
                                <option value="รอรับเรื่อง">รอรับเรื่อง</option>
                                <option value="รับเรื่อง">รับเรื่อง</option>
                                <option value="ไม่รับเรื่อง">ไม่รับเรื่อง</option>
                            </select>
                            <Filter className="w-4 h-4 text-white absolute right-4 pointer-events-none" />
                        </div>

                        <div className="relative inline-flex items-center justify-between sm:justify-start gap-2 bg-[#6B21A8] hover:bg-purple-900 text-white rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition-colors w-full sm:w-auto">
                            <span className="text-xs sm:text-sm text-white font-bold whitespace-nowrap">เริ่ม:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-white text-xs sm:text-sm font-bold focus:outline-none cursor-pointer uppercase w-28 sm:w-32 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                            <Calendar className="w-4 h-4 text-white shrink-0 pointer-events-none ml-auto" />
                        </div>

                        <div className="relative inline-flex items-center justify-between sm:justify-start gap-2 bg-[#6B21A8] hover:bg-purple-900 text-white rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition-colors w-full sm:w-auto">
                            <span className="text-xs sm:text-sm text-white font-bold whitespace-nowrap">สิ้นสุด:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent text-white text-xs sm:text-sm font-bold focus:outline-none cursor-pointer uppercase w-28 sm:w-32 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                            <Calendar className="w-4 h-4 text-white shrink-0 pointer-events-none ml-auto" />
                        </div>
                    </div>

                    <div className="w-full md:w-auto shrink-0 mt-1 md:mt-0">
                        <button
                            onClick={() => setIsExportOpen(true)}
                            className="w-full md:w-auto flex items-center justify-center gap-2 bg-white text-[#6B21A8] border-2 border-[#6B21A8] hover:bg-purple-50 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* ---------------- ส่วนที่ 1: ตารางรายการล่าสุด ---------------- */}
                <div className={`bg-white border border-purple-200 rounded-2xl shadow-sm mb-6 overflow-hidden flex flex-col transition-all duration-200 ${isLatestOpen ? 'h-[360px]' : 'h-auto'}`}>
                    <div
                        onClick={() => setIsLatestOpen(!isLatestOpen)}
                        className="bg-[#6B21A8] hover:bg-purple-900 text-white px-4 py-3 flex items-center justify-between cursor-pointer select-none transition-colors shrink-0"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1 rounded-md bg-white/10">
                                <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${isLatestOpen ? 'transform rotate-90' : 'transform rotate-0'}`} />
                            </div>
                            <h3 className="font-bold text-sm sm:text-base">รายการล่าสุด</h3>
                            {selectedIds.length > 0 && deleteModeTable === 'latest' && (
                                <span className="bg-purple-800 text-purple-100 text-xs px-2.5 py-0.5 rounded-full font-medium border border-purple-400">
                                    เลือก {selectedIds.length} รายการ
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {deleteModeTable === 'latest' && isLatestOpen && (
                                <button
                                    onClick={handleSelectAll}
                                    className="flex items-center gap-1.5 text-xs bg-purple-800 hover:bg-purple-950 px-3 py-1.5 rounded-xl border border-purple-400 transition-colors text-purple-100 font-semibold"
                                    title="เลือกทั้งหมด"
                                >
                                    {selectedIds.length === filteredComplaints.length && filteredComplaints.length > 0 ? (
                                        <CheckSquare className="w-4 h-4 text-purple-300" />
                                    ) : (
                                        <Square className="w-4 h-4 text-purple-300" />
                                    )}
                                    <span className="hidden sm:inline">เลือกทั้งหมด</span>
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    if (deleteModeTable !== 'latest') {
                                        setDeleteModeTable('latest');
                                        setSelectedIds([]);
                                        if (!isLatestOpen) setIsLatestOpen(true);
                                    } else {
                                        if (selectedIds.length > 0) {
                                            setDeleteModalOpen(true);
                                        } else {
                                            setDeleteModeTable(null);
                                        }
                                    }
                                }}
                                className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm ${deleteModeTable === 'latest'
                                    ? selectedIds.length > 0
                                        ? 'bg-red-500 hover:bg-red-600 text-white ring-2 ring-red-300'
                                        : 'bg-purple-800 hover:bg-purple-950 text-purple-200 border border-purple-400'
                                    : 'bg-purple-800/80 hover:bg-purple-800 text-purple-100'
                                    }`}
                                title={deleteModeTable === 'latest' ? (selectedIds.length > 0 ? "ลบรายการที่เลือก" : "ปิดโหมดลบ") : "โหมดลบรายการ"}
                            >
                                <Trash2 className="w-4.5 h-4.5" />
                            </button>
                        </div>
                    </div>

                    {isLatestOpen && (
                        <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-50">
                            <table className="w-full text-left border-collapse min-w-[650px] font-sans">
                                <thead className="bg-[#E9D5FF] text-[#4C1D95] text-xs font-bold sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        {deleteModeTable === 'latest' && <th className="p-3 text-center w-12 bg-[#E9D5FF]">เลือก</th>}
                                        <th className="p-3">ID</th>
                                        <th className="p-3">วัน/เดือน/ปี</th>
                                        <th className="p-3">สถานที่</th>
                                        <th className="p-3">หมวดหมู่/ปัญหา</th>
                                        <th className="p-3 text-center">ระดับความสำคัญ</th>
                                        <th className="p-3 text-center">สถานะ</th>
                                        <th className="p-3 text-center">เปิด/ปิดการแจ้งซ้ำ</th>
                                        <th className="p-3 text-center">รายละเอียด</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100 text-xs text-gray-700 bg-white">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={deleteModeTable === 'latest' ? 9 : 8} className="text-center py-8 text-gray-500">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                                    <span>กำลังโหลดข้อมูลจากเซิร์ฟเวอร์...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredComplaints.length === 0 ? (
                                        <tr>
                                            <td colSpan={deleteModeTable === 'latest' ? 9 : 8} className="text-center py-8 text-gray-400">
                                                ไม่พบข้อมูลรายการแจ้งซ่อม
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredComplaints.map((item) => {
                                            const isSelected = selectedIds.includes(item.id);
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className={`hover:bg-purple-50/60 transition-colors ${isSelected && deleteModeTable === 'latest' ? 'bg-purple-100/60 font-medium' : ''
                                                        }`}
                                                >
                                                    {deleteModeTable === 'latest' && (
                                                        <td className="p-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleSelectRow(item.id)}
                                                                className="rounded border-purple-300 text-purple-700 focus:ring-purple-400 h-4 w-4 cursor-pointer accent-purple-700"
                                                            />
                                                        </td>
                                                    )}
                                                    <td className="p-3 font-semibold text-purple-900">{item.code}</td>
                                                    <td className="p-3 whitespace-nowrap">{item.displayDate}</td>
                                                    <td className="p-3">{item.location}</td>
                                                    <td className="p-3">
                                                        <span className="font-semibold">{item.category}</span> {item.problem}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span
                                                            className={`inline-block w-20 py-1 rounded-full font-bold text-[11px] text-center ${item.severity === 'เร่งด่วน'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                                }`}
                                                        >
                                                            {item.severity}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {renderStatusBadge(item.status)}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <label
                                                            className="inline-flex items-center justify-center cursor-pointer gap-1.5 select-none"
                                                            title={item.is_repeat_blocked ? "ปิดการแจ้งซ้ำอยู่ (คลิกเพื่อเปิดรับแจ้ง)" : "เปิดรับแจ้งอยู่ (คลิกเพื่อปิดรับแจ้งซ้ำ)"}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={Boolean(item.is_repeat_blocked)}
                                                                onChange={(e) => handleToggleRepeatBlocked(item.id, e.target.checked)}
                                                                className="w-4 h-4 rounded text-purple-700 focus:ring-purple-400 accent-purple-700 cursor-pointer"
                                                            />
                                                            <span
                                                                className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                                                                    item.is_repeat_blocked
                                                                        ? 'bg-red-50 text-red-600 border-red-200'
                                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                                }`}
                                                            >
                                                                {item.is_repeat_blocked ? 'ปิดแจ้งซ้ำ' : 'เปิดแจ้ง'}
                                                            </span>
                                                        </label>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <button
                                                            onClick={() => {
                                                                setActiveComplaint(item);
                                                                setRemarkNote(item.note || '');
                                                            }}
                                                            className="p-1.5 text-gray-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                                                            title="ดูรายละเอียด"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ---------------- ส่วนที่ 2: ตารางรายการทั้งหมด ---------------- */}
                <div className={`bg-white border border-purple-200 rounded-2xl shadow-sm mb-6 overflow-hidden flex flex-col transition-all duration-200 ${isAllOpen ? 'h-[360px]' : 'h-auto'}`}>
                    <div
                        onClick={() => setIsAllOpen(!isAllOpen)}
                        className="bg-[#5607cc] hover:bg-purple-900 text-white px-4 py-3 flex items-center justify-between cursor-pointer select-none transition-colors shrink-0"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1 rounded-md bg-white/10">
                                <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${isAllOpen ? 'transform rotate-90' : 'transform rotate-0'}`} />
                            </div>
                            <h3 className="font-bold text-sm sm:text-base">
                                ตารางรายการทั้งหมด (แสดงผลรวมรายการซ้ำ)
                            </h3>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <span className="text-xs bg-purple-900/60 text-purple-100 px-3 py-1 rounded-full font-medium border border-purple-400 hidden sm:inline">
                                รวมทั้งหมด {groupedComplaintsByRepeat.length} กลุ่มรายการซ้ำ
                            </span>
                            {deleteModeTable === 'all' && isAllOpen && (
                                <button
                                    onClick={handleSelectAll}
                                    className="flex items-center gap-1.5 text-xs bg-purple-800 hover:bg-purple-950 px-3 py-1.5 rounded-xl border border-purple-400 transition-colors text-purple-100 font-semibold"
                                    title="เลือกทั้งหมด"
                                >
                                    {allRepeatTableIds.length > 0 && allRepeatTableIds.every(id => selectedIds.includes(id)) ? (
                                        <CheckSquare className="w-4 h-4 text-purple-300" />
                                    ) : (
                                        <Square className="w-4 h-4 text-purple-300" />
                                    )}
                                    <span className="hidden sm:inline">เลือกทั้งหมด</span>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (deleteModeTable !== 'all') {
                                        setDeleteModeTable('all');
                                        setSelectedIds([]);
                                        if (!isAllOpen) setIsAllOpen(true);
                                    } else {
                                        if (selectedIds.length > 0) {
                                            setDeleteModalOpen(true);
                                        } else {
                                            setDeleteModeTable(null);
                                        }
                                    }
                                }}
                                className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm ${deleteModeTable === 'all'
                                    ? selectedIds.length > 0
                                        ? 'bg-red-500 hover:bg-red-600 text-white ring-2 ring-red-300'
                                        : 'bg-purple-800 hover:bg-purple-950 text-purple-200 border border-purple-400'
                                    : 'bg-purple-800/80 hover:bg-purple-800 text-purple-100'
                                    }`}
                                title={deleteModeTable === 'all' ? (selectedIds.length > 0 ? "ลบรายการที่เลือก" : "ปิดโหมดลบ") : "โหมดลบรายการ"}
                            >
                                <Trash2 className="w-4.5 h-4.5" />
                            </button>
                        </div>
                    </div>

                    {isAllOpen && (
                        <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-50">
                            <table className="w-full text-left border-collapse min-w-[700px] font-sans">
                                <thead className="bg-[#E9D5FF] text-[#4C1D95] text-xs font-bold sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        {deleteModeTable === 'all' && <th className="p-3 text-center w-12 bg-[#E9D5FF]">เลือก</th>}
                                        <th className="p-3">ID หลัก</th>
                                        <th className="p-3">วัน/เดือน/ปี</th>
                                        <th className="p-3">สถานที่</th>
                                        <th className="p-3">หมวดหมู่/ปัญหา</th>
                                        <th className="p-3 text-center">การแจ้งซ้ำ</th>
                                        <th className="p-3 text-center">ระดับความสำคัญ</th>
                                        <th className="p-3 text-center">สถานะ</th>
                                        <th className="p-3 text-center">รายละเอียด</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100 text-xs text-gray-700 bg-white">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={deleteModeTable === 'all' ? 9 : 8} className="text-center py-8 text-gray-500">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                                    <span>กำลังโหลดข้อมูลจากเซิร์ฟเวอร์...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : groupedComplaintsByRepeat.length === 0 ? (
                                        <tr>
                                            <td colSpan={deleteModeTable === 'all' ? 9 : 8} className="text-center py-8 text-gray-400">
                                                ไม่พบข้อมูลรายการที่มีการแจ้งซ้ำ
                                            </td>
                                        </tr>
                                    ) : (
                                        groupedComplaintsByRepeat.map((group) => {
                                            const isExpanded = expandedGroupIds.includes(group.id);
                                            const hasMultiple = group.repeatCount > 1;
                                            const isSelected = selectedIds.includes(group.id);

                                            return (
                                                <React.Fragment key={group.id}>
                                                    <tr className={`hover:bg-purple-50/50 transition-colors ${(isExpanded || (isSelected && deleteModeTable === 'all')) ? 'bg-purple-50/80 font-medium' : ''}`}>
                                                        {deleteModeTable === 'all' && (
                                                            <td className="p-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => {
                                                                        const allGroupIds = [group.id, ...group.subItems.map(s => s.id)];
                                                                        setSelectedIds(prev => {
                                                                            const hasAll = allGroupIds.every(id => prev.includes(id));
                                                                            if (hasAll) {
                                                                                return prev.filter(id => !allGroupIds.includes(id));
                                                                            } else {
                                                                                return Array.from(new Set([...prev, ...allGroupIds]));
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="rounded border-purple-300 text-purple-700 focus:ring-purple-400 h-4 w-4 cursor-pointer accent-purple-700"
                                                                />
                                                            </td>
                                                        )}
                                                        <td className="p-3 font-semibold text-purple-900">{group.primaryCode}</td>
                                                        <td className="p-3 whitespace-nowrap">{group.displayDate}</td>
                                                        <td className="p-3">{group.location}</td>
                                                        <td className="p-3">
                                                            <span className="font-semibold">{group.category}</span> {group.problem}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {hasMultiple ? (
                                                                <button
                                                                    onClick={() => toggleGroupExpand(group.id)}
                                                                    className="inline-flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors border border-purple-200 shadow-2xs"
                                                                    title="คลิกเพื่อดู/ซ่อนรายการแจ้งซ้ำ"
                                                                >
                                                                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                                                                    <span>ซ้ำ {group.repeatCount} รายการ</span>
                                                                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} />
                                                                </button>
                                                            ) : (
                                                                <span className="text-gray-400 font-normal text-[11px]">1 รายการ</span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <span
                                                                className={`inline-block w-20 py-1 rounded-full font-bold text-[11px] text-center ${group.severity === 'เร่งด่วน'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-gray-100 text-gray-600'
                                                                    }`}
                                                            >
                                                                {group.severity}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {renderStatusBadge(group.status)}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setActiveComplaint(group);
                                                                    setRemarkNote(group.note || '');
                                                                }}
                                                                className="p-1.5 text-gray-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                                                                title="ดูรายละเอียด"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>

                                                    {/* แสดงผลเฉพาะรายการซ้ำตั้งแต่ลำดับที่ 2 เป็นต้นไป (ข้อมูลจริงจาก DB) */}
                                                    {isExpanded && group.subItems.map((subItem) => (
                                                        <tr key={subItem.uniqueId} className="bg-purple-50/40 text-gray-600 border-l-4 border-l-purple-600 hover:bg-purple-100/40 transition-colors">
                                                            {deleteModeTable === 'all' && (
                                                                <td className="p-2.5 text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedIds.includes(subItem.id)}
                                                                        onChange={() => handleSelectRow(subItem.id)}
                                                                        className="rounded border-purple-300 text-purple-700 focus:ring-purple-400 h-3.5 w-3.5 cursor-pointer accent-purple-700"
                                                                    />
                                                                </td>
                                                            )}
                                                            <td className="p-2.5 pl-6 font-medium text-purple-800 text-[11px]">
                                                                ↳ {subItem.code}
                                                            </td>
                                                            <td className="p-2.5 text-[11px] whitespace-nowrap">{subItem.displayDate}</td>
                                                            <td className="p-2.5 text-[11px]">{subItem.location}</td>
                                                            <td className="p-2.5 text-[11px]">
                                                                <span className="font-semibold">{subItem.category}</span> {subItem.problem}
                                                            </td>
                                                            <td className="p-2.5 text-center">
                                                                <span className="text-purple-700 bg-purple-100 font-semibold px-2 py-0.5 rounded text-[10px] border border-purple-200">
                                                                    ลำดับที่ {subItem.repeatIndex}
                                                                </span>
                                                            </td>
                                                            <td className="p-2.5 text-center">
                                                                <span className={`inline-block w-20 py-1 rounded-full font-bold text-[10px] text-center ${subItem.severity === 'เร่งด่วน'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {subItem.severity}
                                                                </span>
                                                            </td>
                                                            <td className="p-2.5 text-center">
                                                                {renderStatusBadge(subItem.status)}
                                                            </td>
                                                            <td className="p-2.5 text-center">
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveComplaint(subItem);
                                                                        setRemarkNote(subItem.note || '');
                                                                    }}
                                                                    className="p-1 text-gray-500 hover:text-purple-700 hover:bg-purple-200/60 rounded transition-colors"
                                                                    title="ดูรายละเอียดรายการซ้ำ"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ---------------- ส่วนที่ 3 & 4 Grid Dual Columns ---------------- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 font-sans">
                    {/* ส่วนที่ 3: สรุปรายการความเสียหาย แยกตามหมวดหมู่ */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-[#6B21A8]">
                                    สรุปรายการความเสียหาย แยกตามหมวดหมู่
                                </h3>
                                <span className="text-[11px] text-gray-500 bg-purple-50 px-2 py-0.5 rounded-md hidden sm:inline">
                                    คลิกเพื่อดูรายการแจ้งซ่อม
                                </span>
                            </div>

                            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-200">
                                {filteredCategorySummary.map((cat, idx) => {
                                    const CatIcon = cat.icon;
                                    const fullSummaryText = cat.items.filter(i => i.count > 0).map(i => `${i.name} (${i.count} รายการ)`).join(' , ') || 'ไม่มีรายการชำรุดในหมวดหมู่นี้';

                                    return (
                                        <div key={idx} className={`p-3.5 rounded-xl border ${cat.borderColor} ${cat.bgColor} transition-all`}>
                                            <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-gray-200/60">
                                                <div className="flex items-center gap-2">
                                                    <CatIcon className={`w-4 h-4 ${cat.color}`} />
                                                    <h4 className="font-bold text-xs sm:text-sm text-gray-800">{cat.title}</h4>
                                                </div>
                                                <span className="text-[11px] font-semibold text-gray-500">
                                                    รวม {cat.items.reduce((acc, curr) => acc + curr.count, 0)} รายการ
                                                </span>
                                            </div>

                                            <ul className="space-y-1.5 mb-3">
                                                {cat.items.map((item, itemIdx) => (
                                                    <li
                                                        key={itemIdx}
                                                        onClick={() => setCategoryModalData({ category: cat.title, problem: item.name })}
                                                        className="flex justify-between items-center text-xs text-gray-700 bg-white/90 p-2 rounded-lg border border-gray-100 hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all shadow-2xs group"
                                                    >
                                                        <span className="truncate pr-2 font-medium group-hover:text-purple-900">• {item.name}</span>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md text-[11px]">
                                                                {item.count} รายการ
                                                            </span>
                                                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="pt-2.5 border-t border-gray-200/80 bg-white/60 -mx-1 -mb-1 p-2.5 rounded-lg">
                                                <span className="text-[11px] font-bold text-gray-700 block mb-1">
                                                    สรุปความเสียหายหมวด{cat.title}:
                                                </span>
                                                <p className="text-xs text-[#4C1D95] font-semibold leading-relaxed break-words">
                                                    {fullSummaryText}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ส่วนที่ 4: AI Insight ประจำเดือน (ขับเคลื่อนด้วย Gemini AI จริง) */}
                    <div className="bg-white border border-purple-200 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col font-sans">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#E9D5FF] rounded-lg flex items-center justify-center text-[#6B21A8] shrink-0">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-base text-gray-900">AI Insight ประจำเดือน</h3>
                            </div>

                            <div className="flex items-center gap-1.5">
                                {isAiLoading ? (
                                    <span className="text-[11px] bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3 animate-spin text-purple-600" />
                                        <span>AI กำลังวิเคราะห์...</span>
                                    </span>
                                ) : aiInsight.isRealAI ? (
                                    <span className="text-[11px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 shadow-xs">
                                        <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                                        <span>Gemini AI</span>
                                    </span>
                                ) : (
                                    <span className="text-[11px] bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full font-medium">
                                        ระบบสถิติ
                                    </span>
                                )}

                                <button
                                    onClick={fetchAiInsight}
                                    disabled={isAiLoading || complaints.length === 0}
                                    title="กดเพื่อวิเคราะห์ใหม่ด้วย Gemini AI"
                                    className="p-1 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-40"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            วิเคราะห์ภาพรวมการแจ้งซ่อมและคำแนะนำเพื่อการบำรุงรักษาเชิงป้องกัน
                        </p>

                        <div className="max-h-72 overflow-y-auto pr-1 space-y-3 text-xs text-gray-600 leading-relaxed scrollbar-thin scrollbar-thumb-purple-200">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5 text-xs">
                                    <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" />
                                    สรุปภาพรวมปัญหาประจำเดือน
                                </h4>
                                <p className="text-gray-600 leading-relaxed">
                                    {aiInsight.summaryText}
                                </p>
                            </div>

                            <div className="p-3 bg-[#FDF4FF] rounded-xl border border-purple-100">
                                <h4 className="font-bold text-[#4C1D95] mb-1 flex items-center gap-1.5 text-xs">
                                    <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                                    ข้อเสนอแนะในการปรับปรุง
                                </h4>
                                <ul className="space-y-1.5 text-gray-700">
                                    {aiInsight.suggestions.map((s, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-purple-500 shrink-0 mt-0.5">•</span>
                                            <span dangerouslySetInnerHTML={{ __html: s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---------------- ส่วนที่ 5: สรุปและเปรียบเทียบรายการแจ้งซ่อมย้อนหลัง ---------------- */}
                <div className="mb-6 space-y-4 font-sans">
                    <div className="overflow-hidden rounded-2xl shadow-sm">
                        <div className="bg-[#6B21A8] text-white px-4 py-3 flex items-center justify-between gap-3 cursor-pointer" onClick={() => setIsMonthlyHistoryOpen(!isMonthlyHistoryOpen)}>
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-1 rounded-md bg-white/10"><ChevronRight className={`w-5 h-5 transition-transform ${isMonthlyHistoryOpen ? 'rotate-90' : ''}`} /></div>
                                <span className="font-bold text-sm sm:text-base truncate">สรุปรายเดือน</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); exportToCSV('monthly'); }} className="shrink-0 flex items-center gap-1.5 rounded-xl border border-purple-300 bg-purple-700/70 px-3 py-1.5 text-xs font-bold hover:bg-purple-900 transition-colors" title="Export สรุปรายเดือน">
                                <Download className="w-4 h-4" /><span className="hidden sm:inline">Export</span>
                            </button>
                        </div>
                        {isMonthlyHistoryOpen && (
                            <div className="bg-white border border-t-0 border-purple-200 p-4">
                                <div className="flex flex-wrap items-center gap-3 mb-4 rounded-xl bg-purple-50/70 p-3 border border-purple-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-700">เลือกปี:</span>
                                        <select
                                            value={selectedHistoryMonthYear}
                                            onChange={(e) => setSelectedHistoryMonthYear(Number(e.target.value))}
                                            className="border border-purple-300 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#6B21A8] focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        >
                                            {availableYears.map((year) => (
                                                <option key={year} value={year}>
                                                    ปี {year} ({year + 543})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-700">ตั้งแต่เดือน:</span>
                                        <select
                                            value={selectedHistoryMonthStart}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setSelectedHistoryMonthStart(val);
                                                if (val > selectedHistoryMonthEnd) {
                                                    setSelectedHistoryMonthEnd(val);
                                                }
                                            }}
                                            className="border border-purple-300 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#6B21A8] focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        >
                                            {thaiMonths.map((m) => (
                                                <option key={m.value} value={m.value}>
                                                    {m.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-700">ถึงเดือน:</span>
                                        <select
                                            value={selectedHistoryMonthEnd}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setSelectedHistoryMonthEnd(val);
                                                if (val < selectedHistoryMonthStart) {
                                                    setSelectedHistoryMonthStart(val);
                                                }
                                            }}
                                            className="border border-purple-300 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#6B21A8] focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        >
                                            {thaiMonths.map((m) => (
                                                <option key={m.value} value={m.value}>
                                                    {m.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* แสดงข้อมูลสรุปของช่วงเดือนและปีที่เลือก */}
                                <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-purple-100 gap-2">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">ข้อมูลสรุปประจำช่วงเดือน</span>
                                            <h4 className="text-base font-bold text-[#4C1D95]">{selectedMonthData.label}</h4>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <span className="text-xs text-gray-500">ยอดรวมการแจ้งซ่อม: </span>
                                            <span className="text-lg font-black text-[#6B21A8]">{selectedMonthData.totalRepairs}</span>
                                            <span className="text-xs font-semibold text-gray-600"> รายการ</span>
                                        </div>
                                    </div>

                                    {/* แยกตามหมวดหมู่ */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                                        {selectedMonthData.categories.map((cat) => (
                                            <div key={cat.name} className="bg-white rounded-xl p-3 border border-purple-100 shadow-2xs">
                                                <div className="text-xs text-gray-500 font-medium">{cat.name}</div>
                                                <div className="text-base font-bold text-gray-800 mt-0.5">
                                                    {cat.count} <span className="text-xs font-normal text-gray-500">รายการ</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedMonthData.totalRepairs > 0 ? (
                                        <div className="space-y-2 mt-3">
                                            <div className="text-xs font-bold text-gray-700">รายการแจ้งซ่อมในช่วงเดือนนี้:</div>
                                            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-purple-200">
                                                {selectedMonthData.records.map((r) => (
                                                    <div key={r.id} className="bg-white p-2.5 rounded-lg border border-gray-200/80 text-xs flex items-center justify-between gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-semibold text-purple-900 truncate">{r.code} - {r.location}</div>
                                                            <div className="text-gray-600 truncate">{r.problem}</div>
                                                            <div className="text-[11px] text-gray-400">{r.displayDate}</div>
                                                        </div>
                                                        <div className="shrink-0">{renderStatusBadge(r.status)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-xs text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                            ไม่มีรายการแจ้งซ่อมในช่วงเดือนที่เลือก
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-2xl shadow-sm">
                        <div className="bg-[#5B00D6] text-white px-4 py-3 flex items-center justify-between gap-3 cursor-pointer" onClick={() => setIsYearlyHistoryOpen(!isYearlyHistoryOpen)}>
                            <div className="flex items-center gap-3 min-w-0"><div className="p-1 rounded-md bg-white/10"><ChevronRight className={`w-5 h-5 transition-transform ${isYearlyHistoryOpen ? 'rotate-90' : ''}`} /></div><span className="font-bold text-sm sm:text-base truncate">สรุปรายปี (ดูย้อนหลังได้ทุกปี)</span></div>
                            <button onClick={(e) => { e.stopPropagation(); exportToCSV('yearly'); showToast('ส่งออกข้อมูลรายปีย้อนหลังเรียบร้อยแล้ว'); }} className="flex items-center gap-1.5 rounded-xl border border-purple-300 bg-purple-700/70 px-3 py-1.5 text-xs font-bold hover:bg-purple-900 transition-colors" title="Export สรุปรายปีย้อนหลัง"><Download className="w-4 h-4" /><span className="hidden sm:inline">Export</span></button>
                        </div>
                        {isYearlyHistoryOpen && <div className="bg-white border border-t-0 border-purple-200 p-4">
                            <div className="flex flex-wrap items-center gap-2 mb-4"><label htmlFor="years-back" className="text-xs font-semibold text-gray-600">ดูย้อนหลัง</label><input id="years-back" type="number" min="1" value={yearsBack} onChange={(e) => setYearsBack(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 border border-purple-300 rounded-lg px-2 py-2 text-center text-xs font-bold text-[#6B21A8]" /><span className="text-xs font-semibold text-gray-600">ปี</span></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{displayedYearlyData.map((data) => <div key={data.year} className="rounded-xl border border-gray-200 p-3 hover:border-purple-300"><div className="flex justify-between"><span className="text-sm font-bold text-gray-800">ปี {data.year}</span><span className="text-sm font-black text-purple-900">{data.totalRepairs} รายการ</span></div><div className="mt-2 flex gap-3 text-[11px] text-gray-500">{data.categories.map((category) => <span key={category.name}>{category.name}: {category.count}</span>)}</div><button onClick={() => setSelectedHistoryYear(data.year)} className="mt-2 text-xs font-bold text-[#6B21A8] hover:underline"><Eye className="w-3.5 h-3.5 inline mr-1" />ดูรายละเอียด</button></div>)}</div>
                        </div>}
                    </div>
                </div>
            </main>

            {/* ---------------- Modal แสดงรายการแจ้งปัญหาตามหมวดหมู่ที่คลิก ---------------- */}
            {categoryModalData && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative border border-purple-100 max-h-[85vh] overflow-y-auto">
                        <button
                            onClick={() => setCategoryModalData(null)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-4">
                            <Wrench className="w-5 h-5 text-purple-700" />
                            <h3 className="font-bold text-base text-gray-900">
                                รายการแจ้งปัญหา: {categoryModalData.category}
                            </h3>
                        </div>

                        <p className="text-xs text-gray-500 mb-4">
                            รายการความเสียหายเฉพาะ: <span className="font-bold text-purple-900">{categoryModalData.problem}</span>
                        </p>

                        <div className="space-y-2.5">
                            {filteredComplaints
                                .filter(item => item.category === categoryModalData.category)
                                .map(item => (
                                    <div key={item.id} className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-purple-900">{item.code} - {item.location}</div>
                                            <div className="text-gray-600 mt-0.5">{item.problem}</div>
                                            <div className="text-[10px] text-gray-400 mt-1">{item.displayDate}</div>
                                        </div>
                                        {renderStatusBadge(item.status)}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- Modal แสดงรายการแจ้งซ่อมย้อนหลังตามปีที่เลือก ---------------- */}
            {selectedHistoryYear && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
                    <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl relative border border-purple-100 max-h-[85vh] overflow-y-auto">
                        <button
                            onClick={() => setSelectedHistoryYear(null)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-4">
                            <History className="w-5 h-5 text-purple-700" />
                            <h3 className="font-bold text-base sm:text-lg text-gray-900">
                                รายการแจ้งซ่อมย้อนหลังปี {selectedHistoryYear}
                            </h3>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-purple-100">
                            <table className="w-full text-left border-collapse min-w-[650px]">
                                <thead className="bg-[#E9D5FF] text-[#4C1D95] text-xs font-bold">
                                    <tr>
                                        <th className="p-3 w-1/6">ID</th>
                                        <th className="p-3 w-1/4">วัน/เดือน/ปี</th>
                                        <th className="p-3 w-1/4">สถานที่</th>
                                        <th className="p-3 w-1/3">หมวดหมู่/ปัญหา</th>
                                        <th className="p-3 text-center whitespace-nowrap w-24">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100 text-xs text-gray-700 bg-white">
                                    {(() => {
                                        const yearRecords = complaints.filter((item) => {
                                            const d = item.rawDate ? new Date(item.rawDate) : new Date(item.date);
                                            const y = !isNaN(d.getTime()) ? d.getFullYear() : null;
                                            return y === selectedHistoryYear;
                                        });

                                        if (yearRecords.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-8 text-gray-400">
                                                        ไม่พบข้อมูลรายการแจ้งซ่อมในปี {selectedHistoryYear}
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return yearRecords.map((item) => (
                                            <tr key={item.id} className="hover:bg-purple-50/50 transition-colors">
                                                <td className="p-3 font-bold text-purple-900 whitespace-nowrap">{item.code}</td>
                                                <td className="p-3 whitespace-nowrap">{item.displayDate}</td>
                                                <td className="p-3">{item.location}</td>
                                                <td className="p-3">
                                                    <span className="font-semibold">{item.category}</span> - {item.problem}
                                                </td>
                                                <td className="p-3 text-center whitespace-nowrap">
                                                    {renderStatusBadge(item.status)}
                                                </td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- Export Selection Modal (CSV) ---------------- */}
            {isExportOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative border border-purple-100 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsExportOpen(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2.5 mb-4">
                            <Download className="w-5 h-5 text-[#6B21A8]" />
                            <h3 className="font-bold text-base text-gray-900">เลือกข้อมูลที่ต้องการ Export (CSV)</h3>
                        </div>

                        <div className="mb-4 bg-purple-50/80 p-3 rounded-xl border border-purple-100">
                            <label className="block font-semibold text-gray-700 text-xs mb-2">
                                เลือกช่วงวันเดือนปีข้อมูลที่จะ Export:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <span className="text-[10px] text-gray-500 block mb-0.5">วันเริ่มต้น</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-purple-600"
                                    />
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 block mb-0.5">วันสิ้นสุด</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-[#FFFFFF] border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-purple-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-5 text-xs">
                            <label className="block font-semibold text-gray-700 mb-1">หมวดหมู่รายงาน:</label>

                            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${exportOption === 'complaints' ? 'border-purple-600 bg-purple-50/60' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    name="exportOption"
                                    value="complaints"
                                    checked={exportOption === 'complaints'}
                                    onChange={(e) => setExportOption(e.target.value)}
                                    className="mt-0.5 text-purple-600 focus:ring-purple-500"
                                />
                                <div>
                                    <div className="font-bold text-gray-800">รายการแจ้งซ่อมทั้งหมด / ตามวันที่เลือก</div>
                                    <div className="text-[11px] text-gray-500">
                                        {startDate || endDate ? `กรองตามวันที่: ${startDate || 'ทั้งหมด'} ถึง ${endDate || 'ปัจจุบัน'}` : 'รวมรายการทั้งหมดตามตัวกรองปัจจุบัน'}
                                    </div>
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${exportOption === 'category' ? 'border-purple-600 bg-purple-50/60' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    name="exportOption"
                                    value="category"
                                    checked={exportOption === 'category'}
                                    onChange={(e) => setExportOption(e.target.value)}
                                    className="mt-0.5 text-purple-600 focus:ring-purple-500"
                                />
                                <div>
                                    <div className="font-bold text-gray-800">สรุปรายการความเสียหาย แยกตามหมวดหมู่</div>
                                    <div className="text-[11px] text-gray-500">ข้อมูลสรุปจำนวนสิ่งของที่ชำรุดตามช่วงเวลาที่เลือก</div>
                                </div>
                            </label>

                            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${exportOption === 'ai' ? 'border-purple-600 bg-purple-50/60' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    name="exportOption"
                                    value="ai"
                                    checked={exportOption === 'ai'}
                                    onChange={(e) => setExportOption(e.target.value)}
                                    className="mt-0.5 text-purple-600 focus:ring-purple-500"
                                />
                                <div>
                                    <div className="font-bold text-gray-800">AI Insight ประจำเดือน</div>
                                    <div className="text-[11px] text-gray-500">บทวิเคราะห์ปัญหาและแนวทางป้องกันเชิงรุกประจำช่วงเวลา</div>
                                </div>
                            </label>
                        </div>

                        <div className="mb-6">
                            <label className="block font-semibold text-gray-700 text-xs mb-2">รูปแบบไฟล์ส่งออก:</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setExportFormat('excel')}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                        exportFormat === 'excel'
                                            ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-400/30 shadow-xs'
                                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                    <span>Excel (.xls) [แนะนำ]</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setExportFormat('csv')}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                        exportFormat === 'csv'
                                            ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-400/30 shadow-xs'
                                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span>CSV (.csv)</span>
                                </button>
                            </div>
                            <div className="mt-2.5 p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] text-gray-600 flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                                <span>
                                    {exportFormat === 'excel'
                                        ? '✨ แนะนำ: ปรับขนาดความกว้างช่อง (Cell) กว้างพอดี อ่านข้อความยาวได้ครบถ้วน ไม่โดนตัด พร้อมสรุปจำนวนเรื่องและความถี่แต่ละชั้น'
                                        : 'ℹ️ ไฟล์ CSV มาตรฐานพร้อมสรุปจำนวนเรื่องแจ้งเข้าและความถี่แต่ละชั้นที่ส่วนหัวของตาราง'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleExecuteExport}
                                className="flex-1 bg-[#6B21A8] hover:bg-purple-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                <span>ดาวน์โหลด {exportFormat === 'excel' ? 'Excel (.xls)' : 'CSV (.csv)'}</span>
                            </button>
                            <button
                                onClick={() => setIsExportOpen(false)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- Delete Confirmation Modal ---------------- */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-purple-100">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-bold text-gray-900 mb-2">ยืนยันการลบข้อมูล</h4>
                        <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                            ข้อมูลที่เลือกไว้ ({selectedIds.length} รายการ) จะถูกลบออกจากฐานข้อมูลและตารางทั้งหมดโดยอัตโนมัติและไม่สามารถกู้คืนได้
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={confirmDelete}
                                disabled={isUpdating}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                                {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>ยืนยัน</span>
                            </button>
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                disabled={isUpdating}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors disabled:opacity-50"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- Modal ยืนยันรายละเอียดปัญหา ---------------- */}
            {activeComplaint && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative border border-purple-100 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => {
                                setActiveComplaint(null);
                                setRemarkNote('');
                            }}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="font-bold text-base sm:text-lg text-center text-gray-900 mb-4">
                            รายละเอียดปัญหา
                        </h3>

                        <div className="text-xs text-center space-y-1.5 text-gray-700 mb-4 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                            <p><span className="font-semibold">วันเวลาที่แจ้ง :</span> {activeComplaint.displayDate}</p>
                            <p><span className="font-semibold">รหัสแจ้ง :</span> {activeComplaint.code}</p>
                            <p><span className="font-semibold">สถานที่ :</span> {activeComplaint.location}</p>
                            <p><span className="font-semibold">หมวดหมู่ :</span> {activeComplaint.category} {activeComplaint.problem}</p>
                            <div className="flex items-center justify-center gap-1.5">
                                <span className="font-semibold">สถานะปัจจุบัน :</span>
                                {renderStatusBadge(activeComplaint.status)}
                            </div>
                            {activeComplaint.repeatCount > 1 && (
                                <p className="text-purple-700 font-bold bg-purple-100/70 py-0.5 px-2 rounded-md inline-block mt-1">
                                    มีการแจ้งซ้ำรวม {activeComplaint.repeatCount} รายการ
                                </p>
                            )}
                        </div>

                        {/* แสดงรูปภาพทันทีและมีปุ่มดาวน์โหลดรูป */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-gray-700">รูปภาพความเสียหาย</label>
                                {activeComplaint.imageUrl && !isLoadingImage && (
                                    <button
                                        type="button"
                                        onClick={() => handleDownloadImage(activeComplaint.imageUrl, `complaint_${activeComplaint.code.replace(/[^a-zA-Z0-9_-]/g, '')}`)}
                                        className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-100/80 hover:bg-purple-200 border border-purple-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                                        title="ดาวน์โหลดรูปภาพ"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>ดาวน์โหลดรูปภาพ</span>
                                    </button>
                                )}
                            </div>

                            <div className="rounded-xl overflow-hidden bg-gray-50 border border-purple-200/60 min-h-[160px] max-h-[260px] flex items-center justify-center relative group">
                                {isLoadingImage ? (
                                    <div className="py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
                                        <Loader2 className="w-7 h-7 animate-spin text-purple-600" />
                                        <span className="text-xs font-medium">กำลังโหลดรูปภาพประกอบ...</span>
                                    </div>
                                ) : activeComplaint.imageUrl ? (
                                    <>
                                        <img
                                            src={activeComplaint.imageUrl}
                                            alt="รูปภาพความเสียหาย"
                                            onClick={() => setViewImageModal(true)}
                                            className="w-full h-full max-h-[260px] object-contain cursor-pointer hover:opacity-95 transition-opacity"
                                            title="คลิกเพื่อดูภาพขนาดใหญ่"
                                        />
                                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => setViewImageModal(true)}
                                                className="text-white hover:text-purple-200 p-1 text-[11px] font-semibold flex items-center gap-1"
                                                title="ดูภาพขนาดใหญ่"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">ขยายภาพ</span>
                                            </button>
                                            <span className="text-white/40">|</span>
                                            <button
                                                type="button"
                                                onClick={() => handleDownloadImage(activeComplaint.imageUrl, `complaint_${activeComplaint.code.replace(/[^a-zA-Z0-9_-]/g, '')}`)}
                                                className="text-white hover:text-purple-200 p-1 text-[11px] font-semibold flex items-center gap-1"
                                                title="ดาวน์โหลดรูปภาพ"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">โหลดรูป</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-10 text-gray-400 text-xs text-center flex flex-col items-center justify-center gap-1">
                                        <Eye className="w-6 h-6 text-gray-300" />
                                        <span>ไม่มีรูปภาพแนบสำหรับรายการนี้</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {activeComplaint.status === 'รอรับเรื่อง' ? (
                            <>
                                <div className="mb-5">
                                    <input
                                        type="text"
                                        value={remarkNote}
                                        onChange={(e) => setRemarkNote(e.target.value)}
                                        placeholder="*หมายเหตุ กรณีไม่รับเรื่อง"
                                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAcceptMain}
                                        disabled={isAcceptDisabled || isUpdating}
                                        className={`flex-1 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 ${isAcceptDisabled || isUpdating
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer'
                                            }`}
                                    >
                                        {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        <span>รับเรื่อง</span>
                                    </button>

                                    <button
                                        onClick={handleRejectMain}
                                        disabled={isUpdating}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                                    >
                                        {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        <span>ไม่รับเรื่อง</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            activeComplaint.note && (
                                <div className="mb-2 p-3 bg-gray-50 rounded-xl border border-purple-100 text-xs text-gray-700">
                                    <span className="font-semibold text-purple-900">หมายเหตุ: </span>
                                    {activeComplaint.note}
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* ---------------- Modal ป๊อปอัพเด้งกรอกหมายเหตุสำหรับการไม่รับเรื่องอัตโนมัติของรายการซ้ำ ---------------- */}
            {autoRejectModalOpen && pendingAcceptComplaint && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-purple-100">
                        <h4 className="text-base font-bold text-gray-900 mb-2">
                            กรอกหมายเหตุสำหรับรายการซ้ำที่เหลือ
                        </h4>
                        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                            คุณเลือกรับเรื่อง <span className="font-bold text-purple-700">รายการที่ 1 ({pendingAcceptComplaint.code})</span> แล้ว รายการที่เหลืออีก <span className="font-bold text-red-600">{pendingAcceptComplaint.repeatCount - 1} รายการ</span> จะถูกปรับเป็น <span className="font-bold text-red-600">"ไม่รับเรื่อง"</span> อัตโนมัติ โดยทั้งหมดจะใช้หมายเหตุเดียวกันด้านล่างนี้:
                        </p>

                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                หมายเหตุสำหรับรายการที่เหลือ ({pendingAcceptComplaint.repeatCount - 1} รายการ):
                            </label>
                            <input
                                type="text"
                                value={autoRejectNote}
                                onChange={(e) => setAutoRejectNote(e.target.value)}
                                placeholder="ระบุหมายเหตุ เช่น ข้อมูลซ้ำซ้อนกับรายการแรก..."
                                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmAcceptWithAutoReject}
                                disabled={isUpdating}
                                className="flex-1 bg-[#6B21A8] hover:bg-purple-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>ยืนยันการดำเนินการ</span>
                            </button>
                            <button
                                onClick={() => {
                                    setAutoRejectModalOpen(false);
                                    setPendingAcceptComplaint(null);
                                }}
                                disabled={isUpdating}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors disabled:opacity-50"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- Modal แสดงรูปภาพ ---------------- */}
            {viewImageModal && activeComplaint && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
                    <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full p-4 sm:p-5 relative shadow-2xl">
                        <div className="flex items-center justify-between mb-3 pr-8">
                            <h4 className="text-sm font-bold text-gray-800">
                                รูปภาพประกอบ: {activeComplaint.code}
                            </h4>
                            {activeComplaint.imageUrl && (
                                <button
                                    onClick={() => handleDownloadImage(activeComplaint.imageUrl, `complaint_${activeComplaint.code.replace(/[^a-zA-Z0-9_-]/g, '')}`)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#6B21A8] hover:bg-purple-900 px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                                    title="ดาวน์โหลดรูปภาพ"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>ดาวน์โหลดรูปภาพ</span>
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setViewImageModal(false)}
                            className="absolute right-3 top-3 bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="rounded-xl overflow-hidden bg-gray-100 min-h-[200px] max-h-[75vh] flex items-center justify-center">
                            {isLoadingImage ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-500">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                    <span className="text-xs font-medium">กำลังโหลดรูปภาพประกอบ...</span>
                                </div>
                            ) : activeComplaint.imageUrl ? (
                                <img
                                    src={activeComplaint.imageUrl}
                                    alt="รูปภาพความเสียหาย"
                                    className="w-full h-full max-h-[75vh] object-contain"
                                />
                            ) : (
                                <div className="py-12 text-gray-400 text-xs text-center">
                                    ไม่มีรูปภาพแนบสำหรับรายการนี้
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}