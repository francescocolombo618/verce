// middleware.js
import { NextResponse } from 'next/server';
import { suspiciousAgents } from './utils/suspiciousAgents';
import { blockedIps } from './utils/blockedIps';

export const config = {
  matcher: '/', // or '*' to apply to all routes
};

const RATE_LIMIT_COOKIE = 'rl_check';
const CAPTCHA_COOKIE = 'captcha_verified';
const JS_COOKIE = 'js_enabled';
const GEO_API = 'https://ipapi.co';
const ALLOWED_COUNTRIES = ['AU', 'NG'];
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 3;
const BLOCK_LOG_URL = 'https://your-logging-endpoint.com/log';

async function logEvent(ip, reason, ua) {
  try {
    await fetch(BLOCK_LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, reason, userAgent: ua, timestamp: new Date().toISOString() }),
    });
  } catch (e) {
    // Optional: handle logging errors silently
  }
}

export async function middleware(req) {
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  const jsCookie = req.cookies.get(JS_COOKIE);
  const captchaCookie = req.cookies.get(CAPTCHA_COOKIE);
  const rlCookie = req.cookies.get(RATE_LIMIT_COOKIE);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '';

  // 🔒 Block IPs from list
  if (blockedIps.includes(ip)) {
    await logEvent(ip, 'Blocked by IP', ua);
    return NextResponse.redirect('https://www.google.com');
  }

  // 👮 Block suspicious User-Agent
  for (const agent of suspiciousAgents) {
    if (ua.includes(agent)) {
      await logEvent(ip, 'Blocked by User-Agent', ua);
      return NextResponse.redirect('https://www.google.com);
    }
  }

  // 🌍 GeoIP Filtering
  try {
    const geoRes = await fetch(`${GEO_API}/${ip}/json/`);
    if (geoRes.ok) {
      const geo = await geoRes.json();
      if (!ALLOWED_COUNTRIES.includes(geo.country_code)) {
        await logEvent(ip, `Geo Block: ${geo.country_code}`, ua);
        return NextResponse.redirect('https://www.google.com');
      }
    }
  } catch (err) {}

  // ⏱️ Rate Limit Logic
  const count = rlCookie ? parseInt(rlCookie.value) : 0;
  if (count >= RATE_LIMIT_MAX) {
    await logEvent(ip, 'Rate Limit Exceeded', ua);
    return NextResponse.redirect('https://www.google.com');
  }

  const res = NextResponse.next();
  res.cookies.set(RATE_LIMIT_COOKIE, String(count + 1), {
    path: '/',
    maxAge: RATE_LIMIT_WINDOW,
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
  });

  return res;
}
