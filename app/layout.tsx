import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { AuthGate } from "@/components/AuthGate";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gulffinancejobs.com";

const DEFAULT_DESCRIPTION =
  "Find Finance and AI jobs across Saudi Arabia, UAE, Qatar, Kuwait, Bahrain and Oman. Investment banking, private equity, machine learning, data science roles updated daily.";

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-C600NLP5SE";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Gulf Finance & AI Jobs Portal",
    template: "%s | Gulf Finance & AI Jobs",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "finance jobs gulf",
    "AI jobs UAE",
    "finance careers Saudi Arabia",
    "investment banking jobs Dubai",
    "data science jobs Middle East",
    "CFA jobs GCC",
    "machine learning jobs Gulf",
    "banking jobs Riyadh",
  ],
  openGraph: {
    type: "website",
    siteName: "Gulf Finance & AI Jobs",
    title: "Gulf Finance & AI Jobs Portal",
    description: DEFAULT_DESCRIPTION,
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Gulf Finance & AI Jobs Portal",
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <AuthGate>{children}</AuthGate>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
