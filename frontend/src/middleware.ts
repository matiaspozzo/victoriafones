import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Spam pages injected by a hack on the old WordPress site, long before this
// Next.js app existed — none of these paths were ever real content here.
// Google still has ~110 of them queued for periodic recrawl from that era;
// a 410 (Gone) tells it to drop them from the queue for good, rather than
// the plain 404 (Not Found, might come back) it would otherwise infer.
const GONE_PATTERN = /^\/[a-z]+(?:-[a-z]+)*\/[a-z]+(?:-[a-z]+)*\/[a-z0-9]{15}\.html?$/;
const GONE_EXACT = new Set(['/etc/drugrules.html', '/kaisya/index.html', '/iqr/refitinputview', '/usf']);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/+$/, '').toLowerCase();
  if (GONE_EXACT.has(pathname) || GONE_PATTERN.test(pathname)) {
    return new NextResponse('Gone', {status: 410});
  }
  return intlMiddleware(request);
}

export const config = {
  // Second entry re-includes .htm/.html paths (excluded by the first, along
  // with every other static-asset extension) purely so the spam URLs above
  // — the only .htm/.html paths this site has ever had — can be matched;
  // there are no real .htm/.html files in public/ for it to catch instead.
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)', '/((?!api|trpc|_next|_vercel).*\\.html?)'],
};
