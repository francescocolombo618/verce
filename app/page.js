'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    if (document.cookie.indexOf('js_enabled=1') === -1) {
      document.cookie = 'js_enabled=1; path=/';
      // Reload so middleware sees it on the next request
      location.reload();
    }
  }, []);

  return (
    <main>
      <p>Loading...</p>
    </main>
  );
}
