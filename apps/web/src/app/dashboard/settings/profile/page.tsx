"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
  Breadcrumbs,
  Link,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from '@/providers/snackbar-provider';
import { ChangePasswordCard } from '@/components';
import { api } from '@/utils/api';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.name) {
      setName(session.user.name);
    }
  }, [session, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showSnackbar('Name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/profile', {
        name: name.trim(),
      });
      showSnackbar('Profile updated successfully!', 'success');
      await update();
    } catch (error: unknown) {
      const message = (error instanceof Error) ? error.message : 'Failed to update profile';
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

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Breadcrumbs */}
        <Box mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => router.push('/dashboard')}
            sx={{ p: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Breadcrumbs>
            <Link
              color="inherit"
              href="/dashboard"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Dashboard
            </Link>
            <Typography color="text.primary">Settings</Typography>
          </Breadcrumbs>
        </Box>

        <Stack spacing={4}>
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
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={600} color="primary.main">
                      Profile Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage your account information
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Profile Form */}
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    disabled={!editMode}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <PersonIcon color="action" sx={{ mr: 1 }} />
                        ),
                      }
                    }}
                  />

                  <TextField
                    label="Email Address"
                    value={session?.user?.email || ''}
                    disabled
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <EmailIcon color="action" sx={{ mr: 1 }} />
                        ),
                      }
                    }}
                    helperText="Email cannot be changed"
                  />

                  <Box display="flex" gap={2} justifyContent="flex-end" pt={2}>
                    {editMode ? (
                      <>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditMode(false);
                            setName(session?.user?.name || '');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          type='submit'
                          disabled={loading}
                          sx={{ minWidth: 120 }}
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setEditMode(true)}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </Box>
                </Stack>
              </form>
            </Stack>
          </Paper>

          <ChangePasswordCard />
        </Stack>
      </motion.div>
    </Container>
  );
}
