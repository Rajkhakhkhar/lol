import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        {children}
      </body>
    </html>
  );
}