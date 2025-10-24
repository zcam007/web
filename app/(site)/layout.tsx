import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: '#Mocha - Wedding ',
  description: 'A modern, elegant wedding website',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
