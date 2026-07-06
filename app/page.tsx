import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Pickleball Live
        </h1>
        <p className="mt-2 text-upnext">
          Live scores, brackets, and courts — no sign-up needed to play or watch.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/scan"
          className="tap-target rounded-card bg-action p-6 text-center text-white shadow-card hover:brightness-110"
        >
          <div className="text-2xl mb-1">📷</div>
          <div className="text-lg font-bold">Scan to Score</div>
          <p className="mt-1 text-sm text-white/80">
            Scan a court's QR code to become its scorer
          </p>
        </Link>

        <Link
          href="/live"
          className="tap-target rounded-card bg-surface p-6 text-center shadow-card hover:shadow-lg"
        >
          <div className="text-2xl mb-1">📡</div>
          <div className="text-lg font-bold">Watch Live Scores</div>
          <p className="mt-1 text-sm text-upnext">
            See every active court right now
          </p>
        </Link>
      </div>

      <div className="mt-8 rounded-card border border-dashed border-black/10 p-6 text-center">
        <p className="text-sm text-upnext">Organizing an event?</p>
        <Link
          href="/events/new"
          className="tap-target mt-2 inline-block rounded-lg bg-gold px-5 py-2.5 font-semibold text-navy hover:brightness-95"
        >
          Create an Event
        </Link>
        <p className="mt-2 text-xs text-upnext">
          Requires a free account &middot;{" "}
          <Link href="/login" className="underline">
            log in
          </Link>
        </p>
      </div>
    </div>
  );
}
