"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/events", label: "Tournaments", icon: "🏆" },
  { href: "/live", label: "Live", icon: "📡" },
  { href: "/brackets", label: "Brackets", icon: "🗂️" },
  { href: "/more", label: "More", icon: "⋯" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-black/5 bg-surface md:hidden"
      aria-label="Primary"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "tap-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs",
              active ? "text-action font-semibold" : "text-upnext"
            )}
          >
            <span aria-hidden className="text-lg leading-none">
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
