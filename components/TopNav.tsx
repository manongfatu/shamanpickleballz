import Link from "next/link";

export default function TopNav() {
  return (
    <header className="hidden bg-navy text-white md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
          Pickleball Live
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-coral">
            Home
          </Link>
          <Link href="/events" className="hover:text-coral">
            Tournaments
          </Link>
          <Link href="/brackets" className="hover:text-coral">
            Brackets
          </Link>
          <Link href="/live" className="hover:text-coral">
            Live Scores
          </Link>
          <Link
            href="/live"
            className="tap-target rounded-full bg-coralDeep px-4 py-2 font-semibold text-white hover:brightness-110"
          >
            View Live
          </Link>
        </nav>
      </div>
    </header>
  );
}
