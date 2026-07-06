import { CourtStatus } from "@/lib/types";
import clsx from "clsx";

const config: Record<
  CourtStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  active: {
    label: "LIVE",
    className: "bg-live text-white",
    icon: <span className="h-2 w-2 animate-pulse rounded-full bg-white" />,
  },
  idle: {
    label: "UP NEXT",
    className: "bg-upnext text-white",
    icon: <span aria-hidden>⏱</span>,
  },
  finished: {
    label: "BREAK",
    className: "bg-onbreak text-white",
    icon: <span aria-hidden>⏸</span>,
  },
};

export default function StatusBadge({ status }: { status: CourtStatus }) {
  const c = config[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide",
        c.className
      )}
    >
      {c.icon}
      {c.label}
    </span>
  );
}
