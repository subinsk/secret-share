"use client";

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  IconButton,
  Divider,
  InputAdornment,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  LockReset as LockResetIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from '@/providers/snackbar-provider';

export default function ChangePasswordPage() {
  const { status } = useSession();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showSnackbar('All fields are required', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showSnackbar('New password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showSnackbar('New passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }

      showSnackbar('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      const message = (error instanceof Error) ? error.message : 'Failed to change password';
      showSnackbar(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" py={8}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Breadcrumbs */}
        <Box mb={3}>
          <Breadcrumbs>
            <Link 
              color="inherit" 
              href="/dashboard" 
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Dashboard
            </Link>
            <Link 
              color="inherit" 
              href="/dashboard/settings/profile" 
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Settings
            </Link>
            <Typography color="text.primary">Change Password</Typography>
          </Breadcrumbs>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: '1px solid #e2e8f0',
            borderRadius: 3,
          }}
        >
          <Stack spacing={4}>
            {/* Header */}
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <IconButton 
                  onClick={() => router.back()}
                  sx={{ p: 1 }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <LockResetIcon 
                  sx={{ fontSize: 32, color: 'primary.main' }} 
                />
                <Box>
                  <Typography variant="h4" fontWeight={600} color="primary.main">
                    Change Password
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Update your account password for better security
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Password Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  required
                  size="medium"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                          size="small"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  required
                  size="medium"
                  helperText="Password must be at least 6 characters long"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          size="small"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required
                  size="medium"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box display="flex" gap={2} justifyContent="flex-end" pt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/dashboard/settings/profile')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                    sx={{ minWidth: 140 }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
}
