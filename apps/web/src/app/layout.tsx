import "./globals.css";
import "leaflet/dist/leaflet.css"; // global CSS from a node_module must be imported from a root layout
import type { Metadata } from "next";
import ClientShell from "@/app/shell";
import { ToastProvider } from "@/components/Toast";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "QSTEEL Logistics Platform",
  description: "AI-driven logistics management for rakes, yards, and routes.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
  <body className={`min-h-screen bg-background text-foreground ${inter.variable} font-sans`}>
        <ToastProvider>
          <ClientShell>
            {children}
          </ClientShell>
        </ToastProvider>
      </body>
    </html>
  );
}
