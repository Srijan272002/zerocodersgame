import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navigation/Navbar';
import RootLayout from '@/components/layout/RootLayout';
import Providers from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ZeroCode',
  description: 'Build amazing applications with zero hassle',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="relative min-h-screen">
            <Navbar />
            <RootLayout>
              {children}
            </RootLayout>
          </div>
        </Providers>
      </body>
    </html>
  );
}
