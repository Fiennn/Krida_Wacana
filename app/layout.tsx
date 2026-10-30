import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  BRAND_COLORS,
  LOGO_FILES,
  SCHOOL_NAME,
} from "@/lib/constants";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import VisitorTracker from "@/components/tracking/VisitorTracker";
import { FloatingGuestBookButton } from "@/components/tracking/GuestBookModal";
import "./globals.css";

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_TITLE = `${SITE_NAME} | ${SCHOOL_NAME}`;

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Basis untuk URL OG image (fallback localhost saat dev)
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
  icons: {
    icon: LOGO_FILES.krida,
    apple: LOGO_FILES.krida,
  },
  keywords: [
    "krida wacana",
    "SD Negeri 2 Kemutug Lor",
    "Baturraden",
    "Banyumas",
    "artikel sekolah",
    "kegiatan sekolah",
    "prestasi siswa",
    "portal artikel sekolah",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "id_ID",
    images: [{ url: LOGO_FILES.krida, width: 512, height: 512, alt: "Logo Krida Wacana" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [LOGO_FILES.krida],
  },
};

export const viewport: Viewport = {
  themeColor: BRAND_COLORS.navy,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${fontSerif.variable} ${fontSans.variable} flex min-h-screen flex-col font-sans`}
      >
        <SessionProviderWrapper session={session}>
          <Suspense fallback={null}>
            <VisitorTracker />
          </Suspense>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingGuestBookButton />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
