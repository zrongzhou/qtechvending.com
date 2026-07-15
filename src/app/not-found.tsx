import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-coral-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-ink-900">Page not found</h1>
      <p className="mt-2 text-ink-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/en"
        className="btn-sunset mt-8 px-6 py-3 text-sm"
      >
        Back to home
      </Link>
    </div>
  );
}
