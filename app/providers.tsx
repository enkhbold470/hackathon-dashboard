'use client';

import React, { useEffect, ReactNode } from 'react';
import { cssVariables } from '@/lib/colors';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Apply CSS variables from our color system
    Object.entries(cssVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, []);

  return <>{children}</>;
} 