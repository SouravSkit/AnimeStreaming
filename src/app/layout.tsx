import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';

export const metadata: Metadata = {
  title: 'Zenkai - Anime Streaming',
  description: 'Watch your favorite anime online for free',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-text antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
