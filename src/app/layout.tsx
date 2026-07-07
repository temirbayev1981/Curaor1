import type { Metadata } from 'next';
import { Geist, Geist_Mono, Pacifico, Playfair_Display } from 'next/font/google';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

const pacifico = Pacifico({
  variable: '--font-pacifico',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: {
    default: 'The Emerald Pour — Mobile Irish Pub',
    template: '%s | The Emerald Pour',
  },
  description:
    'North Carolina premier mobile Irish pub catering for weddings, corporate events, and celebrations.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${pacifico.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
