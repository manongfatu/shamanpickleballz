import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-16">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Pickleball Live
        </h1>
        <p className="mt-2 text-upnext dark:text-mutedDark">
          Live scores, brackets, and courts — no sign-up needed to play or watch.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/scan"
          className="tap-target rounded-card bg-action p-6 text-center text-white shadow-card hover:brightness-110 dark:shadow-cardDark"
        >
          <div className="mb-1 text-2xl">📷</div>
          <div className="font-display text-lg font-bold">Scan to Score</div>
          <p className="mt-1 text-sm text-white/80">
            Scan a court's QR code to become its scorer
          </p>
        </Link>

        <Link
          href="/live"
          className="tap-target rounded-card bg-surface p-6 text-center shadow-card hover:shadow-lg dark:bg-surfaceDark dark:shadow-cardDark dark:hover:brightness-110"
        >
          <div className="mb-1 text-2xl">📡</div>
          <div className="font-display text-lg font-bold">Watch Live Scores</div>
          <p className="mt-1 text-sm text-upnext dark:text-mutedDark">
            See every active court right now
          </p>
        </Link>
      </div>

      <div className="mt-8 rounded-card border border-dashed border-black/10 p-6 text-center dark:border-white/15">
        <p className="text-sm text-upnext dark:text-mutedDark">Organizing an event?</p>
        <Link
          href="/events/new"
          className="tap-target mt-2 inline-block rounded-full bg-coralDeep px-5 py-2.5 font-semibold text-white hover:brightness-110"
        >
          Create an Event
        </Link>
        <p className="mt-2 text-xs text-upnext dark:text-mutedDark">
          Requires a free account &middot;{" "}
          <Link href="/login" className="underline">
            log in
          </Link>
        </p>
      </div>
    </div>
  );
}
