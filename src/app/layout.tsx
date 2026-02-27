import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iconéra — AI Powered Travel Planner",
  description: "Plan your perfect trip with AI-optimized itineraries that respect real-world constraints like opening hours, travel time, budget, and personal preferences.",
  keywords: ["travel planner", "AI itinerary", "trip planning", "travel optimization"],
  authors: [{ name: "Iconéra" }],
  openGraph: {
    title: "Iconéra — AI Powered Travel Planner",
    description: "Intelligent trip planning powered by AI. Get optimized day-by-day itineraries in seconds.",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased grid-pattern">
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
