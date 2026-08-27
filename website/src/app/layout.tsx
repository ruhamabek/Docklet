import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";


export const metadata: Metadata = {
  metadataBase: new URL("https://docklet-ochre.vercel.app"),
  title: "Docklet - Minimalist & Privacy-First Docker Desktop Client",
  description: "A lightweight, modern desktop client for Docker built with Go, Wails v2, Next.js, and Tailwind CSS. Zero telemetry, 100% local privacy.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
    openGraph: {
    title: "Docklet - Minimalist Docker Desktop Client",
    description: "Lightweight Docker management interface with live kernel CPU/RAM metrics and zero telemetry.",
     url: "https://docklet-ochre.vercel.app",
     siteName: "Docklet",
    images: [
      {
        url: "/screenshots/dashboard.png",
        width: 1200,
        height: 630,
        alt: "Docklet Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Privacy-Friendly Analytics Tag Placeholder (Plausible / Cloudflare Web Analytics / Umami) */}
        {/* <script defer data-domain="docklet.app" src="https://plausible.io/js/script.js"></script> */}
      </head>
      <body className="antialiased bg-[#090a0f] text-[#e1e7ec] selection:bg-[#00ff66] selection:text-black">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
