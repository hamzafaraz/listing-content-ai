import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ListingContentAI - AI-Powered Amazon Listing Design Assistant",
  description: "Generate professional Amazon listing text content, visual guidance, and 2000x2000px image prompts in minutes. The ultimate tool for Amazon designers.",
  keywords: [
    "Amazon Listing AI",
    "Amazon Design Tool",
    "ListingContentAI",
    "Amazon Image Prompts",
    "Product Listing Optimization",
    "AI Listing Assistant",
    "Amazon Infographic Design",
    "Listing Design Strategy"
  ],
  authors: [{ name: "ListingContentAI Team" }],
  metadataBase: new URL("https://listingcontentai.com"),
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "PASTE_YOUR_GOOGLE_VERIFICATION_CODE_HERE", // Optional: Add this if you want to verify via HTML tag
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "ListingContentAI - AI-Powered Amazon Listing Design Assistant",
    description: "Generate professional Amazon listing content and visual plans in minutes with ListingContentAI.",
    url: "https://listingcontentai.com",
    siteName: "ListingContentAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ListingContentAI - AI Listing Design Agent",
    description: "Generate professional Amazon listing content in minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
