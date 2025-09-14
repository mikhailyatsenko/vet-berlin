import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PageHeader } from "@/components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Veterinarian Directory Berlin | Find the Best Veterinarians in Berlin",
    template: "%s | Veterinarian Directory Berlin"
  },
  description: "Find the best veterinarians and pet clinics in Berlin. Search by neighborhood, services, and availability. Read reviews, view photos, and get contact information for top-rated veterinary practices.",
  keywords: [
    "veterinarian Berlin",
    "pet clinic Berlin", 
    "animal hospital Berlin",
    "veterinary services Berlin",
    "pet doctor Berlin",
    "emergency vet Berlin",
    "cat vet Berlin",
    "dog vet Berlin"
  ],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-gray-50">
          <PageHeader
            title="🐾 Veterinarian Directory"
            subtitle="Find the best veterinarians in your Berlin"
          />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
