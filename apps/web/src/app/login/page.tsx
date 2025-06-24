"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, TextField, Typography, Box, Paper, InputAdornment, IconButton, Container, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import { signIn } from 'next-auth/react';
import { useSnackbar } from '@/providers/snackbar-provider';
import CircularProgress from '@mui/material/CircularProgress';
import Loader from '@/components/common/loader';

function LoginPageInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email || !email.trim()) {
      showSnackbar('Please enter your email address', 'error');
      return;
    }
    if (!password || !password.trim()) {
      showSnackbar('Please enter your password', 'error');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showSnackbar('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    try {      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        switch (result.error) {
          case 'CredentialsSignin':
            showSnackbar('Invalid email or password', 'error');
            break;
          case 'AccessDenied':
            showSnackbar('Access denied. Please contact support.', 'error');
            break;
          case 'Verification':
            showSnackbar('Account verification required', 'error');
            break;
          default:
            showSnackbar('Sign in failed. Please try again.', 'error');
            break;
        }
      } else if (result?.ok) {
        // Success - show success message and redirect
        showSnackbar('Welcome back!', 'success');
        const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
        router.push(callbackUrl);
      } else {
        showSnackbar('An unexpected error occurred. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showSnackbar('Network error. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: "linear-gradient(135deg, #fafafa 0%, #f1f5f9 50%, #e2e8f0 100%)",
        position: "relative",
        overflow: "hidden",
        px: 2,
      }}
    >
      {/* Subtle Background Elements */}
      <Box
        component={motion.div}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.03 }}
        transition={{ duration: 2, delay: 0.5 }}
        sx={{
          position: "absolute",
          top: -150,
          right: -150,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, #6366f1 0%, #8b5cf6 100%)",
          zIndex: 0,
        }}
      />
      <Box
        component={motion.div}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.02 }}
        transition={{ duration: 2.5, delay: 0.8 }}
        sx={{
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, #14b8a6 0%, #3b82f6 100%)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6 },
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              borderRadius: 3,
              maxWidth: 420,
              mx: "auto",
            }}
          >
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <SecurityIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: 'secondary.main', 
                    mb: 2,
                  }} 
                />
              </motion.div>
              <Typography
                variant="h4"
                fontWeight={700}
                color="primary.main"
                gutterBottom
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to your SecretShare account
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    sx={{ py: 1.5 }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={22} sx={{ mr: 2 }} color="inherit" />
                        <span style={{ color: 'inherit', fontWeight: 600 }}>Signing In...</span>
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Don&apos;t have an account?{' '}
                      <Button
                        href="/register"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          p: 0,
                          minWidth: 'auto',
                          "&:hover": { background: 'transparent', textDecoration: 'underline' }
                        }}
                      >
                        Sign up here
                      </Button>
                    </Typography>
                  </Box>
                </motion.div>
              </Stack>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader />}>
      <LoginPageInner />
    </Suspense>
  );
}
