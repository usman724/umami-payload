export const metadata = {
  title: 'Sign Up - Hivefinty',
  description: 'Create your Hivefinty analytics account',
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
