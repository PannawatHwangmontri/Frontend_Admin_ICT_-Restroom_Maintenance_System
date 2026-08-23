"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { MobileMenuProvider } from "@/components/MobileMenuContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <MobileMenuProvider openMobileMenu={() => setIsMobileOpen(true)}>
      <div className="flex min-h-screen">
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </MobileMenuProvider>
  );
}