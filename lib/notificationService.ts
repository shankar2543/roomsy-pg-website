import Parse from "@/lib/parseConfig";

export type NotificationType =
  | "info"
  | "pg_submitted"
  | "pg_approved"
  | "pg_suspended"
  | "pg_reinstated"
  | "booking_requested"
  | "booking_confirmed"
  | "booking_rejected"
  | "booking_cancelled"
  | "stay_completed"
  | "review_submitted";

export interface ServiceNotification {
  objectId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export async function listMyNotifications(): Promise<ServiceNotification[]> {
  const rows = (await Parse.Cloud.run("listMyNotifications")) as Array<
    Omit<ServiceNotification, "createdAt"> & { createdAt: Date | string }
  >;
  return rows.map((r) => ({
    ...r,
    createdAt:
      typeof r.createdAt === "string" ? r.createdAt : new Date(r.createdAt).toISOString(),
  }));
}

export async function countUnreadNotifications(): Promise<number> {
  const res = (await Parse.Cloud.run("countUnreadNotifications")) as { count: number };
  return res.count || 0;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await Parse.Cloud.run("markNotificationRead", { notificationId });
}

export async function markAllNotificationsRead(): Promise<number> {
  const res = (await Parse.Cloud.run("markAllNotificationsRead")) as { count: number };
  return res.count || 0;
}
