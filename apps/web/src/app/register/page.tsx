"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Typography, Box, Paper, InputAdornment, IconButton, Container, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useSnackbar } from '@/providers/snackbar-provider';
import CircularProgress from '@mui/material/CircularProgress';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const validate = () => {
    if (!name || name.trim().length < 2) {
      showSnackbar('Name must be at least 2 characters.', 'error');
      return false;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      showSnackbar('Please enter a valid email address.', 'error');
      return false;
    }
    if (!password || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password)) {
      showSnackbar('Password must be at least 8 characters, include uppercase, lowercase, number, and special character.', 'error');
      return false;
    }
    return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      showSnackbar('Registration successful! Please log in.', 'success');
      router.push('/login');
    } catch (err: unknown) {
      const message = (err instanceof Error) ? err.message : 'Registration failed';
      showSnackbar(message, 'error');
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
          left: -150,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, #8b5cf6 0%, #6366f1 100%)",
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
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, #3b82f6 0%, #14b8a6 100%)",
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
              maxWidth: 450,
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
                <PersonAddIcon 
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
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join SecretShare to start sharing securely
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
                    label="Full Name"
                    fullWidth
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
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
                  transition={{ duration: 0.5, delay: 0.5 }}
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
                  transition={{ duration: 0.5, delay: 0.6 }}
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
                        <span style={{ color: 'inherit', fontWeight: 600 }}>Creating Account...</span>
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Button
                        href="/login"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          p: 0,
                          minWidth: 'auto',
                          "&:hover": { background: 'transparent', textDecoration: 'underline' }
                        }}
                      >
                        Sign in here
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
