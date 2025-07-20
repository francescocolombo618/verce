// pages/check.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function Check() {
  const router = useRouter();

  useEffect(() => {
    Cookies.set('js_enabled', '1', { expires: 1 });
    router.push('/');
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Checking your browser...</h1>
      <p>If you're not redirected, make sure JavaScript is enabled.</p>
    </div>
  );
}