import { useState } from "react";
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, CheckCircle, AlertOctagon } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNotifications } from "../../hooks/useNotifications";
import { Notification, NotificationType } from "../../types";
import { formatDistanceToNow } from "date-fns";

const typeConfig: Record<NotificationType, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "text-[#5B4FE8]", bg: "bg-[#EDE9FE]" },
  success: { icon: CheckCircle, color: "text-[#059669]", bg: "bg-emerald-50" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10" },
  alert: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10" },
  emergency: { icon: AlertOctagon, color: "text-red-400", bg: "bg-red-400/10" },
};

function NotifItem({ notif, onRead, onDelete }: {
  notif: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cfg = typeConfig[notif.type] ?? typeConfig.info;
  const Icon = cfg.icon;
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${notif.read ? 'opacity-60' : 'bg-white/3'} hover:bg-[#F8F9FF]`}
      onClick={() => !notif.read && onRead(notif.id)}
    >
      <div className={`shrink-0 rounded-full p-1.5 ${cfg.bg}`}>
        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notif.read ? 'text-[#6B7280]' : 'text-[#0D0D0D]'} leading-tight`}>{notif.title}</p>
        <p className="text-xs text-[#9CA3AF] mt-0.5 line-clamp-2">{notif.message}</p>
        <p className="text-xs text-[#9CA3AF] mt-1">
          {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
        </p>
      </div>
      {!notif.read && <div className="shrink-0 w-2 h-2 rounded-full bg-[#0ea5e9] mt-1.5" />}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
        className="shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-400 text-[#9CA3AF] transition-all p-1"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((p) => !p)}
        className="relative text-[#6B7280] hover:text-[#0D0D0D]"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-[#0D0D0D] text-[10px] flex items-center justify-center px-1 font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-xl bg-white border border-[#E5E7EB] shadow-2xl shadow-black/50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#5B4FE8]" />
                <span className="text-sm text-[#0D0D0D]">Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-1.5 py-0.5">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-[#5B4FE8] hover:text-[#5B4FE8]/80 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2 text-[#9CA3AF]">
                  <Bell className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {notifications.map((n) => (
                    <NotifItem
                      key={n.id}
                      notif={n}
                      onRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
