export interface RepairTrendData {
    day: number;
    total: number;
}

export interface RecentRepair {
    id: string;
    item: string;
    location: string;
    date: string;
    status: "รับเรื่อง" | "เเจ้งเเล้ว";
}