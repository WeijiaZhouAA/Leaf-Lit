import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 text-center">
      <div>
        <h1 className="mb-4 font-serif text-6xl font-bold text-forest">404</h1>
        <p className="mb-6 text-body">This page doesn&apos;t exist — maybe it got checked out.</p>
        <Link href="/" className="rounded-xl bg-forest px-5 py-2.5 text-sm font-medium text-white">Go Home</Link>
      </div>
    </div>
  );
}
