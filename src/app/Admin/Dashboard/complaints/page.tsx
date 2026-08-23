'use client';

import React, { useState, useMemo } from 'react';
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
    Layers
} from 'lucide-react';

// กำหนดหมวดหมู่หลักสำหรับสรุปผล
const defaultCategories = ['ระบบน้ำ', 'สุขภัณฑ์', 'ระบบไฟฟ้า'];

const categorySummary = [
    {
        title: 'ระบบน้ำ',
        icon: Droplets,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-100',
        items: [
            { name: 'ก๊อกน้ำอ่างล้างมือเสีย 4 ชุด', count: 4 },
            { name: 'ท่อน้ำรั่ว 3 จุด', count: 3 },
            { name: 'สายฉีดชำระเสีย 3 ชุด', count: 3 },
        ],
    },
    {
        title: 'สุขภัณฑ์',
        icon: Wrench,
        color: 'text-purple-600',
        bgColor: 'bg-[#FDF4FF]',
        borderColor: 'border-purple-100',
        items: [
            { name: 'อ่างล้างมือชำรุด 5 ชุด', count: 5 },
            { name: 'โถส้วมชำรุด 3 ชุด', count: 3 },
            { name: 'ฝารองนั่งชำรุด 2 ชุด', count: 2 },
        ],
    },
    {
        title: 'ระบบไฟฟ้า',
        icon: Zap,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-100',
        items: [
            { name: 'หลอดไฟเสีย 3 หลอด', count: 3 },
            { name: 'ไฟในห้องน้ำไม่ติด 4 ดวง', count: 4 },
            { name: 'ไฟกระพริบ 2 ดวง', count: 2 },
        ],
    },
];

