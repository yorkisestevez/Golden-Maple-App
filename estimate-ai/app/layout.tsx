import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EstimateAI — AI-Powered Contractor Estimator",
  description:
    "White-label, embeddable instant project estimator for outdoor living contractors. Your pricing, your brand, your leads.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
