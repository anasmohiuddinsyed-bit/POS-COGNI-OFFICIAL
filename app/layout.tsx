import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'

export const metadata: Metadata = {
  title: 'POSENTIA - AI Infrastructure Layer for Modern Businesses',
  description: 'POSENTIA powers instant replies, automated follow-up, intent qualification, and seamless CRM integration. Never let a lead fall through the cracks.',
  icons: {
    icon: '/POSENTIA-LG.png',
    shortcut: '/POSENTIA-LG.png',
    apple: '/POSENTIA-LG.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-slate-900 antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
