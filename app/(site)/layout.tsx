import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: '#Mocha - Wedding',
  description: 'Chandu & Mouni Wedding - Join us for our special celebration',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>❤️</text></svg>',
  },
  manifest: '/manifest.json',
  themeColor: '#c79a6d',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Chandu & Mouni Wedding',
  },
  openGraph: {
    title: 'Chandu & Mouni Wedding',
    description: 'Join us for our special celebration',
    type: 'website',
  },
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
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>{children}</body>
    </html>
  );
}
