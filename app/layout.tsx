import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diploy Beta - Modern Sales Platform',
  description: 'AI-powered quote generation for modern sales.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
