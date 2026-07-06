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

export default function CourtCard({ court }: { court: CourtCardData }) {
  return (
    <Link
      href={`/court/${court.id}`}
      className="block rounded-card bg-surface p-4 shadow-card transition hover:shadow-lg"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-upnext">{court.label}</h3>
        <StatusBadge status={court.status} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 truncate text-sm font-medium">
          {court.teamAName}
        </div>
        <div className="text-2xl font-extrabold tabular-nums">
          {court.scoreA}
          <span className="mx-1 text-upnext">–</span>
          {court.scoreB}
        </div>
        <div className="flex-1 truncate text-right text-sm font-medium">
          {court.teamBName}
        </div>
      </div>

      {!court.scorerAssigned && court.status === "active" && (
        <p className="mt-3 text-xs font-medium text-live">
          Unassigned — scan QR to score
        </p>
      )}
    </Link>
  );
}
