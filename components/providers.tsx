"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({
  children,
  defaultTheme,
}: {
  children: ReactNode;
  defaultTheme: "light" | "dark" | "system";
}) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme={defaultTheme}
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
