import Link from "next/link";

export default function MorePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-xl font-bold">More</h1>
      <div className="space-y-3">
        <Link
          href="/login"
          className="block rounded-card bg-surface dark:bg-surfaceDark p-4 font-medium shadow-card"
        >
          Log in / Sign up
        </Link>
        <Link
          href="/events/new"
          className="block rounded-card bg-surface dark:bg-surfaceDark p-4 font-medium shadow-card"
        >
          Create an event
        </Link>
        <Link
          href="/scan"
          className="block rounded-card bg-surface dark:bg-surfaceDark p-4 font-medium shadow-card"
        >
          Scan to score
        </Link>
      </div>
    </div>
  );
}
