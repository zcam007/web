"use client";

import { useEffect, useState } from 'react';
import { formatDualTimezone } from '../lib/timezone-display';
import { getUserTimezone } from '../lib/device-detection';

interface DualTimezoneDisplayProps {
  date: string;
  time: string;
  className?: string;
}

export default function DualTimezoneDisplay({ date, time, className = '' }: DualTimezoneDisplayProps) {
  const [formattedTime, setFormattedTime] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const userTimezone = getUserTimezone();
    const formatted = formatDualTimezone(date, time, userTimezone);
    setFormattedTime(formatted);
  }, [date, time]);

  // Server-side render: show IST only
  if (!isClient) {
    const istTime = time.includes(':') ? 
      (time.match(/\d{1,2}:\d{2}\s*(AM|PM)/i)?.[0] || time) : 
      time;
    return <span className={className}>{istTime} IST</span>;
  }

  return <span className={className}>{formattedTime}</span>;
}
