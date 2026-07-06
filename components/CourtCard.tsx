import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { CourtStatus } from "@/lib/types";

export interface CourtCardData {
  id: string;
  label: string;
  status: CourtStatus;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  scorerAssigned: boolean;
}

function Initial({ name }: { name: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surfaceAlt text-xs font-bold text-ink dark:bg-surfaceAltDark dark:text-paper">
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export default function CourtCard({ court }: { court: CourtCardData }) {
  return (
    <Link
      href={`/court/${court.id}`}
      className="block rounded-card bg-surface p-4 shadow-card transition hover:shadow-lg dark:bg-surfaceDark dark:shadow-cardDark dark:hover:brightness-110"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-upnext dark:text-mutedDark">
          {court.label}
        </h3>
        <StatusBadge status={court.status} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          <Initial name={court.teamAName} />
          <span className="truncate text-sm font-medium">{court.teamAName}</span>
        </div>
        <div className="font-display text-2xl font-extrabold tabular-nums">
          {court.scoreA}
          <span className="mx-1 text-upnext dark:text-mutedDark">–</span>
          {court.scoreB}
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 overflow-hidden">
          <span className="truncate text-right text-sm font-medium">
            {court.teamBName}
          </span>
          <Initial name={court.teamBName} />
        </div>
      </div>

      {!court.scorerAssigned && court.status === "active" && (
        <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">
          Unassigned — scan QR to score
        </p>
      )}
    </Link>
  );
}
