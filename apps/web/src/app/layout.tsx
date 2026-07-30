import type { Metadata } from "next";
import "./globals.css";
import React from "react";

import Navbar from "../components/byMe/Navbar";
import Footer from "../components/byMe/Footer";
import AuthProvider from "./(user-control)/oauth/AuthProvider";
import CookieConsent from "@/components/byMe/CookieConsent";

import { Toaster } from "sonner";
import { Inter, Space_Grotesk } from "next/font/google";

export const metadata: Metadata = {
  title: "Sleep.",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "optional",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "optional",
});

const RootLayout: React.FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = ({ children }) => {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="bg-[#f5f0e8] text-[#1a1a1a] min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen w-full max-w-7xl mx-auto relative pt-4">
            <Navbar />

            <main className="grow w-full">
              {children}
            </main>

            <Footer />
            <CookieConsent />
            <Toaster richColors position="top-right" closeButton />
          </div>
        </AuthProvider>
      </body>
    </html>
  )};

export default RootLayout

