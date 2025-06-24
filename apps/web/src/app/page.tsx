"use client";
import { Box, Typography, Button, Paper, Container, Stack, Grid } from "@mui/material";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TimerIcon from '@mui/icons-material/Timer';
import LockIcon from '@mui/icons-material/Lock';
import { JSX } from "react";

export default function Home() {
  const { data: session } = useSession();

  const features: Array<{ icon: JSX.Element; title: string; description: string }> = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: "End-to-End Encrypted",
      description: "Your secrets are encrypted client-side before transmission"
    },
    {
      icon: <VisibilityOffIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: "One-Time View",
      description: "Secrets self-destruct after being viewed once"
    },
    {
      icon: <TimerIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: "Auto Expiration",
      description: "Set custom expiration times for added security"
    }
  ];

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: "linear-gradient(135deg, #fafafa 0%, #f1f5f9 50%, #e2e8f0 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 10 } }}>
        <Grid container columns={12} columnSpacing={6} alignItems="center" minHeight="80vh">
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Stack spacing={4}>
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      background: "linear-gradient(135deg, #0f172a 0%, #6366f1 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 2,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                    }}
                  >
                    Share Secrets
                    <br />
                    Securely
                  </Typography>
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    sx={{ 
                      fontWeight: 400,
                      lineHeight: 1.6,
                      maxWidth: 500,
                    }}
                  >
                    Send sensitive information with confidence using encrypted, 
                    self-destructing links that expire after one view.
                  </Typography>
                </Box>

                {session ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      component={Link}
                      href="/create"
                      variant="contained"
                      size="large"
                      startIcon={<LockIcon />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                      }}
                    >
                      Create Secret
                    </Button>
                    <Button
                      component={Link}
                      href="/dashboard"
                      variant="outlined"
                      size="large"
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                      }}
                    >
                      Dashboard
                    </Button>
                  </Stack>
                ) : (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      component={Link}
                      href="/register"
                      variant="contained"
                      size="large"
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      component={Link}
                      href="/login"
                      variant="outlined"
                      size="large"
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                      }}
                    >
                      Sign In
                    </Button>
                  </Stack>
                )}
              </Stack>
            </motion.div>
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  borderRadius: 3,
                }}
              >
                <Typography variant="h6" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
                  Why choose SecretShare?
                </Typography>
                <Stack spacing={3}>
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    >
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        {feature.icon}
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </motion.div>
                  ))}
                </Stack>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Decorative Elements */}
      <Box
        component={motion.div}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.06 }}
        transition={{ duration: 2, delay: 0.5 }}
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, #6366f1 0%, #8b5cf6 100%)",
          zIndex: 0,
        }}
      />
      <Box
        component={motion.div}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.04 }}
        transition={{ duration: 2.5, delay: 0.8 }}
        sx={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, #14b8a6 0%, #3b82f6 100%)",
          zIndex: 0,
        }}
      />
    </Box>
  );
}
