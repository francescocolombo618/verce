'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckPage() {
  const router = useRouter();

  useEffect(() => {
    // Set the cookie
    document.cookie = 'js_enabled=1; path=/';

    // Redirect to homepage
    router.push('/');
  }, []);

  return <p>Verifying JavaScript support…</p>;
}
