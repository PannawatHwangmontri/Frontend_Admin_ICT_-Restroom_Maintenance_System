"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // 1. Import useRouter เพิ่ม
import { LayoutDashboard, Wrench, Clock, Users, LogOut, Menu } from "lucide-react";

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (isOpen: boolean) => void;
}

const subscribe = (callback: () => void) => {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};

export default function Sidebar({ isMobileOpen = false, setIsMobileOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter(); // 2. เรียกใช้งาน router

  // ป้องกัน Hydration mismatch สำหรับ window size
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard Overview", path: "/Admin/Dashboard/Overview" },
    { icon: Wrench, label: "รายการแจ้งซ่อม", path: "/Admin/Dashboard/complaints" },
    { icon: Clock, label: "รายงานความคืบหน้า", path: "/Admin/Dashboard/progress_report" },
    { icon: Users, label: "สถานะห้องน้ำ", path: "/Admin/Dashboard/restroom_status" },
  ];

  // 3. ฟังก์ชันกดออกจากระบบ — ลบ Cookie ฝั่ง Server ก่อน redirect
  const handleLogout = async () => {
    try {
      await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {
      // ถึงแม้ API ล้มเหลว ก็ยัง redirect ออก
    }
    router.push('/Admin/Login');
  };

  if (!mounted) return null;

  const showLabels = !isCollapsed || isMobileOpen;
  const isNarrow = isCollapsed && !isMobileOpen;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && setIsMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ---------------- Sidebar ---------------- */}
      <aside
        className={`bg-[#E9D5FF]/95 md:bg-[#E9D5FF]/60 backdrop-blur-md transition-all duration-300 ease-in-out flex flex-col justify-between p-4 fixed top-0 left-0 h-screen z-50 md:relative md:top-auto md:left-auto md:h-auto md:min-h-screen w-64 ${isCollapsed ? 'md:w-20' : ''} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8 px-1">
            {showLabels && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm bg-purple-100 flex items-center justify-center">
                  <img
                    src="/icon/logo.png"
                    alt="ICT Restroom Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('bg-[#6B21A8]');
                    }}
                  />
                </div>
                <div className="truncate">
                  <h1 className="font-bold text-sm text-[#4C1D95] leading-tight truncate">
                    ICT Restroom
                  </h1>
                  <p className="text-xs font-semibold text-[#6B21A8]">Admin</p>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setIsCollapsed(!isCollapsed);
                setIsMobileOpen?.(false);
              }}
              className={`p-2 rounded-lg hover:bg-purple-200/60 text-[#4C1D95] transition-colors ${isNarrow ? 'mx-auto' : ''}`}
              title={isCollapsed ? 'ขยายเมนู' : 'หดเมนู'}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  key={index}
                  href={item.path}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive
                    ? 'bg-[#D8B4FE] text-[#4C1D95] shadow-sm font-semibold'
                    : 'text-gray-700 hover:bg-purple-200/40 font-medium'
                    } ${isNarrow ? 'justify-center' : ''}`}
                >
                  <Icon className="w-5 h-5 shrink-0 text-[#6B21A8]" />
                  {showLabels && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button (4. ผูก onClick เข้ากับ handleLogout) */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors ${isNarrow ? 'justify-center' : ''
            }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {showLabels && <span>ออกจากระบบ</span>}
        </button>
      </aside>
    </>
  );
}