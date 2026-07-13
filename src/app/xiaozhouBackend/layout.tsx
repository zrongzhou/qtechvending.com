export const metadata = {
  title: 'Qtech Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-100 text-ink-800">{children}</div>;
}
