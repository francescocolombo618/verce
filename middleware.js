import { NextResponse } from 'next/server';
import { suspiciousAgents } from './utils/suspiciousAgents';

export const config = {
  matcher: '/', // only run on homepage
};

const RATE_LIMIT_COOKIE = 'rl_check';
const CAPTCHA_COOKIE = 'captcha_verified';
const JS_COOKIE = 'js_enabled';
const GEO_API = 'https://ipapi.co';
const ALLOWED_COUNTRIES = ['AU'];

export async function middleware(req) {
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  const jsCookie = req.cookies.get(JS_COOKIE);
  const captchaCookie = req.cookies.get(CAPTCHA_COOKIE);
  const rlCookie = req.cookies.get(RATE_LIMIT_COOKIE);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '';

  for (const agent of suspiciousAgents) {
    if (ua.includes(agent.toLowerCase())) {
      return NextResponse.redirect('https://example.com/exit.html');
    }
  }

  if (!jsCookie || jsCookie.value !== '1') {
    return NextResponse.redirect('/check');
  }

  try {
    const geoRes = await fetch(`${GEO_API}/${ip}/json/`);
    if (geoRes.ok) {
      const geo = await geoRes.json();
      if (!ALLOWED_COUNTRIES.includes(geo.country_code)) {
        return NextResponse.redirect('https://example.com/geo-blocked.html');
      }
    }
  } catch (err) {}

  const count = rlCookie ? parseInt(rlCookie.value) : 0;
  if (count >= 10) {
    return NextResponse.redirect('https://example.com/rate-limit.html');
  }

  const res = NextResponse.next();
  res.cookies.set(RATE_LIMIT_COOKIE, String(count + 1), {
    path: '/',
    maxAge: 60,
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
  });

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
