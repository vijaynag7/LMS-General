import * as React from "react";
import { Bell } from "lucide-react";
import { useMyNotifications, useMarkNotificationRead } from "@/hooks/data/useNotifications";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { data: notifications } = useMyNotifications();
  const markRead = useMarkNotificationRead();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications?.filter((n) => !n.read_at).length ?? 0;

  React.useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-md border bg-popover shadow-lg">
          <div className="max-h-96 overflow-y-auto p-2">
            {notifications?.length === 0 && <p className="p-3 text-sm text-muted-foreground">No notifications yet.</p>}
            {notifications?.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.read_at && markRead.mutate(n.id)}
                className={cn(
                  "block w-full rounded-md p-2 text-left text-sm hover:bg-accent",
                  !n.read_at && "bg-secondary/60 font-medium",
                )}
              >
                <p className="capitalize">{n.type.replace(/_/g, " ")}</p>
                <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
