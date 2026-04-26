import type { Metadata } from "next";
import { Anton, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "../providers/trpc-provider";
import { AuthSessionProvider } from "../providers/session-provider";

const anton = Anton({
  variable: "--font-anton",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
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
        className={`${anton.variable} ${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}
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
