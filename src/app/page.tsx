import { redirect } from 'next/navigation';

// Root path → default locale. Middleware also handles this, but this is a
// hard fallback in case middleware is bypassed.
export default function RootPage() {
  redirect('/en');
}
