export async function POST(req) {
  const { token } = await req.json();

  const secret = process.env.CLOUDFLARE_SECRET_KEY;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token,
    }),
  });

  const data = await res.json();

  if (data.success) {
    const response = new Response(JSON.stringify({ ok: true }));
    response.headers.set(
      'Set-Cookie',
      `captcha_verified=true; Path=/; Max-Age=3600; HttpOnly; Secure; SameSite=Strict`
    );
    return response;
  } else {
    return new Response('CAPTCHA failed', { status: 403 });
  }
}
