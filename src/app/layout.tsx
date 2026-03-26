import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
    title: 'EYEKON - AI-Powered Travel Planner',
    description:
        'Customize your dream trip in minutes with EYEKON. Our AI builds optimised, day-by-day itineraries tailored to your preferences.',
    icons: {
        icon: [
            { url: '/logo.png', type: 'image/png' },
            { url: '/icon.svg', type: 'image/svg+xml' },
        ],
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={cn('font-sans', geist.variable)}
            suppressHydrationWarning
        >
            <body>
                <AuthProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
