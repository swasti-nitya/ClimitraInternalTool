import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Climitra EmployeePortal',
  description: 'Internal expense and leave management portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
