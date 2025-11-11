export const metadata = {
  title: 'Tenants - Hivefinty',
  description: 'Manage your tenants on Hivefinty',
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
