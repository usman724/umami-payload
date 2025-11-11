import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hivefinty - Multi-tenant Analytics Dashboard',
  description: 'Hivefinty Analytics Dashboard for multi-tenant applications',
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

