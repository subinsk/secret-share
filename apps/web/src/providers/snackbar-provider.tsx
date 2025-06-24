"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import CustomSnackbar from "@/components/common/custom-snackbar";
import type { AlertColor } from "@mui/material";

interface SnackbarContextProps {
  showSnackbar: (message: string, severity?: AlertColor, autoHideDuration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(undefined);

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used within a SnackbarProvider");
  return ctx;
}

export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("info");
  const [autoHideDuration, setAutoHideDuration] = useState<number | undefined>(4000);

  const showSnackbar = useCallback((msg: string, sev: AlertColor = "info", duration?: number) => {
    setMessage(msg);
    setSeverity(sev);
    setAutoHideDuration(duration ?? 4000);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <CustomSnackbar
        open={open}
        message={message}
        severity={severity}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
      />
    </SnackbarContext.Provider>
  );
};
