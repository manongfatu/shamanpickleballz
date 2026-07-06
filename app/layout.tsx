import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import ThemeToggle from "@/components/ThemeToggle";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Pickleball Live",
  description: "Live pickleball scoring and tournament organizing",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0F1117",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Runs before paint, so the site never flashes the wrong theme on load.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-display: 'Plus Jakarta Sans', Inter, system-ui, sans-serif;
            --font-body: 'Inter', system-ui, sans-serif;
          }
        `}</style>
      </head>
      <body>
        <ThemeProvider>
          <TopNav />
          <main className="min-h-screen pb-20 md:pb-0">{children}</main>
          <BottomNav />
          <div className="fixed right-4 top-4 z-50 md:right-6 md:top-6">
            <ThemeToggle />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
