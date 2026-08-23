import type { Metadata } from "next";
import { Prompt, Inter } from "next/font/google";
import "./globals.css";

// 1. ตั้งค่าฟอนต์ Prompt (สำหรับภาษาไทย)
const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

// 2. ตั้งค่าฟอนต์ Inter (สำหรับภาษาอังกฤษ)
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ICT Restroom System",
  description: "ระบบจัดการห้องน้ำ ICT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className={`${prompt.variable} ${inter.variable} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}