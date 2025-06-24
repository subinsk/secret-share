"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../app/theme";
import { SnackbarProvider } from "@/providers/snackbar-provider";
import { trpc } from "@/utils/trpc";

interface ProvidersProps {
  children: React.ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{children}</SnackbarProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default trpc.withTRPC(Providers) as React.ComponentType<ProvidersProps>;
