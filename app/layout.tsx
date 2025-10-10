import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Diploy Beta - Modern Sales Platform',
  description: 'Quote generation for modern sales.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Script id="google-maps" strategy="afterInteractive" src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? process.env.GOOGLE_API_KEY ?? 'AIzaSyDrGa30JYdf3woua4KvRoyDNY1Juq6AAtE'}&libraries=places`}></Script>
        <header className="bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold text-slate-800">Home Services Co</Link>
            <nav>
              <Link href="/configure" className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">Schedule</Link>
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
