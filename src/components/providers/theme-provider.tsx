"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

const emptySubscribe = () => () => {};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const isServer = React.useSyncExternalStore(
    emptySubscribe,
    () => false,
    () => true
  );

  if (isServer) {
    return <>{children}</>;
  }

  return <NextThemesProvider enableSystem={false} {...props}>{children}</NextThemesProvider>;
}


