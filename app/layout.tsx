import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";
import { BRAND_NAME, DEFAULT_TAGLINE } from "@/lib/brand";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} | Learning Platform`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: DEFAULT_TAGLINE,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: `${BRAND_NAME} | Learning Platform`,
    description: DEFAULT_TAGLINE,
    siteName: BRAND_NAME,
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
