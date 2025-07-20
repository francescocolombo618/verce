'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // You can optionally log or debug cookie status here
  }, []);

  return (
    <main>
      <h1>Welcome to the Bot-Protected App</h1>
      <p>You have JavaScript enabled.</p>
    </main>
  );
}
