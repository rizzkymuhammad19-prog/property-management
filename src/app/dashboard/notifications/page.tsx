import { getServerSession } from "next-auth";
import { Check, CheckCheck, Trash2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionButton } from "@/components/action-button";
import { ErrorPanel } from "@/components/ui/error-panel";
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/actions/notifications";
import { cn } from "@/lib/utils";

function timeAgo(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export default async function NotificationsPage() {
  try {
  const session = await getServerSession(authOptions);

  const notifications = await prisma.notification.findMany({
    where: { userId: session?.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Notifikasi</h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua notifikasi sudah dibaca"}
          </p>
        </div>
        {unreadCount > 0 && (
          <ActionButton
            action={markAllNotificationsRead}
            icon={CheckCheck}
            label="Tandai Semua Dibaca"
            variant="ghost"
            className="border border-surface-border bg-white"
          />
        )}
      </div>

      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "flex items-start justify-between gap-3 px-4 py-3.5",
              !n.isRead && "bg-brand-50/40"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 flex-shrink-0 rounded-full",
                  n.isRead ? "bg-gray-200" : "bg-brand-500"
                )}
              />
              <div>
                <p className={cn("text-sm", n.isRead ? "text-gray-600" : "font-semibold text-gray-900")}>
                  {n.title}
                </p>
                {n.body && <p className="mt-0.5 text-xs text-gray-500">{n.body}</p>}
                <p className="mt-1 text-[11px] text-gray-400">{timeAgo(n.createdAt)}</p>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              {!n.isRead && (
                <ActionButton action={markNotificationRead.bind(null, n.id)} icon={Check} variant="ghost" />
              )}
              <ActionButton
                action={deleteNotification.bind(null, n.id)}
                confirmMessage="Hapus notifikasi ini?"
                icon={Trash2}
                variant="danger"
              />
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-gray-400">Belum ada notifikasi.</div>
        )}
      </div>
    </div>
  );
  } catch (error) {
    return <ErrorPanel error={error} label="Notifikasi" />;
  }
}
