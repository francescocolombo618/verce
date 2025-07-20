'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckPage() {
  const router = useRouter();

  useEffect(() => {
    document.cookie = 'js_enabled=1; path=/';
    router.push('/');
  }, []);

  return <p>JavaScript enabled. Redirecting...</p>;
}
