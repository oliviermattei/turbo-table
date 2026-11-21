import type { Metadata, Viewport } from 'next';
import { Fredoka } from 'next/font/google';
import { CompanionTheme } from '@/components/pet';
import { Decor } from '@/components/ui';
import { DataProvider } from '@/lib/data';
import './globals.css';

const fredoka = Fredoka({ subsets: ['latin'], variable: '--font-fredoka' });

export const metadata: Metadata = {
  title: 'Turbo Tables',
  description: 'Révise tes tables de multiplication en jouant.',
};

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, themeColor: '#1e1b4b',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={fredoka.variable}>
      <body>
        <div className="app"><Decor /><DataProvider><CompanionTheme />{children}</DataProvider></div>
      </body>
    </html>
  );
}
