import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PROPERTY MANAGEMENT",
  description: "Integrated Property Sales & Marketing System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
