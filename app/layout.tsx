import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Pickleball Live",
  description: "Live pickleball scoring and tournament organizing",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0B1220",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        <main className="min-h-screen pb-20 md:pb-0">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
