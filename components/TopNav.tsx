import Link from "next/link";

export default function TopNav() {
  return (
    <header className="hidden bg-navy text-white md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Pickleball Live
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-gold">
            Home
          </Link>
          <Link href="/events" className="hover:text-gold">
            Tournaments
          </Link>
          <Link href="/brackets" className="hover:text-gold">
            Brackets
          </Link>
          <Link href="/live" className="hover:text-gold">
            Live Scores
          </Link>
          <Link
            href="/live"
            className="tap-target rounded-lg bg-gold px-4 py-2 font-semibold text-navy hover:brightness-95"
          >
            View Live
          </Link>
        </nav>
      </div>
    </header>
  );
}
