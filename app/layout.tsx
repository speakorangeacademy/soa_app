import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/providers/query-provider'
import ResponsiveNavbar from '@/components/common/responsive-navbar'

export const metadata: Metadata = {
    title: 'Speak Orange Academy',
    description: 'Empowering children with communication skills',
    manifest: '/manifest.json',
}

export const viewport: Viewport = {
    themeColor: '#FF8C42',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen">
                <Providers>
                    <ResponsiveNavbar />
                    <main className="w-full">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    )
}
