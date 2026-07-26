import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "../providers/trpc-provider";
import { AuthSessionProvider } from "../providers/session-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerPath AI - AI-Powered Career Counseling",
  description: "Transform your career with personalized AI counseling, skill assessments, and strategic guidance. Discover your potential and unlock new opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        <AuthSessionProvider>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
