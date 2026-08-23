'use client';

import React, { useState, useMemo } from 'react';
import { useOpenMobileMenu } from '@/components/MobileMenuContext';
import {
    LayoutDashboard,
    Wrench,
    Clock,
    Users,
    LogOut,
    Menu,
    User,
    Trash2,
    Eye,
    ChevronDown,
    ChevronUp,
    CheckSquare,
    Square,
    X,
    CheckCircle2
} from 'lucide-react';

// รายการเมนูสำหรับ Sidebar
const menuItems = [
    { title: 'แดชบอร์ด', icon: LayoutDashboard, active: false },
    { title: 'รายงานความคืบหน้า', icon: Clock, active: true },
    { title: 'การจัดการซ่อม', icon: Wrench, active: false },
    { title: 'ผู้ใช้งาน', icon: Users, active: false },
];

// โครงสร้างข้อมูล ชั้น และ โซน ทั้ง 4 ชั้น ตามภาพตัวอย่าง
const floorData = [
    {
        id: 'floor1',
        name: 'ชั้น 1',
        zones: [
            'ห้องน้ำหญิง โซน A',
            'ห้องน้ำหญิง โซน B',
            'ห้องน้ำชาย โซน A',
            'ห้องน้ำชาย โซน B'
        ]
    },
    {
        id: 'floor2',
        name: 'ชั้น 2',
        zones: [
            'ห้องน้ำหญิง โซน A',
            'ห้องน้ำหญิง โซน B',
            'ห้องน้ำหญิง โซน D',
            'ห้องน้ำหญิง / โซนงานบริการเครือข่าย (ใกล้หอประชุมเมืองพะเยา)',
            'ห้องน้ำชาย โซน A',
            'ห้องน้ำชาย โซน B',
            'ห้องน้ำชาย โซน D',
            'ห้องน้ำชาย / โซนงานบริการเครือข่าย (ใกล้หอประชุมเมืองพะเยา)'
        ]
    },
    {
        id: 'floor3',
        name: 'ชั้น 3',
        zones: [
            'ห้องน้ำหญิง โซน A',
            'ห้องน้ำหญิง โซน B',
            'ห้องน้ำหญิง โซน C โซนห้องปฏิบัติการระบบอัจฉริยะและหุ่นยนต์อัตโนมัติ',
            'ห้องน้ำหญิง โซน D',
            'ห้องน้ำชาย โซน A',
            'ห้องน้ำชาย โซน B',
            'ห้องน้ำชาย โซน C โซนห้องปฏิบัติการระบบอัจฉริยะและหุ่นยนต์อัตโนมัติ',
            'ห้องน้ำชาย โซน D'
        ]
    },
    {
        id: 'floor4',
        name: 'ชั้น 4',
        zones: [
            'ห้องน้ำหญิง โซน A',
            'ห้องน้ำหญิง โซน B',
            'ห้องน้ำชาย โซน A',
            'ห้องน้ำชาย โซน B'
        ]
    }
];

// ข้อมูลจำลองสำหรับรายงานความคืบหน้า
const initialReportList = [
    {
        id: '1',
        code: '#AW1-01',
        date: '20/07/2026',
        floor: 'ชั้น 1',
        location: 'ห้องน้ำหญิง ชั้น 1 โซน A',
        category: 'หมวดหมู่ ระบบน้ำ',
        problem: 'สายฉีดชำระเสีย ห้อง 2',
        severity: 'ปกติ',
        status: 'แจ้งแล้ว'
    },
    {
        id: '2',
        code: '#AW1-02',
        date: '20/07/2026',
        floor: 'ชั้น 1',
        location: 'ห้องน้ำหญิง ชั้น 1 โซน A',
        category: 'หมวดหมู่ ระบบน้ำ',
        problem: 'สายฉีดชำระเสีย ห้อง 2',
        severity: 'ปกติ',
        status: 'แจ้งแล้ว'
    },
    {
        id: '3',
        code: '#AM1-03',
        date: '20/07/2026',
        floor: 'ชั้น 1',
        location: 'ห้องน้ำชาย ชั้น 1 โซน A',
        category: 'หมวดหมู่ ระบบน้ำ',
        problem: 'ท่อน้ำรั่ว',
        severity: 'เร่งด่วน',
        status: 'แจ้งแล้ว'
    },
    {
        id: '4',
        code: '#AW2-01',
        date: '21/07/2026',
        floor: 'ชั้น 2',
        location: 'ห้องน้ำหญิง ชั้น 2 โซน D',
        category: 'หมวดหมู่ ระบบไฟฟ้า',
        problem: 'หลอดไฟเสีย 2 หลอด',
        severity: 'ปกติ',
        status: 'ไม่รับเรื่อง'
    },
];

