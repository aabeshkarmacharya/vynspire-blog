"use client";
import { useEffect, useState } from 'react';
import { formatDateLocal, formatDateUTC } from '../../lib/datetime';

export default function Time({ iso }: { iso: string }) {
  // Render a stable UTC string on the server to avoid SSR crashes, then
  // reformat to the user's local timezone on the client.
  const [text, setText] = useState<string>(() => formatDateUTC(iso));
  useEffect(() => {
    setText(formatDateLocal(iso));
  }, [iso]);
  return (
    <span suppressHydrationWarning>{text}</span>
  );
}
