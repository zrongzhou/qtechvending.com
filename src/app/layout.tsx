import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Qtech — Intelligent Vending & Fresh-Flower Automation Equipment',
    template: '%s | Qtech',
  },
  description:
    'Qtech (Guangzhou Qiuyan Technology) manufactures intelligent vending machines, fresh-flower vending, and automated garden equipment for global distributors and operators.',
  metadataBase: process.env.NEXT_PUBLIC_BASE_URL
    ? new URL(process.env.NEXT_PUBLIC_BASE_URL)
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="flex min-h-screen flex-col bg-slate-50 text-ink-800 antialiased">
        {children}
      </body>
    </html>
  );
}
