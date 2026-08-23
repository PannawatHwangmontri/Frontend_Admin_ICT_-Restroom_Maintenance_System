This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


---------------------------------------------------------------------------------------------------

🧩 src/components/

เป็นโฟลเดอร์สำหรับเก็บ Reusable Components

Component คือส่วน UI ที่สามารถสร้างครั้งเดียวและนำกลับมาใช้ซ้ำในหลายหน้าได้

ตัวอย่างเช่น

Button
Input
Modal
Navbar
Sidebar
Card
Table
Status Badge

การแยก Component ออกมาเป็นส่วนกลางช่วยลดการเขียนโค้ดซ้ำ และทำให้แก้ไข UI ได้ง่ายขึ้น

📂 src/components/ui/

เป็นส่วนสำหรับเก็บ UI Components พื้นฐานของระบบ

เช่น

Button
Input
Select
Dialog
Card
Badge
Table

Component เหล่านี้สามารถนำไปใช้ได้ทั้งในหน้า LIFF และ Dashboard เพื่อให้หน้าตาของระบบมีรูปแบบที่สม่ำเสมอ

🔌 src/services/

เป็นโฟลเดอร์สำหรับจัดการ Service ที่ใช้ติดต่อกับ Backend หรือ API

แยกส่วนการเรียก API ออกจาก UI เพื่อให้โค้ดเป็นระเบียบและง่ายต่อการดูแล

📄 src/services/api.ts

เป็นไฟล์สำหรับจัดการการเชื่อมต่อกับ Backend API

ตัวอย่างเช่น

GET     /complaints
POST    /complaints
GET     /complaints/:id
PATCH   /complaints/:id
GET     /analytics

Frontend จะเรียกใช้ฟังก์ชันจากไฟล์นี้เมื่อต้องการส่งหรือรับข้อมูลจาก Backend

การแยก API ออกมาเป็น Service ช่วยให้ไม่ต้องเขียนโค้ดสำหรับเรียก API ซ้ำในแต่ละหน้า

🏷️ src/types/

เป็นโฟลเดอร์สำหรับเก็บ Type Definitions ของ TypeScript

ใช้กำหนดรูปแบบข้อมูลที่ระบบจะใช้งาน เพื่อช่วยลดข้อผิดพลาดในการเขียนโปรแกรม