// ปรับให้ป้ายสถานะมีความกว้าง (w-[90px]) และการตกแต่งที่เหมือนกัน
const renderStatusBadge = (status) => {
    if (status === 'แจ้งแล้ว') {
        return (
            <span className="inline-block w-[90px] py-1.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#059669] text-center shadow-xs">
                แจ้งแล้ว
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
    return (
        <span className="inline-block w-[90px] py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 text-center shadow-xs">
            {status}
        </span>
    );
};

interface ComplaintItem {
    id: string;
    rawId: number | string;
    code: string;
    date: string;
    displayDate: string;
    year: number;
    location: string;
    category: string;
    problem: string;
    severity: string;
    status: string;
    repeatCount: number;
    imageUrl: string;
    note: string;
    lineUserId?: string | null;
    repeatRejectNote?: string;
}

export default function ComplaintsPage() {
    const openMobileMenu = useOpenMobileMenu();

    // State จัดการข้อมูลรายการแจ้งซ่อม
    const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);

    // ดึงข้อมูลจาก Backend API (/api/requests)
    const fetchComplaints = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/requests');
            const result = await res.json();

            if (result.success && Array.isArray(result.data)) {
                // แปลงข้อมูลจาก Supabase maintenance_requests ให้ตรงกับฟิลด์ที่ใช้ใน UI
                const mappedData = result.data.map((item: any) => {
                    const reportedDate = item.reported_at ? new Date(item.reported_at) : new Date();
                    const formattedDate = reportedDate.toISOString().split('T')[0];
                    const displayDateStr = reportedDate.toLocaleString('th-TH', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }) + ' น.';

                    // สกัดหมวดหมู่เบื้องต้นจาก issue_summary หากไม่ได้ระบุ
                    let category = 'ระบบน้ำ';
                    const summary = item.issue_summary || '';
                    if (summary.includes('ไฟ') || summary.includes('หลอดไฟ') || summary.includes('ปลั๊ก')) {
                        category = 'ระบบไฟฟ้า';
                    } else if (summary.includes('ส้วม') || summary.includes('โถ') || summary.includes('อ่าง') || summary.includes('กระจก') || summary.includes('ประตู')) {
                        category = 'สุขภัณฑ์';
                    }

                    return {
                        id: String(item.id),
                        rawId: item.id,
                        code: item.ticket_number || `#REQ-${item.id}`,
                        date: formattedDate,
                        displayDate: displayDateStr,
                        year: reportedDate.getFullYear(),
                        location: item.location || 'ไม่ระบุสถานที่',
                        category: category,
                        problem: item.issue_summary || 'ไม่มีรายละเอียดปัญหา',
                        severity: item.priority || 'ปกติ',
                        status: item.status || 'รอรับเรื่อง',
                        repeatCount: item.repeat_count || 1,
                        imageUrl: item.image_url || '/photo/ปัญหาสายชำระชำรุด.jpg',
                        note: item.remark || '',
                        lineUserId: item.line_user_id || null,
                    };
                });
                setComplaints(mappedData);
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลจากเซิร์ฟเวอร์');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchComplaints();
    }, []);

    // State จัดการตารางที่กำลังเลือกโหมดลบ ('latest' หรือ 'all') เพื่อให้แยกกันแสดงผล UI
    const [deleteModeTable, setDeleteModeTable] = useState<string | null>(null);

    // State จัดการ Dropdown ยุบ/คลี่ตาราง (กำหนดให้เปิดค้างไว้เพื่อแสดงข้อมูลจริงทันที)
    const [isLatestOpen, setIsLatestOpen] = useState(true);
    const [isAllOpen, setIsAllOpen] = useState(true);

    const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [toastMessage, setToastMessage] = useState('');
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [exportOption, setExportOption] = useState('complaints');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [activeComplaint, setActiveComplaint] = useState<ComplaintItem | null>(null);
    const [remarkNote, setRemarkNote] = useState('');
    const [viewImageModal, setViewImageModal] = useState(false);
    const [categoryModalData, setCategoryModalData] = useState<any>(null);
    const [selectedHistoryYear, setSelectedHistoryYear] = useState<number | null>(null);

    const [autoRejectModalOpen, setAutoRejectModalOpen] = useState(false);
    const [autoRejectNote, setAutoRejectNote] = useState('');
    const [pendingAcceptComplaint, setPendingAcceptComplaint] = useState<ComplaintItem | null>(null);

    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(3);
    const notifications = [
        { id: 1, title: 'มีการแจ้งซ่อมใหม่', desc: 'สายฉีดชำระชำรุด ห้องน้ำชาย ชั้น 2', time: '5 นาทีที่แล้ว' },
        { id: 2, title: 'อัปเดตสถานะงาน', desc: 'ช่างรับเรื่องแล้ว: ก๊อกน้ำอ่างล้างมือ ชั้น 1', time: '20 นาทีที่แล้ว' },
        { id: 3, title: 'ตรวจพบเรื่องแจ้งซ้ำ', desc: 'โถส้วมชำรุด ห้องน้ำหญิง ชั้น 1 (4 ครั้ง)', time: '1 ชั่วโมงที่แล้ว' },
    ];

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const filteredComplaints = useMemo(() => {
        return complaints
            .filter((item) => {
                const matchCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
                const itemDate = item.date;
                const matchStart = !startDate || itemDate >= startDate;
                const matchEnd = !endDate || itemDate <= endDate;
                return matchCategory && matchStart && matchEnd;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [complaints, selectedCategory, startDate, endDate]);

    // State สำหรับระบุจำนวนปีย้อนหลัง (ไม่รวมปีปัจจุบัน) ค่าเริ่มต้น 3 ปี
    const [yearsBackInput, setYearsBackInput] = useState<number | string>(3);

    const yearlyComparisonData = useMemo(() => {
        const yearsMap: { [year: number]: { [cat: string]: number } } = {};

        complaints.forEach(item => {
            const y = item.year || new Date().getFullYear();
            if (!yearsMap[y]) {
                yearsMap[y] = { 'ระบบน้ำ': 0, 'สุขภัณฑ์': 0, 'ระบบไฟฟ้า': 0 };
            }
            const cat = defaultCategories.includes(item.category) ? item.category : 'ระบบน้ำ';
            yearsMap[y][cat] = (yearsMap[y][cat] || 0) + 1;
        });

        const currentYear = new Date().getFullYear();
        const numYearsBack = Math.max(1, Number(yearsBackInput) || 1);
        
        // สร้างเฉพาะปีย้อนหลัง (ไม่รวมปีปัจจุบัน) เช่น ถ้ากรอก 3 และปีปัจจุบันคือ 2026 -> 2023, 2024, 2025
        const yearsToGenerate: number[] = [];
        for (let i = numYearsBack; i >= 1; i--) {
            yearsToGenerate.push(currentYear - i);
        }

        const sortedYears = Array.from(new Set(yearsToGenerate)).sort((a, b) => a - b);

        return sortedYears.map(y => {
            const catData = yearsMap[y] || { 'ระบบน้ำ': 0, 'สุขภัณฑ์': 0, 'ระบบไฟฟ้า': 0 };
            const totalRepairs = Object.values(catData).reduce((a, b) => a + b, 0);
            return {
                year: y,
                totalRepairs,
                categories: Object.entries(catData).map(([name, count]) => ({ name, count }))
            };
        });
    }, [complaints, yearsBackInput]);

    const historicalAnalysis = useMemo(() => {
        let maxYearObj = yearlyComparisonData[0] || { year: new Date().getFullYear(), totalRepairs: 0, categories: [] };
        let maxSystemYear: number | string = new Date().getFullYear();
        let maxSystemName = 'ไม่มีข้อมูล';
        let maxSystemCount = 0;

        yearlyComparisonData.forEach(y => {
            if (y.totalRepairs > maxYearObj.totalRepairs) {
                maxYearObj = y;
            }
            y.categories.forEach(c => {
                if (c.count > maxSystemCount) {
                    maxSystemCount = c.count;
                    maxSystemName = c.name;
                    maxSystemYear = y.year;
                }
            });
        });

        return {
            maxYear: maxYearObj.year,
            maxYearCount: maxYearObj.totalRepairs,
            maxSystemYear,
            maxSystemName,
            maxSystemCount
        };
    }, [yearlyComparisonData]);

    const groupedComplaintsByRepeat = useMemo(() => {
        const sorted = [...filteredComplaints].sort((a, b) => b.repeatCount - a.repeatCount);
        let globalIndex = 1;

        return sorted.map((item) => {
            const prefixMatch = item.code.match(/^(#[A-Za-z0-9]+)-/);
            const prefix = prefixMatch ? prefixMatch[1] : '#AW1';

            const subItems = [];
            for (let i = 0; i < item.repeatCount; i++) {
                const codeNumber = String(globalIndex).padStart(2, '0');
                const derivedStatus = (item.status === 'แจ้งแล้ว' && i > 0) ? 'ไม่รับเรื่อง' : item.status;

                subItems.push({
                    ...item,
                    uniqueId: `${item.id}-repeat-${i + 1}`,
                    code: `${prefix}-${codeNumber}`,
                    repeatIndex: i + 1,
                    status: derivedStatus,
                    note: (item.status === 'แจ้งแล้ว' && i > 0) ? (item.repeatRejectNote || 'ข้อมูลซ้ำซ้อนกับรายการหลักที่รับเรื่องแล้ว') : item.note
                });
                globalIndex++;
            }

            return {
                ...item,
                primaryCode: subItems[0].code,
                subItems: subItems
            };
        });
    }, [filteredComplaints]);

    const toggleGroupExpand = (groupId) => {
        setExpandedGroupIds(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    const dynamicCategorySummary = useMemo(() => {
        const categoryMap: {
            [title: string]: {
                title: string;
                icon: any;
                color: string;
                bgColor: string;
                borderColor: string;
                itemsMap: { [problem: string]: number };
            }
        } = {
            'ระบบน้ำ': {
                title: 'ระบบน้ำ',
                icon: Droplets,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-100',
                itemsMap: {},
            },
            'สุขภัณฑ์': {
                title: 'สุขภัณฑ์',
                icon: Wrench,
                color: 'text-purple-600',
                bgColor: 'bg-[#FDF4FF]',
                borderColor: 'border-purple-100',
                itemsMap: {},
            },
            'ระบบไฟฟ้า': {
                title: 'ระบบไฟฟ้า',
                icon: Zap,
                color: 'text-amber-600',
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-100',
                itemsMap: {},
            },
        };

        filteredComplaints.forEach((c) => {
            const catKey = defaultCategories.includes(c.category) ? c.category : 'ระบบน้ำ';
            const problemName = c.problem ? c.problem.trim() : 'ไม่มีรายละเอียดปัญหา';
            if (!categoryMap[catKey].itemsMap[problemName]) {
                categoryMap[catKey].itemsMap[problemName] = 0;
            }
            categoryMap[catKey].itemsMap[problemName] += 1;
        });

        return Object.values(categoryMap).map((cat) => {
            const items = Object.entries(cat.itemsMap).map(([name, count]) => ({
                name,
                count,
            }));
            return {
                title: cat.title,
                icon: cat.icon,
                color: cat.color,
                bgColor: cat.bgColor,
                borderColor: cat.borderColor,
                items: items.length > 0 ? items : [{ name: 'ไม่มีเรื่องแจ้งซ่อมในหมวดนี้', count: 0 }],
            };
        });
    }, [filteredComplaints]);

    // AI Insight คำนวณจากข้อมูลจริง (rule-based analysis)
    const aiInsight = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // ใช้ filteredComplaints ของเดือนปัจจุบัน
        const monthComplaints = complaints.filter(c => {
            const d = new Date(c.date || Date.now());
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });

        const total = monthComplaints.length;

        // วิเคราะห์หมวดหมู่
        const catCount: { [key: string]: number } = { 'ระบบน้ำ': 0, 'สุขภัณฑ์': 0, 'ระบบไฟฟ้า': 0 };
        monthComplaints.forEach(c => {
            if (defaultCategories.includes(c.category)) {
                catCount[c.category] = (catCount[c.category] || 0) + 1;
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
        monthComplaints.forEach(c => {
            const loc = c.location || 'ไม่ระบุสถานที่';
            locCount[loc] = (locCount[loc] || 0) + 1;
        });
        const topLoc = Object.entries(locCount).sort((a, b) => b[1] - a[1])[0];
        const topLocName = topLoc ? topLoc[0] : null;
        const topLocCount = topLoc ? topLoc[1] : 0;

        // รายการรอรับเรื่อง
        const pendingCount = monthComplaints.filter(c => c.status === 'รอรับเรื่อง').length;
        // อัตราการรับเรื่อง
        const acceptedCount = monthComplaints.filter(c => ['แจ้งแล้ว', 'กำลังดำเนินการ', 'เสร็จสิ้น'].includes(c.status)).length;
        const acceptRate = total > 0 ? Math.round((acceptedCount / total) * 100) : 0;

        // รายการแจ้งซ้ำ (สถานที่+ปัญหาเดิม)
        const dupGroups = Object.values(
            monthComplaints.reduce((acc: { [k: string]: any[] }, c) => {
                const k = `${c.location || ''}-${c.problem || ''}`;
                if (!acc[k]) acc[k] = [];
                acc[k].push(c);
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
            summaryText = 'ยังไม่มีการแจ้งซ่อมในเดือนนี้ (ตามตัวกรองที่เลือก)';
        } else {
            summaryText = `เดือนนี้มีการแจ้งซ่อมทั้งหมด ${total} รายการ`;
            if (topLocName && topLocCount >= 2) {
                summaryText += ` โดยสถานที่ที่มีปัญหาบ่อยที่สุดคือ ${topLocName} (${topLocCount} รายการ)`;
            }
            summaryText += ` หมวดหมู่ที่มีปัญหามากที่สุดคือ ${topCatName} (${topCatPct}%)`;
            summaryText += ` อัตราการรับเรื่อง ${acceptRate}%`;
        }

        return { summaryText, suggestions, total };
    }, [complaints]);

    const handleSelectAll = () => {
        if (selectedIds.length === filteredComplaints.length && filteredComplaints.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredComplaints.map((item) => item.id));
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const confirmDelete = () => {
        setComplaints((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        setDeleteModalOpen(false);
        setDeleteModeTable(null);
        showToast('ลบข้อมูลเรียบร้อยแล้ว');
    };

    const exportToCSV = (type) => {
        let headers = [];
        let rows = [];
        let filename = `export_report_${new Date().toISOString().slice(0, 10)}.csv`;

        if (type === 'complaints') {
            filename = `complaints_report_${new Date().toISOString().slice(0, 10)}.csv`;
            headers = ['ID', 'วัน/เดือน/ปี', 'สถานที่', 'หมวดหมู่', 'ปัญหา', 'ระดับความสำคัญ', 'สถานะ', 'หมายเหตุ'];
            rows = filteredComplaints.map(item => [
                `"${item.code}"`,
                `"${item.displayDate}"`,
                `"${item.location}"`,
                `"${item.category}"`,
                `"${item.problem}"`,
                `"${item.severity}"`,
                `"${item.status}"`,
                `"${item.note || ''}"`
            ]);
        } else if (type === 'category') {
            filename = `category_summary_${new Date().toISOString().slice(0, 10)}.csv`;
            headers = ['หมวดหมู่', 'รายการความเสียหาย', 'จำนวน (รายการ)'];
            dynamicCategorySummary.forEach(cat => {
                cat.items.forEach(item => {
                    rows.push([`"${cat.title}"`, `"${item.name}"`, `"${item.count}"`]);
                });
            });
        } else if (type === 'ai') {
            filename = `ai_insight_${new Date().toISOString().slice(0, 10)}.csv`;
            headers = ['ส่วนงาน', 'รายละเอียด / ข้อเสนอแนะ'];
            rows = [
                ['"สรุปภาพรวมปัญหาประจำเดือน"', '"ห้องน้ำชาย ชั้น 2 โซน A มีเรื่องแจ้งซ่อมบ่อยที่สุดในเดือนนี้ (รวม 9 ครั้ง)"'],
                ['"ข้อเสนอแนะในการปรับปรุง 1"', '"เพิ่มรอบการตรวจเช็คสภาพอุปกรณ์สุขภัณฑ์ชั้น 2 เป็นสัปดาห์ละ 2 ครั้ง"'],
                ['"ข้อเสนอแนะในการปรับปรุง 2"', '"จัดซื้อสำรองอะไหล่ประเภทชุดสายฉีดชำระและหลอดไฟ LED ล่วงหน้า 15%"'],
                ['"ข้อเสนอแนะในการปรับปรุง 3"', '"ดำเนินการเปลี่ยนหลอดไฟยกเซ็ตในโซนที่มีการแจ้งไฟกระพริบซ้ำเกิน 3 ครั้ง"']
            ];
        }

        const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
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

    const handleExecuteExport = () => {
        setIsExportOpen(false);
        exportToCSV(exportOption);
        showToast(`ส่งออกไฟล์ CSV เรียบร้อยแล้ว`);
    };

    const updateComplaintStatusAPI = async (id: string, newStatus: string, remarkText?: string) => {
        try {
            const res = await fetch(`/api/requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    remark: remarkText || '',
                    notification_message: `สถานะรายการแจ้งซ่อม #${id} ถูกเปลี่ยนเป็น: ${newStatus}${remarkText ? ` (${remarkText})` : ''}`
                })
            });
            const result = await res.json();
            if (result.success) {
                if (result.line_notified) {
                    showToast('อัปเดตสถานะและส่งแจ้งเตือนทาง LINE เรียบร้อยแล้ว');
                } else {
                    showToast('อัปเดตสถานะลงฐานข้อมูลเรียบร้อยแล้ว');
                }
                fetchComplaints();
            } else {
                showToast(result.message || 'ไม่สามารถอัปเดตสถานะได้');
            }
        } catch (err) {
            console.error('Failed to update status:', err);
            showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        }
    };

    const handleAcceptMain = async () => {
        if (!activeComplaint) return;

        if (activeComplaint.repeatCount > 1) {
            setPendingAcceptComplaint(activeComplaint);
            setAutoRejectNote(`ข้อมูลซ้ำซ้อนกับรายการที่ 1 (${activeComplaint.code}) ที่รับเรื่องแล้ว`);
            setAutoRejectModalOpen(true);
        } else {
            await updateComplaintStatusAPI(activeComplaint.id, 'แจ้งแล้ว');
            setActiveComplaint(null);
            setRemarkNote('');
        }
    };

    const confirmAcceptWithAutoReject = async () => {
        if (!pendingAcceptComplaint) return;

        await updateComplaintStatusAPI(
            pendingAcceptComplaint.id,
            'แจ้งแล้ว',
            autoRejectNote || 'ข้อมูลซ้ำซ้อนกับรายการแรกที่รับเรื่องแล้ว'
        );

        setAutoRejectModalOpen(false);
        setActiveComplaint(null);
        setPendingAcceptComplaint(null);
        setRemarkNote('');
        setAutoRejectNote('');
    };

    const handleRejectMain = async () => {
        if (!activeComplaint) return;

        const noteToSave = remarkNote.trim() || 'ไม่รับเรื่อง (ข้อมูลซ้ำซ้อน/รายละเอียดไม่ชัดเจน)';
        await updateComplaintStatusAPI(activeComplaint.id, 'ไม่รับเรื่อง', noteToSave);

        setActiveComplaint(null);
        setRemarkNote('');
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
                                        <th className="p-3 text-center">รายละเอียด</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-100 text-xs text-gray-700 bg-white">
                                    {filteredComplaints.length === 0 ? (
                                        <tr>
                                            <td colSpan={deleteModeTable === 'latest' ? 8 : 7} className="text-center py-8 text-gray-400">
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
                                รวมทั้งหมด {groupedComplaintsByRepeat.length} กลุ่มรายการ
                            </span>
                            {deleteModeTable === 'all' && isAllOpen && (
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
                                    {groupedComplaintsByRepeat.length === 0 ? (
                                        <tr>
                                            <td colSpan={deleteModeTable === 'all' ? 9 : 8} className="text-center py-8 text-gray-400">
                                                ไม่พบข้อมูล
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
                                                                    onChange={() => handleSelectRow(group.id)}
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

                                                    {isExpanded && group.subItems.map((subItem) => (
                                                        <tr key={subItem.uniqueId} className="bg-purple-50/30 text-gray-600 border-l-4 border-l-purple-600">
                                                            {deleteModeTable === 'all' && <td></td>}
                                                            <td className="p-2.5 pl-6 font-medium text-purple-800 text-[11px]">
                                                                ↳ {subItem.code}
                                                            </td>
                                                            <td className="p-2.5 text-[11px] whitespace-nowrap">{subItem.displayDate}</td>
                                                            <td className="p-2.5 text-[11px]">{subItem.location}</td>
                                                            <td className="p-2.5 text-[11px] italic">
                                                                รายการซ้ำครั้งที่ {subItem.repeatIndex} - {subItem.problem}
                                                            </td>
                                                            <td className="p-2.5 text-center text-[10px] text-gray-400">
                                                                ซ้ำในระบบ
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
                                                                    className="p-1 text-gray-500 hover:text-purple-700"
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
                                {dynamicCategorySummary.map((cat, idx) => {
                                    const CatIcon = cat.icon;
                                    const fullSummaryText = cat.items.filter(i => i.count > 0).map(i => `${i.name} (${i.count} รายการ)`).join(' , ') || 'ไม่มีรายการแจ้งซ่อม';

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

                    {/* ส่วนที่ 4: AI Insight ประจำเดือน (คำนวณจากข้อมูลจริง) */}
                    <div className="bg-white border border-purple-200 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col font-sans">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-[#E9D5FF] rounded-lg flex items-center justify-center text-[#6B21A8] shrink-0">
                                <Bot className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-gray-900">AI Insight ประจำเดือน</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            วิเคราะห์ภาพรวมการแจ้งซ่อมและคำแนะนำเพื่อการบำรุงรักษาเชิงป้องกัน
                        </p>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-700 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="max-h-72 overflow-y-auto pr-1 space-y-3 text-xs text-gray-600 leading-relaxed scrollbar-thin scrollbar-thumb-purple-200">
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-1.5 flex items-center gap-1.5 text-xs">
                                        <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" />
                                        สรุปภาพรวมปัญหาประจำเดือน
                                    </h4>
                                    <p className="text-gray-600 leading-relaxed">
                                        {aiInsight.summaryText}
                                    </p>
                                </div>

                                <div className="p-3 bg-[#FDF4FF] rounded-xl border border-purple-100">
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

                {/* ---------------- ส่วนที่ 5: สรุปและเปรียบเทียบรายการแจ้งซ่อมย้อนหลัง 3 ปี ---------------- */}
                <div className="bg-white border border-purple-200 rounded-2xl p-4 md:p-6 shadow-sm mb-6 font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-purple-100">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-purple-100 text-[#6B21A8] rounded-xl">
                                <History className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    สรุปรายการความเสียหายและการเปรียบเทียบย้อนหลัง ({yearlyComparisonData.length > 0 ? `${yearlyComparisonData[0].year} - ${yearlyComparisonData[yearlyComparisonData.length - 1].year}` : ''})
                                </h3>
                                <p className="text-xs text-gray-500">
                                    การวิเคราะห์เชิงสถิติความถี่การแจ้งซ่อม
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-semibold">ย้อนหลัง</span>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={yearsBackInput}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setYearsBackInput(val === '' ? '' : Math.max(1, parseInt(val, 10) || 1));
                                }}
                                className="w-16 bg-purple-50 text-[#6B21A8] font-bold text-xs text-center px-2 py-1.5 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <span className="text-xs text-gray-500 font-semibold">ปี (ไม่รวมปีปัจจุบัน)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-md relative overflow-hidden">
                            <div className="absolute right-2 bottom-2 text-white/10 pointer-events-none">
                                <TrendingUp className="w-24 h-24" />
                            </div>
                            <span className="text-[11px] font-semibold text-purple-200 uppercase tracking-wider block mb-1">
                                สถิติสูงสุดประจำช่วงปี
                            </span>
                            <h4 className="text-sm font-semibold text-purple-100 mb-2">ปีที่มีการแจ้งซ่อมมากที่สุด</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-amber-300">ปี {historicalAnalysis.maxYear}</span>
                                <span className="text-xs text-purple-200">รวมทั้งสิ้น {historicalAnalysis.maxYearCount} รายการ</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6B21A8] to-purple-800 text-white shadow-md relative overflow-hidden">
                            <div className="absolute right-2 bottom-2 text-white/10 pointer-events-none">
                                <BarChart3 className="w-24 h-24" />
                            </div>
                            <span className="text-[11px] font-semibold text-purple-200 uppercase tracking-wider block mb-1">
                                ระบบที่มีความชำรุดสูงสุด
                            </span>
                            <h4 className="text-sm font-semibold text-purple-100 mb-2">ระบบที่มีการแจ้งซ่อมมากที่สุด</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-amber-300">ปี {historicalAnalysis.maxSystemYear} ({historicalAnalysis.maxSystemName})</span>
                                <span className="text-xs text-purple-200">จำนวน {historicalAnalysis.maxSystemCount} ครั้ง</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {yearlyComparisonData.map((data) => {
                            const isHighestYear = data.year === historicalAnalysis.maxYear;
                            return (
                                <div
                                    key={data.year}
                                    className={`p-4 rounded-xl border transition-all ${isHighestYear
                                        ? 'border-purple-300 bg-purple-50/70 shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-purple-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-base text-gray-800">ปี {data.year}</h4>
                                        {isHighestYear && (
                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                                ซ่อมมากที่สุด
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-xs font-semibold text-gray-600 mb-3 pb-2 border-b border-gray-100 flex justify-between">
                                        <span>ยอดซ่อมรวม:</span>
                                        <span className="font-bold text-purple-900">{data.totalRepairs} รายการ</span>
                                    </div>

                                    <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                                        {data.categories.map((c, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <span>• {c.name}</span>
                                                <span className="font-medium text-gray-800">{c.count} ครั้ง</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setSelectedHistoryYear(data.year)}
                                        className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-purple-100 text-[#6B21A8] border border-purple-300 font-bold py-2 rounded-lg text-xs transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>ดูข้อมูลแจ้งซ่อม (แจ้งแล้ว)</span>
                                    </button>
                                </div>
                            );
                        })}
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
                                    {complaints
                                        .filter((item: any) => item.year === selectedHistoryYear)
                                        .map((item: any) => (
                                            <tr key={item.id} className="hover:bg-purple-50/50 transition-colors">
                                                <td className="p-3 font-bold text-purple-900 whitespace-nowrap">{item.code}</td>
                                                <td className="p-3 whitespace-nowrap">{item.displayDate}</td>
                                                <td className="p-3">{item.location}</td>
                                                <td className="p-3">{item.category} - {item.problem}</td>
                                                <td className="p-3 text-center whitespace-nowrap">
                                                    {renderStatusBadge(item.status)}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- Export Selection Modal (เฉพาะ CSV) ---------------- */}
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
                            <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-700 font-bold text-xs shadow-xs">
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                <span>ไฟล์ CSV (Comma Separated Values)</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleExecuteExport}
                                className="flex-1 bg-[#6B21A8] hover:bg-purple-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>ดาวน์โหลด CSV</span>
                            </button>
                            <button
                                onClick={() => setIsExportOpen(false)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
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
                            ข้อมูลที่เลือกไว้ ({selectedIds.length} รายการ) จะถูกลบออกจากตารางทั้งหมดโดยอัตโนมัติและไม่สามารถกู้คืนได้
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={confirmDelete}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
                            >
                                ยืนยัน
                            </button>
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
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
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative border border-purple-100 max-h-[90vh] overflow-y-auto">
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

                        <div className="text-xs text-center space-y-1.5 text-gray-700 mb-5 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
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

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">ไฟล์ภาพ</label>
                            <button
                                onClick={() => setViewImageModal(true)}
                                className="w-full flex items-center justify-between border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-600 hover:border-purple-400 hover:bg-purple-50/30 transition-colors"
                            >
                                <span className="flex items-center gap-2 truncate">
                                    <Eye className="w-4 h-4 text-purple-600 shrink-0" />
                                    <span>คลิกเพื่อเปิดดูรูปถ่ายความเสียหาย</span>
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                            </button>
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
                                        disabled={isAcceptDisabled}
                                        className={`flex-1 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center ${isAcceptDisabled
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                            : 'bg-cyan-400 hover:bg-cyan-500 text-white shadow-sm cursor-pointer'
                                            }`}
                                    >
                                        <span>รับเรื่อง</span>
                                    </button>

                                    <button
                                        onClick={handleRejectMain}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center shadow-sm cursor-pointer"
                                    >
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
                                className="flex-1 bg-[#6B21A8] hover:bg-purple-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm"
                            >
                                ยืนยันการดำเนินการ
                            </button>
                            <button
                                onClick={() => {
                                    setAutoRejectModalOpen(false);
                                    setPendingAcceptComplaint(null);
                                }}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
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
                    <div className="bg-white rounded-2xl max-w-lg w-full p-4 relative shadow-2xl">
                        <button
                            onClick={() => setViewImageModal(false)}
                            className="absolute right-3 top-3 bg-black/50 text-white hover:bg-black p-1.5 rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h4 className="text-sm font-bold text-gray-800 mb-3">
                            รูปภาพประกอบ: {activeComplaint.code}
                        </h4>
                        <div className="rounded-xl overflow-hidden bg-gray-100 max-h-[70vh] flex items-center justify-center">
                            <img
                                src={activeComplaint.imageUrl}
                                alt="รูปภาพความเสียหาย"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}