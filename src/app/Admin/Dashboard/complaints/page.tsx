'use client';

import React, { useState, useMemo } from 'react';
import { useOpenMobileMenu } from '@/components/MobileMenuContext';
import {
    LayoutDashboard,
    Wrench,
    Clock,
    Users,
    Menu,
    Bell,
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

// ข้อมูลจำลองรายการแจ้งซ่อมปัจจุบัน
const initialComplaints = [
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
        note: ''
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
        note: ''
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
        note: ''
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
        note: ''
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
        note: 'ข้อมูลซ้ำซ้อนกับเคส #ST2-01 ที่กำลังดำเนินการอยู่'
    }
];

// ข้อมูลจำลองรายการแจ้งซ่อมย้อนหลัง (เฉพาะที่มีสถานะ "รับเรื่อง")
const historicalComplaints = [
    { id: 'h24-1', code: '#AW24-01', year: 2024, date: '2024-03-15', displayDate: '15/03/2024 09:00 น.', location: 'ห้องน้ำชาย ชั้น 1', category: 'ระบบน้ำ', problem: 'สายฉีดชำระเสีย 3 ชุด', severity: 'ปกติ', status: 'รับเรื่อง' },
    { id: 'h24-2', code: '#AW24-02', year: 2024, date: '2024-05-10', displayDate: '10/05/2024 11:30 น.', location: 'ห้องน้ำหญิง ชั้น 2', category: 'ระบบน้ำ', problem: 'ก๊อกน้ำอ่างล้างมือเสีย 4 ชุด', severity: 'เร่งด่วน', status: 'รับเรื่อง' },
    { id: 'h24-3', code: '#ES24-01', year: 2024, date: '2024-07-22', displayDate: '22/07/2024 14:00 น.', location: 'ห้องน้ำชาย ชั้น 3', category: 'ระบบไฟฟ้า', problem: 'หลอดไฟเสีย 5 หลอด', severity: 'ปกติ', status: 'รับเรื่อง' },
    { id: 'h24-4', code: '#ST24-01', year: 2024, date: '2024-10-05', displayDate: '05/10/2024 16:45 น.', location: 'ห้องน้ำหญิง ชั้น 1', category: 'สุขภัณฑ์', problem: 'อ่างล้างมือชำรุด 5 ชุด', severity: 'ปกติ', status: 'รับเรื่อง' },
    { id: 'h25-1', code: '#AW25-01', year: 2025, date: '2025-01-14', displayDate: '14/01/2025 08:30 น.', location: 'ห้องน้ำหญิง ชั้น 1 โซน A', category: 'ระบบน้ำ', problem: 'ท่อน้ำรั่ว 3 จุด', severity: 'เร่งด่วน', status: 'รับเรื่อง' },
    { id: 'h25-2', code: '#AW25-02', year: 2025, date: '2025-03-20', displayDate: '20/03/2025 10:15 น.', location: 'ห้องน้ำชาย ชั้น 2 โซน B', category: 'ระบบน้ำ', problem: 'สายฉีดชำระเสีย 4 ชุด', severity: 'ปกติ', status: 'รับเรื่อง' },
    { id: 'h25-3', code: '#AW25-03', year: 2025, date: '2025-06-12', displayDate: '12/06/2025 13:00 น.', location: 'ห้องน้ำหญิง ชั้น 3 โซน A', category: 'ระบบน้ำ', problem: 'ก๊อกน้ำอ่างล้างมือเสีย 6 ชุด', severity: 'ปกติ', status: 'รับเรื่อง' },
    { id: 'h25-4', code: '#ST25-01', year: 2025, date: '2025-08-18', displayDate: '18/08/2025 15:40 น.', location: 'ห้องน้ำชาย ชั้น 1 โซน A', category: 'สุขภัณฑ์', problem: 'โถส้วมชำรุด 4 ชุด', severity: 'เร่งด่วน', status: 'รับเรื่อง' },
    { id: 'h25-5', code: '#ES25-01', year: 2025, date: '2025-11-30', displayDate: '30/11/2025 09:20 น.', location: 'ห้องน้ำหญิง ชั้น 2 โซน B', category: 'ระบบไฟฟ้า', problem: 'หลอดไฟเสีย 6 หลอด', severity: 'ปกติ', status: 'รับเรื่อง' },
    { id: 'h26-1', code: '#AW26-01', year: 2026, date: '2026-02-05', displayDate: '05/02/2026 10:00 น.', location: 'ห้องน้ำชาย ชั้น 2 โซน A', category: 'ระบบน้ำ', problem: 'สายฉีดชำระเสีย 3 ชุด', severity: 'ปกติ', status: 'รับเรื่อง' },
    { id: 'h26-2', code: '#ES26-01', year: 2026, date: '2026-04-12', displayDate: '12/04/2026 11:30 น.', location: 'ห้องน้ำหญิง ชั้น 1 โซน A', category: 'ระบบไฟฟ้า', problem: 'หลอดไฟเสีย 3 หลอด', severity: 'ปกติ', status: 'รับเรื่อง' },
    { id: 'h26-3', code: '#ST26-01', year: 2026, date: '2026-06-25', displayDate: '25/06/2026 14:10 น.', location: 'ห้องน้ำชาย ชั้น 3 โซน B', category: 'สุขภัณฑ์', problem: 'ฝารองนั่งชำรุด 2 ชุด', severity: 'ปกติ', status: 'รับเรื่อง' }
];

