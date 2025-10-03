import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Our Wedding',
  description: 'A modern, elegant wedding website',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
