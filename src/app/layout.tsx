import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Entix.app",
  description: "Company management platform for structured operations."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
