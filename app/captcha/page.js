'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CaptchaPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.turnstile) {
      window.turnstile.render('#turnstile-container', {
        sitekey: process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY,
        callback: async (token) => {
          const res = await fetch('/api/verify-captcha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          if (res.ok) {
            router.push('/');
          } else {
            alert('Verification failed.');
          }
        },
      });
    }
  }, []);

  return (
    <div>
      <h1>Verifying...</h1>
      <div id="turnstile-container"></div>
      <script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      ></script>
    </div>
  );
}
