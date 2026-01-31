import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://reviewai.'),
  title: "ReviewAI - AI-Powered Code Review",
  description: "Ship cleaner, faster, safer code with AI. Get instant bug detection, security analysis, performance optimization, and clean code suggestions for your codebase.",
  keywords: ["ReviewAI", "AI Code Review", "Code Analysis", "Bug Detection", "Security Analysis", "Code Quality", "Developer Tools", "AI Assistant"],
  authors: [{ name: "ReviewAI Team" }],
  icons: {
    icon: "/reviewai-logo.png",
  },
  openGraph: {
    title: "ReviewAI - Ship Cleaner Code with AI",
    description: "AI-powered code review for production-ready applications. Detect bugs, security issues, and performance problems instantly.",
    url: "#",
    siteName: "ReviewAI",
    type: "website",
    images: [
      {
        url: "/reviewai-logo.png",
        width: 1024,
        height: 1024,
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ReviewAI - AI-Powered Code Review",
    description: "Ship cleaner, faster, safer code with AI. Get instant code reviews with professional insights.",
    images: ["/reviewai-logo.png"]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
