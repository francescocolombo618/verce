import { NextResponse } from 'next/server';
import { suspiciousAgents } from './utils/suspiciousAgents';

export const config = {
  matcher: '/', // Only apply middleware to homepage
};

const RATE_LIMIT_COOKIE = 'rl_check';
const CAPTCHA_COOKIE = 'captcha_verified';
const JS_COOKIE = 'js_enabled';
const ALLOWED_COUNTRIES = ['US', 'GB', 'NG'];

export async function middleware(req) {
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  const jsCookie = req.cookies.get(JS_COOKIE);
  const captchaCookie = req.cookies.get(CAPTCHA_COOKIE);
  const rlCookie = req.cookies.get(RATE_LIMIT_COOKIE);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '';

  // 🔍 1. Block known bot user-agents
  for (const agent of suspiciousAgents) {
    if (ua.includes(agent.toLowerCase())) {
      return NextResponse.redirect('https://example.com/exit.html');
    }
  }

  // ✅ 2. JavaScript detection via cookie
  if (!jsCookie || jsCookie.value !== '1') {
    return NextResponse.redirect('/check');
  }

  // 🌍 3. Geo IP blocking using Vercel's built-in location (Edge-safe)
  const country = req.geo?.country || '';
  if (country && !ALLOWED_COUNTRIES.includes(country)) {
    return NextResponse.redirect('https://example.com/geo-blocked.html');
  }

  // 🚦 4. Rate limiting
  const count = rlCookie ? parseInt(rlCookie.value) : 0;
  if (count >= 10) {
    return NextResponse.redirect('https://example.com/rate-limit.html');
  }

  const res = NextResponse.next();
  res.cookies.set(RATE_LIMIT_COOKIE, String(count + 1), {
    path: '/',
    maxAge: 60, // 1 minute
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
  });

  // 🔒 5. CAPTCHA enforcement
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