// ข้อมูลจำลองสำหรับการแจ้งเตือน
const initialNotifications = [
    {
        id: 1,
        title: 'มีการแจ้งซ่อมใหม่',
        time: '5 นาทีที่แล้ว',
        detail: 'สายฉีดชำระชำรุด ห้องน้ำชาย ชั้น 2'
    },
    {
        id: 2,
        title: 'อัปเดตสถานะงาน',
        time: '20 นาทีที่แล้ว',
        detail: 'ช่างรับเรื่องแล้ว: ก๊อกน้ำอ่างล้างมือ ชั้น 1'
    },
    {
        id: 3,
        title: 'ตรวจพบเรื่องแจ้งซ้ำ',
        time: '1 ชั่วโมงที่แล้ว',
        detail: 'โถส้วมชำรุด ห้องน้ำหญิง ชั้น 1 (4 ครั้ง)'
    }
];

export default function ProgressReportPage() {
    const openMobileMenu = useOpenMobileMenu();

    // State จัดการการแจ้งเตือน Dropdown
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState(initialNotifications);

    // State จัดการข้อมูลแจ้งซ่อมจาก DB
    const [reportList, setReportList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // State สำหรับการอัปเดตสถานะ
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // State จัดการ Dropdown เลือกชั้นและโซน
    const [isFloorDropdownOpen, setIsFloorDropdownOpen] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState('ทั้งหมด');
    const [selectedZone, setSelectedZone] = useState('');
    const [expandedFloorId, setExpandedFloorId] = useState<string | null>(null);

    // State สำหรับเปิดดู Modal รายละเอียด
    const [activeDetail, setActiveDetail] = useState<any>(null);

    // แสดงการแจ้งเตือน Toast
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // ดึงข้อมูลจริงจาก Backend API
    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/requests');
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                const mapped = result.data.map((item: any) => {
                    const d = item.reported_at ? new Date(item.reported_at) : new Date();
                    const dateStr = d.toLocaleDateString('th-TH');

                    let cat = 'หมวดหมู่ ระบบน้ำ';
                    const summary = item.issue_summary || '';
                    if (summary.includes('ไฟ') || summary.includes('หลอดไฟ') || summary.includes('ปลั๊ก')) {
                        cat = 'หมวดหมู่ ระบบไฟฟ้า';
                    } else if (summary.includes('ส้วม') || summary.includes('โถ') || summary.includes('อ่าง') || summary.includes('กระจก') || summary.includes('ประตู')) {
                        cat = 'หมวดหมู่ สุขภัณฑ์';
                    }

                    // สกัดชั้นจากสถานที่ เช่น "ชั้น 1", "ชั้น 2"
                    let floorName = 'ชั้น 1';
                    const loc = item.location || '';
                    if (loc.includes('ชั้น 2')) floorName = 'ชั้น 2';
                    else if (loc.includes('ชั้น 3')) floorName = 'ชั้น 3';
                    else if (loc.includes('ชั้น 4')) floorName = 'ชั้น 4';

                    return {
                        id: String(item.id),
                        code: item.ticket_number || `#REQ-${item.id}`,
                        date: dateStr,
                        rawDate: d,
                        floor: floorName,
                        location: loc || 'ไม่ระบุสถานที่',
                        category: cat,
                        problem: item.issue_summary || 'ไม่มีรายละเอียด',
                        severity: item.priority === 'HIGH' || item.priority === 'URGENT' ? 'เร่งด่วน' : 'ปกติ',
                        status: item.status || 'รอรับเรื่อง',
                        remark: item.remark || '',
                        imageUrl: item.image_url || null,
                    };
                });
                setReportList(mapped);
            }
        } catch (error) {
            console.error('Failed to fetch requests in progress_report:', error);
            showToast('เกิดข้อผิดพลาดในการดึงข้อมูล');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchRequests();
    }, []);

    // คำนวณ Metric Cards สรุปประจำเดือนจาก DB
    const metrics = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const currentMonthReqs = reportList.filter(r => {
            const d = r.rawDate || new Date();
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });

        const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const prevMonthReqs = reportList.filter(r => {
            const d = r.rawDate || new Date();
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

        const acceptedCount = currentMonthReqs.filter(r => r.status === 'แจ้งแล้ว' || r.status === 'กำลังดำเนินการ' || r.status === 'เสร็จสิ้น').length;
        const rejectedCount = currentMonthReqs.filter(r => r.status === 'ไม่รับเรื่อง' || r.status === 'ยกเลิก').length;

        return {
            totalThisMonth: reportList.length > 0 ? totalThisMonth : 0,
            diffPercent,
            acceptedCount: reportList.length > 0 ? acceptedCount : 0,
            rejectedCount: reportList.length > 0 ? rejectedCount : 0,
        };
    }, [reportList]);

    // ฟังก์ชันอัปเดตสถานะไปยัง Backend & Supabase DB
    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            setUpdatingId(id);
            const targetItem = reportList.find(r => r.id === id);
            const remarkText = targetItem?.remark || `อัปเดตสถานะเป็น ${newStatus}`;

            const res = await fetch(`/api/requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    remark: remarkText
                })
            });

            const result = await res.json();
            if (result.success) {
                setReportList(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
                if (activeDetail && activeDetail.id === id) {
                    setActiveDetail((prev: any) => ({ ...prev, status: newStatus }));
                }
                showToast(`อัปเดตสถานะเป็น "${newStatus}" เรียบร้อยแล้ว`);
            } else {
                showToast(`เกิดข้อผิดพลาด: ${result.message || 'ไม่สามารถอัปเดตได้'}`);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        } finally {
            setUpdatingId(null);
        }
    };

    // ล้างรายการแจ้งเตือนทั้งหมด
    const handleMarkAllAsRead = () => {
        setNotifications([]);
    };

    // ---------------- [ส่วนคัดกรองข้อมูล] ----------------
    const filteredReports = useMemo(() => {
        return reportList.filter((item) => {
            if (selectedFloor === 'ทั้งหมด') return true;
            if (item.floor !== selectedFloor) return false;

            if (selectedZone) {
                const zoneParts = selectedZone.split(' ');
                const type = zoneParts[0];
                const zoneName = zoneParts[zoneParts.length - 1];

                const hasType = item.location.includes(type);
                const hasZone = item.location.includes(`โซน ${zoneName}`) || item.location.includes(zoneName);

                if (!hasType || !hasZone) return false;
            }

            return true;
        });
    }, [reportList, selectedFloor, selectedZone]);

    // เลือก/ยกเลิก ทั้งหมดในการลบ
    const handleSelectAll = () => {
        if (selectedIds.length === filteredReports.length && filteredReports.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredReports.map((item) => item.id));
        }
    };

    // เลือกแต่ละรายการ
    const handleSelectRow = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // ยืนยันการลบรายการ
    const confirmDelete = () => {
        setReportList((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        setDeleteModalOpen(false);
        setIsDeleteMode(false);
        showToast('ลบรายการที่เลือกเรียบร้อยแล้ว');
    };

    return (
        <div className="flex min-h-screen bg-[#F6F0FE] font-sans text-gray-800 relative overflow-x-hidden">
            {/* Notification Toast */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-[100] bg-[#6B21A8] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-purple-400 animate-in fade-in slide-in-from-top-3 duration-200">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                    <span className="text-sm font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* ---------------- Main Content ---------------- */}
            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full min-w-0">
                {/* Top Header */}
                <header className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={openMobileMenu}
                            className="md:hidden p-2 rounded-lg hover:bg-purple-200/60 text-[#4C1D95]"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#4C1D95] truncate">
                            รายงานความคืบหน้า
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-gray-900 hidden sm:inline">Admin</span>
                        <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-black shadow-xs shrink-0">
                            <User className="w-5 h-5 fill-black text-black" />
                        </div>
                    </div>
                </header>

                {/* ---------------- Summary Metric Cards (3 Cards) ---------------- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border-2 border-[#7C3AED] rounded-2xl p-5 shadow-xs">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                            เรื่องแจ้งทั้งหมด (เดือนนี้)
                        </p>
                        <div className="text-4xl font-semibold text-[#5607cc] mb-2">{metrics.totalThisMonth}</div>
                        <p className="text-xs text-purple-700 font-semibold flex items-center gap-1">
                            <span>{metrics.diffPercent >= 0 ? `↗ ${metrics.diffPercent}%` : `↘ ${Math.abs(metrics.diffPercent)}%`}</span>
                            <span className="text-gray-400 font-normal">จากเดือนก่อน</span>
                        </p>
                    </div>

                    <div className="bg-white border-2 border-[#7C3AED] rounded-2xl p-5 shadow-xs">
                        <p className="text-xs font-medium text-gray-500 mb-1">แจ้งแล้ว / กำลังดำเนินการ</p>
                        <div className="text-4xl font-semibold text-[#108653] mb-2">{metrics.acceptedCount}</div>
                        <p className="text-xs text-gray-400">มีเจ้าหน้าที่รับผิดชอบ</p>
                    </div>

                    <div className="bg-white border-2 border-[#7C3AED] rounded-2xl p-5 shadow-xs sm:col-span-2 lg:col-span-1">
                        <p className="text-xs font-medium text-gray-500 mb-1">ไม่รับเรื่อง / ยกเลิก</p>
                        <div className="text-4xl font-semibold text-[#e83455] mb-2">{metrics.rejectedCount}</div>
                        <p className="text-xs text-gray-400 font-medium">รายละเอียดข้อมูลซ้ำกัน/ยกเลิก</p>
                    </div>
                </div>

                {/* ---------------- Floor Dropdown Filter (4 Floors) ---------------- */}
                <div className="flex justify-end mb-4 relative z-20">
                    <div className="relative w-full sm:w-64">
                        <button
                            onClick={() => setIsFloorDropdownOpen(!isFloorDropdownOpen)}
                            className="w-full bg-[#6B21A8] hover:bg-purple-900 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-between text-sm shadow-xs transition-colors cursor-pointer"
                        >
                            <span className="truncate">
                                {selectedFloor === 'ทั้งหมด'
                                    ? 'ชั้น (เลือกทั้งหมด)'
                                    : selectedZone
                                        ? `${selectedFloor} - ${selectedZone}`
                                        : selectedFloor}
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${isFloorDropdownOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {/* Menu Dropdown โครงสร้าง 4 ชั้น และ โซน */}
                        {isFloorDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setIsFloorDropdownOpen(false)}
                                />
                                <div className="absolute right-0 top-12 w-full sm:w-80 bg-white border border-purple-200 rounded-2xl shadow-xl p-2 z-30 max-h-80 overflow-y-auto">
                                    <button
                                        onClick={() => {
                                            setSelectedFloor('ทั้งหมด');
                                            setSelectedZone('');
                                            setIsFloorDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs font-bold text-purple-900 hover:bg-purple-50 rounded-lg mb-1 cursor-pointer"
                                    >
                                        -- แสดงข้อมูลทั้งหมดทุกชั้น --
                                    </button>

                                    {floorData.map((floor) => {
                                        const isExpanded = expandedFloorId === floor.id;
                                        return (
                                            <div key={floor.id} className="border-b border-gray-100 last:border-0">
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpandedFloorId(isExpanded ? null : floor.id);
                                                    }}
                                                    className="flex items-center justify-between p-2.5 hover:bg-purple-50 rounded-xl cursor-pointer transition-colors"
                                                >
                                                    <span className="font-bold text-xs text-gray-800">{floor.name}</span>
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4 text-purple-700" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </div>

                                                {/* โซนย่อยในแต่ละชั้น */}
                                                {isExpanded && (
                                                    <div className="pl-3 pr-1 py-1 space-y-1 bg-purple-50/40 rounded-xl my-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedFloor(floor.name);
                                                                setSelectedZone('');
                                                                setIsFloorDropdownOpen(false);
                                                            }}
                                                            className="w-full text-left p-1.5 text-xs text-[#6B21A8] font-bold hover:underline cursor-pointer"
                                                        >
                                                            เลือกทุกโซนใน {floor.name}
                                                        </button>

                                                        {floor.zones.map((zone, zIdx) => (
                                                            <button
                                                                key={zIdx}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedFloor(floor.name);
                                                                    setSelectedZone(zone);
                                                                    setIsFloorDropdownOpen(false);
                                                                }}
                                                                className="w-full text-left p-1.5 text-xs text-gray-700 hover:bg-purple-100 rounded-lg transition-colors block leading-tight cursor-pointer"
                                                            >
                                                                • {zone}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ---------------- Data Table Section ---------------- */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden mb-6">
                    {/* Table Header Action Bar */}
                    <div className="bg-[#6B21A8] text-white px-4 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-sm sm:text-base">จัดการสถานะห้องน้ำ</h3>
                            {selectedIds.length > 0 && (
                                <span className="bg-purple-800 text-purple-100 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                    เลือก {selectedIds.length} รายการ
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {isDeleteMode && (
                                <button
                                    onClick={handleSelectAll}
                                    className="flex items-center gap-1.5 text-xs bg-purple-800/80 hover:bg-purple-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                    {selectedIds.length === filteredReports.length && filteredReports.length > 0 ? (
                                        <CheckSquare className="w-4 h-4 text-purple-200" />
                                    ) : (
                                        <Square className="w-4 h-4 text-purple-200" />
                                    )}
                                    <span className="hidden sm:inline">เลือกทั้งหมด</span>
                                </button>
                            )}

                            {/* Trash Icon Button */}
                            <button
                                onClick={() => {
                                    if (!isDeleteMode) {
                                        setIsDeleteMode(true);
                                    } else {
                                        if (selectedIds.length > 0) {
                                            setDeleteModalOpen(true);
                                        } else {
                                            setIsDeleteMode(false);
                                        }
                                    }
                                }}
                                className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${isDeleteMode
                                    ? selectedIds.length > 0
                                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-xs'
                                        : 'bg-purple-700 hover:bg-purple-800 text-purple-100'
                                    : 'hover:bg-purple-800 text-purple-100'
                                    }`}
                                title={isDeleteMode ? 'ลบรายการที่เลือก' : 'เข้าสู่โหมดลบรายการ'}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead className="bg-[#E9D5FF] text-[#4C1D95] text-xs font-bold">
                                <tr>
                                    {isDeleteMode && <th className="p-3 text-center w-10">เลือก</th>}
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
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={isDeleteMode ? 8 : 7}
                                            className="text-center py-8 text-gray-400 font-medium"
                                        >
                                            ไม่พบข้อมูลรายงานในชั้นที่เลือก
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((item) => {
                                        const isSelected = selectedIds.includes(item.id);
                                        return (
                                            <tr
                                                key={item.id}
                                                className={`hover:bg-purple-50/50 transition-colors ${isSelected ? 'bg-purple-50' : ''
                                                    }`}
                                            >
                                                {isDeleteMode && (
                                                    <td className="p-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleSelectRow(item.id)}
                                                            className="rounded text-purple-600 focus:ring-purple-400 h-4 w-4 cursor-pointer"
                                                        />
                                                    </td>
                                                )}
                                                <td className="p-3 font-bold text-purple-900">{item.code}</td>
                                                <td className="p-3 whitespace-nowrap">{item.date}</td>
                                                <td className="p-3">{item.location}</td>
                                                <td className="p-3">
                                                    <div className="font-semibold">{item.category}</div>
                                                    <div className="text-gray-500">{item.problem}</div>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span
                                                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${item.severity === 'เร่งด่วน'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                    >
                                                        {item.severity}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <select
                                                        disabled={updatingId === item.id}
                                                        value={item.status}
                                                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer focus:outline-none ${item.status === 'แจ้งแล้ว'
                                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                                            : item.status === 'รอรับเรื่อง'
                                                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                                                : 'bg-red-50 text-red-800 border-red-300'
                                                            }`}
                                                    >
                                                        {item.status === 'รอรับเรื่อง' && (
                                                            <option value="รอรับเรื่อง">รอรับเรื่อง</option>
                                                        )}
                                                        <option value="แจ้งแล้ว">แจ้งแล้ว</option>
                                                        <option value="ไม่รับเรื่อง">ไม่รับเรื่อง</option>
                                                    </select>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button
                                                        onClick={() => setActiveDetail(item)}
                                                        className="p-1.5 text-gray-700 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
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
                </div>
            </main>

            {/* ---------------- Modal ยืนยันการลบ ---------------- */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-purple-100">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-bold text-gray-900 mb-2">ยืนยันการลบรายการ</h4>
                        <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                            ต้องการลบรายการที่เลือกจำนวน {selectedIds.length} รายการ หรือไม่?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={confirmDelete}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                            >
                                ลบรายการ
                            </button>
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- Modal แสดงรายละเอียด ---------------- */}
            {activeDetail && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-purple-100">
                        <button
                            onClick={() => setActiveDetail(null)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="font-bold text-lg text-purple-950 mb-4 border-b pb-2">
                            รายละเอียดการแจ้งซ่อม {activeDetail.code}
                        </h3>

                        <div className="space-y-2.5 text-xs text-gray-700 mb-6">
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="font-semibold text-gray-500">วัน/เดือน/ปี:</span>
                                <span>{activeDetail.date}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="font-semibold text-gray-500">สถานที่:</span>
                                <span>{activeDetail.location}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="font-semibold text-gray-500">หมวดหมู่:</span>
                                <span>{activeDetail.category}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="font-semibold text-gray-500">ปัญหา:</span>
                                <span>{activeDetail.problem}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="font-semibold text-gray-500">ระดับความสำคัญ:</span>
                                <span className="font-bold text-red-600">{activeDetail.severity}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <span className="font-semibold text-gray-500">สถานะ:</span>
                                <select
                                    disabled={updatingId === activeDetail.id}
                                    value={activeDetail.status}
                                    onChange={(e) => handleStatusChange(activeDetail.id, e.target.value)}
                                    className="bg-purple-50 text-[#6B21A8] font-bold text-xs px-2.5 py-1 rounded-lg border border-purple-300 focus:outline-none cursor-pointer"
                                >
                                    {activeDetail.status === 'รอรับเรื่อง' && (
                                        <option value="รอรับเรื่อง">รอรับเรื่อง</option>
                                    )}
                                    <option value="แจ้งแล้ว">แจ้งแล้ว</option>
                                    <option value="ไม่รับเรื่อง">ไม่รับเรื่อง</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => setActiveDetail(null)}
                            className="w-full bg-[#6B21A8] hover:bg-purple-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                        >
                            ปิดหน้าต่าง
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}