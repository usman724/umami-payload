import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Multi-Tenant Analytics Dashboard',
  description: 'Analytics dashboard for multi-tenant applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

