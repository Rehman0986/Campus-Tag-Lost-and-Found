import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../app/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './layout.css'
import { ToastProvider } from '@/components/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Campus Tag - Scan It to Find It',
  description: 'Campus Tag - The smart lost and found platform for universities.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}
