import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Matcher: vše kromě API, Next.js internals a statických souborů
  matcher: ['/((?!api|_next|_vercel|\\..*).*)'],
}
