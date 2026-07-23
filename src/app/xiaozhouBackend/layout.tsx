export const metadata = {
  title: 'Qtech Admin',
  robots: { index: false, follow: false },
};

// The root layout is now a pure pass-through (T06), so this admin route must
// render its own <html>/<body>. Kept noindex — admin is not meant to be indexed.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-ink-800">
        <div className="min-h-screen bg-slate-100 text-ink-800">{children}</div>
      </body>
    </html>
  );
}
