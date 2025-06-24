import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/root-provider";
import Navbar from "@/components/common/navbar";
import NextTopLoader from 'nextjs-toploader';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secret Share - Secure Secret Sharing",
  description: "Share secrets securely with time-limited, encrypted links. Perfect for sharing passwords, API keys, and other sensitive information safely.",
  keywords: ["secret sharing", "password sharing", "secure", "encrypted", "privacy"],
  authors: [{ name: "Secret Share" }],
  openGraph: {
    title: "Secret Share - Secure Secret Sharing",
    description: "Share secrets securely with time-limited, encrypted links",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Secret Share - Secure Secret Sharing",
    description: "Share secrets securely with time-limited, encrypted links",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <NextTopLoader 
            color="#0f172a"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #0f172a,0 0 5px #0f172a"
          />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
