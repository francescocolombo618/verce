// middleware.js
import { NextResponse } from 'next/server';
import { suspiciousAgents } from './utils/suspiciousAgents';

export const config = {
  matcher: '/', // only apply to homepage (not /check)
};

const RATE_LIMIT_COOKIE = 'rl_check';
const CAPTCHA_COOKIE = 'captcha_verified';
const JS_COOKIE = 'js_enabled';
const ALLOWED_COUNTRIES = ['US', 'NG'];
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60;

// Optional: Logging endpoint (disabled by default)
const BLOCK_LOG_URL = ''; // leave empty or add your endpoint

async function logEvent(ip, reason, ua) {
  if (!BLOCK_LOG_URL) return;
  try {
    await fetch(BLOCK_LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ip,
        reason,
        userAgent: ua,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) {
    // silently fail
  }
}

export async function middleware(req) {
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  const jsCookie = req.cookies.get(JS_COOKIE);
  const captchaCookie = req.cookies.get(CAPTCHA_COOKIE);
  const rlCookie = req.cookies.get(RATE_LIMIT_COOKIE);
  const country = req.geo?.country || '';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '';

  // Allow JS check route through
  if (req.nextUrl.pathname === '/check') {
    return NextResponse.next();
  }

  // 1. Bot detection
  for (const agent of suspiciousAgents) {
    if (ua.includes(agent)) {
      await logEvent(ip, 'Blocked by User-Agent', ua);
      return NextResponse.redirect('https://example.com/exit.html');
    }
  }

  // 2. JavaScript detection
  if (!jsCookie || jsCookie.value !== '1') {
    return NextResponse.redirect('/check');
  }

  // 3. Geo block
  if (country && !ALLOWED_COUNTRIES.includes(country)) {
    await logEvent(ip, `Geo Block: ${country}`, ua);
    return NextResponse.redirect('https://example.com/geo-blocked.html');
  }

  // 4. Rate limiting
  const count = rlCookie ? parseInt(rlCookie.value) : 0;
  if (count >= RATE_LIMIT_MAX) {
    await logEvent(ip, 'Rate Limit Exceeded', ua);
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

  // 5. CAPTCHA enforcement
  if (!captchaCookie || captchaCookie.value !== 'true') {
    res.cookies.set('captcha_pending', 'true', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });
    await logEvent(ip, 'CAPTCHA Required', ua);
    return NextResponse.redirect('https://example.com/captcha.html');
  }

  return res;
}
