"use client";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import { forwardRef } from "react";
import type { Theme } from "@mui/material/styles";
import Slide from "@mui/material/Slide";

interface CustomSnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertColor; // "success" | "info" | "warning" | "error"
  onClose: () => void;
  autoHideDuration?: number;
}

const Alert = forwardRef<HTMLDivElement, React.ComponentProps<typeof MuiAlert>>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CustomSnackbar({
  open,
  message,
  severity = "info",
  onClose,
  autoHideDuration = 4000,
}: CustomSnackbarProps) {
  function TransitionUp(props: Parameters<typeof Slide>[0]) {
    return <Slide {...props} direction="down" />;
  }
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      TransitionComponent={TransitionUp}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{
          fontWeight: 600,
          letterSpacing: 0.5,
          borderRadius: 0.5,
          boxShadow: severity === "error" ? "0 2px 8px 0 #dc262655" : undefined,
          background: (theme: Theme) =>
            severity === "error"
              ? theme.palette.error.main
              : severity === "success"
              ? theme.palette.success.main
              : severity === "warning"
              ? theme.palette.warning.main
              : severity === "info"
              ? theme.palette.info.main
              : undefined,
          color: "#fff",
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
