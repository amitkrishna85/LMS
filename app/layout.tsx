import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SkillPulse | Modern Learning Platform",
    template: "%s | SkillPulse",
  },
  description:
    "Curated internal masterclasses and world-class external certifications in one unified platform.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "SkillPulse | Modern Learning Platform",
    description:
      "Curated internal masterclasses and world-class external certifications.",
    siteName: "SkillPulse",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
