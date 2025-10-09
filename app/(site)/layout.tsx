import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: '#Mocha - Wedding ',
  description: 'A modern, elegant wedding website',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script defer src="http://192.168.4.253:3000/script.js" data-website-id="9f5dcb8e-3ba6-4a8d-a9bb-e160448f64a3"></script>
        </head>
      <body>{children}</body>
    </html>
  );
}
