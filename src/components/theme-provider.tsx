
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import React from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({ 
  children,
  attribute = 'class',
  defaultTheme = 'dark',
  enableSystem = true,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute={attribute} 
      defaultTheme={defaultTheme} 
      enableSystem={enableSystem}
      forcedTheme={undefined}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
