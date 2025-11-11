import { redirect } from 'next/navigation'
import config from '@/payload.config'

export default async function HomePage() {
  const payloadConfig = await config

  // Redirect to admin login page
  redirect(payloadConfig.routes.admin)
}
