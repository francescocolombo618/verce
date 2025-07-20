import { NextResponse } from 'next/server';

export const config = {
  matcher: '/', // Only apply to homepage
};

// Inline suspicious agents for safety
const suspiciousAgents = [
  'googlebot', 'telegram', 'bing', 'bot', 'crawl', 'spider', 'facebook',
  'curl', 'wget', 'python', 'scrapy', 'masscan', 'nmap', 'checker',
  'mj12bot', 'ahrefsbot', 'semrushbot', 'uptimerobot', 'netcraft'
];

const RATE_LIMIT_COOKIE = 'rl_check';
const CAPTCHA_COOKIE = 'captcha_verified';
const JS_COOKIE = 'js_enabled';
const ALLOWED_COUNTRIES = ['US', 'NG'];
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60;

export function middleware(req) {
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  const jsCookie = req.cookies.get(JS_COOKIE);
  const captchaCookie = req.cookies.get(CAPTCHA_COOKIE);
  const rlCookie = req.cookies.get(RATE_LIMIT_COOKIE);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '';
  const country = req.geo?.country || '';

  // Allow /check page to run JS
  if (req.nextUrl.pathname === '/check') {
    return NextResponse.next();
  }

  // Bot check
  for (const agent of suspiciousAgents) {
    if (ua.includes(agent)) {
      return NextResponse.redirect('https://example.com/exit.html');
    }
  }

  // JS detection
  if (!jsCookie || jsCookie.value !== '1') {
    return NextResponse.redirect('/check');
  }

  // Geo filtering (uses Vercel Edge headers, no fetch)
  if (country && !ALLOWED_COUNTRIES.includes(country)) {
    return NextResponse.redirect('https://example.com/geo-blocked.html');
  }

  // Rate limiting
  const count = rlCookie ? parseInt(rlCookie.value) : 0;
  if (count >= RATE_LIMIT_MAX) {
    return NextResponse.redirect('https://example.com/rate-limit.html');
  }

  const res = NextResponse.next();
  res.cookies.set(RATE_LIMIT_COOKIE, String(count + 1), {
    path: '/',
    maxAge: RATE_LIMIT_WINDOW,
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
  });

  // CAPTCHA check
  if (!captchaCookie || captchaCookie.value !== 'true') {
    res.cookies.set('captcha_pending', 'true', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });
    return NextResponse.redirect('https://example.com/captcha.html');
  }

  return res;
}
