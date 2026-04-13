import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { LandingPage } from './LandingPage'

interface Props { params: Promise<{ locale: string }> }

export default async function HomePage({ params }: Props) {
  const { locale }  = await params
  const session     = await getServerSession(authOptions)
  if (session) redirect(`/${locale}/dashboard`)

  return <LandingPage />
}
