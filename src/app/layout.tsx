import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iconéra — AI-Powered Travel Planner",
  description:
    "Plan your dream trip in minutes with Iconéra. Our AI builds optimised, day-by-day itineraries tailored to your preferences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}