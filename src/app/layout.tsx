import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Entix.app",
    template: "%s · Entix.app"
  },
  description: "منصة إدارة الشركات — عمليات، مستندات، حوكمة، وامتثال."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
