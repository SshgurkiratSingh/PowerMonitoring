import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CCMS - Centralized Control & Monitoring System",
  description:
    "Interactive presentation for Outdoor Electrical Distribution Control System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