const yearlyComparisonData = [
    {
        year: 2024,
        totalRepairs: 42,
        categories: [
            { name: 'ระบบน้ำ', count: 20 },
            { name: 'สุขภัณฑ์', count: 12 },
            { name: 'ระบบไฟฟ้า', count: 10 }
        ]
    },
    {
        year: 2025,
        totalRepairs: 68,
        categories: [
            { name: 'ระบบน้ำ', count: 35 },
            { name: 'สุขภัณฑ์', count: 18 },
            { name: 'ระบบไฟฟ้า', count: 15 }
        ]
    },
    {
        year: 2026,
        totalRepairs: 29,
        categories: [
            { name: 'ระบบน้ำ', count: 14 },
            { name: 'สุขภัณฑ์', count: 8 },
            { name: 'ระบบไฟฟ้า', count: 7 }
        ]
    }
];

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

// ปรับแต่งสถานะให้มี 3 สถานะ: รอรับเรื่อง (สีเหลือง), รับเรื่อง/แจ้งแล้ว (สีเขียว), ไม่รับเรื่อง (สีแดง)
const renderStatusBadge = (status) => {
    if (status === 'รับเรื่อง' || status === 'แจ้งแล้ว') {
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
    const [complaints, setComplaints] = useState(initialComplaints);
    const [selectedIds, setSelectedIds] = useState([]);

    // State จัดการตารางที่กำลังเลือกโหมดลบ ('latest' หรือ 'all') เพื่อให้แยกกันแสดงผล UI
    const [deleteModeTable, setDeleteModeTable] = useState(null);

    // State จัดการ Dropdown ยุบ/คลี่ตาราง
    const [isLatestOpen, setIsLatestOpen] = useState(false);
    const [isAllOpen, setIsAllOpen] = useState(false);

    const [expandedGroupIds, setExpandedGroupIds] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [toastMessage, setToastMessage] = useState('');
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [exportOption, setExportOption] = useState('complaints');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [activeComplaint, setActiveComplaint] = useState(null);
    const [remarkNote, setRemarkNote] = useState('');
    const [viewImageModal, setViewImageModal] = useState(false);
    const [categoryModalData, setCategoryModalData] = useState(null);
    const [selectedHistoryYear, setSelectedHistoryYear] = useState(null);

    // State สำหรับการเลือกจำนวนปีย้อนหลัง (ไม่รวมปีปัจจุบัน)
    const [yearsBack, setYearsBack] = useState(3);

    const [autoRejectModalOpen, setAutoRejectModalOpen] = useState(false);
    const [autoRejectNote, setAutoRejectNote] = useState('');
    const [pendingAcceptComplaint, setPendingAcceptComplaint] = useState(null);

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

    // สร้างข้อมูลการเปรียบเทียบย้อนหลังแบบ Dynamic ตามจำนวนปีที่เลือก (ไม่รวมปีปัจจุบัน)
    const displayedYearlyData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        const count = Math.max(1, yearsBack);
        const startYear = currentYear - count;
        const endYear = currentYear - 1;

        for (let y = startYear; y <= endYear; y++) {
            const found = yearlyComparisonData.find(d => d.year === y);
            if (found) {
                years.push(found);
            } else {
                const yearComplaints = historicalComplaints.filter(item => item.year === y);
                const waterCount = yearComplaints.filter(c => c.category === 'ระบบน้ำ').length;
                const sanitaryCount = yearComplaints.filter(c => c.category === 'สุขภัณฑ์').length;
                const electricCount = yearComplaints.filter(c => c.category === 'ระบบไฟฟ้า').length;

                years.push({
                    year: y,
                    totalRepairs: yearComplaints.length,
                    categories: [
                        { name: 'ระบบน้ำ', count: waterCount },
                        { name: 'สุขภัณฑ์', count: sanitaryCount },
                        { name: 'ระบบไฟฟ้า', count: electricCount }
                    ]
                });
            }
        }
        return years;
    }, [yearsBack]);

    const historicalAnalysis = useMemo(() => {
        if (!displayedYearlyData.length) {
            return {
                maxYear: '-',
                maxYearCount: 0,
                maxSystemYear: '-',
                maxSystemName: '',
                maxSystemCount: 0
            };
        }

        let maxYearObj = displayedYearlyData[0];
        let maxSystemYear = displayedYearlyData[0].year;
        let maxSystemName = '';
        let maxSystemCount = 0;

        displayedYearlyData.forEach(y => {
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

        const currentYear = new Date().getFullYear();

        return {
            maxYear: maxYearObj.year,
            maxYearCount: maxYearObj.totalRepairs,
            maxSystemYear: maxSystemCount > 0 ? maxSystemYear : `${currentYear} (ไม่มีข้อมูล)`,
            maxSystemName: maxSystemCount > 0 ? maxSystemName : '',
            maxSystemCount
        };
    }, [displayedYearlyData]);

    // แก้ไข Logic การสร้าง subItems: ไม่นำรายการแรก (i = 0) มาแสดงใน subItems ให้แสดงเฉพาะ i = 1 เป็นต้นไป
    const groupedComplaintsByRepeat = useMemo(() => {
        const sorted = [...filteredComplaints].sort((a, b) => b.repeatCount - a.repeatCount);

        return sorted.map((item) => {
            const prefixMatch = item.code.match(/^(#[A-Za-z0-9]+)-/);
            const prefix = prefixMatch ? prefixMatch[1] : '#AW1';

            const primaryNumber = parseInt(item.code.split('-')[1] || '1', 10);
            const subItems = [];

            // เริ่มวนลูป i = 1 เพื่อไม่ให้แสดงรายการแรกซ้ำอีกรอบ
            for (let i = 1; i < item.repeatCount; i++) {
                const codeNumber = String(primaryNumber + i).padStart(2, '0');
                const derivedStatus = (item.status === 'รับเรื่อง' || item.status === 'แจ้งแล้ว') ? 'ไม่รับเรื่อง' : item.status;

                subItems.push({
                    ...item,
                    uniqueId: `${item.id}-repeat-${i + 1}`,
                    code: `${prefix}-${codeNumber}`,
                    repeatIndex: i + 1,
                    status: derivedStatus,
                    note: (item.status === 'รับเรื่อง' || item.status === 'แจ้งแล้ว')
                        ? (item.repeatRejectNote || 'ข้อมูลซ้ำซ้อนกับรายการหลักที่รับเรื่องแล้ว')
                        : item.note
                });
            }

            return {
                ...item,
                primaryCode: item.code,
                subItems: subItems
            };
        });
    }, [filteredComplaints]);

    const toggleGroupExpand = (groupId) => {
        setExpandedGroupIds(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    const filteredCategorySummary = useMemo(() => {
        return categorySummary.map(cat => ({
            ...cat,
            items: cat.items.map(item => {
                const cleanItemName = item.name.replace(/\s\d+\s(ชุด|จุด|หลอด|ดวง)/, '').trim();
                const matchCount = filteredComplaints.filter(c => c.category === cat.title && c.problem.includes(cleanItemName)).length;
                return {
                    ...item,
                    count: (startDate || endDate) ? matchCount : item.count
                };
            })
        }));
    }, [filteredComplaints, startDate, endDate]);

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
            filteredCategorySummary.forEach(cat => {
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

    const handleAcceptMain = () => {
        if (!activeComplaint) return;

        if (activeComplaint.repeatCount > 1) {
            setPendingAcceptComplaint(activeComplaint);
            setAutoRejectNote(`ข้อมูลซ้ำซ้อนกับรายการที่ 1 (${activeComplaint.code}) ที่รับเรื่องแล้ว`);
            setAutoRejectModalOpen(true);
        } else {
            setComplaints((prev) =>
                prev.map((item) =>
                    item.id === activeComplaint.id
                        ? { ...item, status: 'รับเรื่อง', note: '' }
                        : item
                )
            );
            showToast('รับเรื่องเรียบร้อยแล้ว');
            setActiveComplaint(null);
            setRemarkNote('');
        }
    };

    const confirmAcceptWithAutoReject = () => {
        if (!pendingAcceptComplaint) return;

        setComplaints((prev) =>
            prev.map((item) => {
                if (item.id === pendingAcceptComplaint.id) {
                    return {
                        ...item,
                        status: 'รับเรื่อง',
                        repeatRejectNote: autoRejectNote || 'ข้อมูลซ้ำซ้อนกับรายการแรกที่รับเรื่องแล้ว'
                    };
                }
                return item;
            })
        );

        showToast(`รับเรื่องรายการที่ 1 เรียบร้อย รายการที่เหลือถูกปรับเป็นไม่รับเรื่องอัตโนมัติ`);
        setAutoRejectModalOpen(false);
        setActiveComplaint(null);
        setPendingAcceptComplaint(null);
        setRemarkNote('');
        setAutoRejectNote('');
    };

    const handleRejectMain = () => {
        if (!activeComplaint) return;

        const noteToSave = remarkNote.trim() || 'ไม่รับเรื่อง (ข้อมูลซ้ำซ้อน/รายละเอียดไม่ชัดเจน)';

        setComplaints((prev) =>
            prev.map((item) => {
                if (item.id === activeComplaint.id) {
                    return {
                        ...item,
                        status: 'ไม่รับเรื่อง',
                        note: noteToSave,
                        repeatRejectNote: noteToSave
                    };
                }
                return item;
            })
        );

        showToast('บันทึกการไม่รับเรื่องเรียบร้อยแล้ว');
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
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-1 hover:opacity-80 transition-opacity relative flex items-center justify-center"
                            title="การแจ้งเตือน"
                        >
                            <Bell className="w-6 h-6 fill-amber-400 text-amber-400" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-11 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-purple-100 z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-sm text-gray-900">การแจ้งเตือน</h4>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => setUnreadCount(0)}
                                            className="text-xs text-[#7E22CE] hover:underline font-bold"
                                        >
                                            อ่านทั้งหมด
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className="p-3 rounded-xl bg-[#FBF8FF] hover:bg-purple-50/70 border border-purple-100/70 text-xs transition-colors"
                                        >
                                            <div className="flex justify-between font-bold mb-1">
                                                <span className="text-gray-900 font-bold">{n.title}</span>
                                                <span className="text-[10px] text-gray-400 font-normal">{n.time}</span>
                                            </div>
                                            <p className="text-gray-600 leading-tight">{n.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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

                                                    {/* แสดงผลเฉพาะรายการซ้ำตั้งแต่ลำดับที่ 2 เป็นต้นไป (#AW1-02, #AW1-03, ...) */}
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
                                {filteredCategorySummary.map((cat, idx) => {
                                    const CatIcon = cat.icon;
                                    const fullSummaryText = cat.items.map(i => i.name).join(' , ');

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

                    {/* ส่วนที่ 4: AI Insight ประจำเดือน */}
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

                        <div className="max-h-72 overflow-y-auto pr-1 space-y-3 text-xs text-gray-600 leading-relaxed scrollbar-thin scrollbar-thumb-purple-200">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5 text-xs">
                                    <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" />
                                    สรุปภาพรวมปัญหาประจำเดือน
                                </h4>
                                <p className="text-gray-600">
                                    ห้องน้ำชาย ชั้น 2 โซน A มีเรื่องแจ้งซ่อมบ่อยที่สุดในเดือนนี้ (รวม 9 ครั้ง) โดยปัญหาหลัก 60% เกิดจากอุปกรณ์สุขภัณฑ์ชำรุด (สายฉีดชำระและวาล์วชักโครก) รองลงมาเป็นปัญหาระบบไฟฟ้าหลอดไฟกระพริบในโซนชั้น 1
                                </p>
                            </div>

                            <div className="p-3 bg-[#FDF4FF] rounded-xl border border-purple-100">
                                <h4 className="font-bold text-[#4C1D95] mb-1 flex items-center gap-1.5 text-xs">
                                    <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                                    ข้อเสนอแนะในการปรับปรุง
                                </h4>
                                <ul className="list-disc pl-4 space-y-1 text-gray-700">
                                    <li>เพิ่มรอบการตรวจเช็คสภาพอุปกรณ์สุขภัณฑ์ชั้น 2 เป็นสัปดาห์ละ 2 ครั้ง</li>
                                    <li>จัดซื้อสำรองอะไหล่ประเภทชุดสายฉีดชำระและหลอดไฟ LED ล่วงหน้า 15%</li>
                                    <li>ดำเนินการเปลี่ยนหลอดไฟยกเซ็ตในโซนที่มีการแจ้งไฟกระพริบซ้ำเกิน 3 ครั้ง</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---------------- ส่วนที่ 5: สรุปและเปรียบเทียบรายการแจ้งซ่อมย้อนหลังตาม Design ---------------- */}
                <div className="bg-white border border-purple-200 rounded-2xl p-4 md:p-6 shadow-sm mb-6 font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-purple-100">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-purple-100 text-[#6B21A8] rounded-xl">
                                <History className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    สรุปรายการความเสียหายและการเปรียบเทียบย้อนหลัง ({displayedYearlyData[0]?.year || ''} - {displayedYearlyData[displayedYearlyData.length - 1]?.year || ''})
                                </h3>
                                <p className="text-xs text-gray-500">
                                    การวิเคราะห์เชิงสถิติความถี่การแจ้งซ่อม
                                </p>
                            </div>
                        </div>

                        {/* ช่องเลือกจำนวนปีย้อนหลังตามภาพ Design */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-600">ย้อนหลัง</span>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={yearsBack}
                                onChange={(e) => setYearsBack(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-14 text-center border border-purple-300 rounded-lg py-1 text-xs font-bold text-[#6B21A8] focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50/50"
                            />
                            <span className="text-xs font-semibold text-gray-600">ปี (ไม่รวมปีปัจจุบัน)</span>
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
                                <span className="text-2xl font-black text-amber-300">
                                    ปี {historicalAnalysis.maxSystemYear} {historicalAnalysis.maxSystemName ? `(${historicalAnalysis.maxSystemName})` : ''}
                                </span>
                                <span className="text-xs text-purple-200">จำนวน {historicalAnalysis.maxSystemCount} ครั้ง</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedYearlyData.map((data) => {
                            const isHighestYear = data.year === historicalAnalysis.maxYear && data.totalRepairs > 0;
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
                                    {historicalComplaints
                                        .filter(item => item.year === selectedHistoryYear && (item.status === 'รับเรื่อง' || item.status === 'แจ้งแล้ว'))
                                        .map(item => (
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
                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer'
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
                    <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-4 relative shadow-2xl">
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