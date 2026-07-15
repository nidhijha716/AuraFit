import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeBackground } from "@/components/theme/ThemeBackground";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AuraFit — Your Smart Gym Companion",
  description:
    "A premium mobile-first gym companion. Track workouts, follow guided training, and reach your fitness goals.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#283048",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className={`${plusJakarta.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ThemeBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
