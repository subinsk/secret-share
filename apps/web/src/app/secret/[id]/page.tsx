"use client";
import { useState, useEffect } from 'react';
import { trpc } from '../../../utils/trpc';
import {
  Box,
  Typography,
  Alert,
  Paper,
  Button,
  TextField,
  Container,
  Chip,
  Divider,
  Stack,
  Skeleton,
  Fade,
  CircularProgress
} from '@mui/material';
import { useParams } from 'next/navigation';
import { useSnackbar } from '@/providers/snackbar-provider';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function SecretViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const { showSnackbar } = useSnackbar();const [viewRequested, setViewRequested] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [copied, setCopied] = useState(false); const [secretAlreadyViewed, setSecretAlreadyViewed] = useState(false);
  // Get secret info first (without revealing content)
  const { data: secretInfo, isLoading: infoLoading } = trpc.secret.getInfo.useQuery({ id }, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: secret, isLoading, error: trpcError, refetch } = trpc.secret.get.useQuery(
    { id, password: password || undefined },
    { enabled: false }
  );  // Add browser warning when secret is revealed
  useEffect(() => {
    if (secret && (secretInfo?.oneTimeAccess !== false)) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? This secret will be permanently destroyed and cannot be recovered.';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [secret, secretInfo]);  const handleView = async () => {
    setError('');
    setViewRequested(true);
    
    try {
      const result = await refetch();
      if (result.error) {
        if (result.error.message === 'Password required') {
          setShowPasswordInput(true);
        } else if (result.error.message === 'Secret has already been viewed') {
          setSecretAlreadyViewed(true);
          showSnackbar('This secret has already been viewed and destroyed', 'warning');
        } else {
          showSnackbar(result.error.message, 'error');
          setViewRequested(false); // Reset view state on error
        }
      }
    } catch (error: unknown) {
      const message = (error instanceof Error) ? error.message : 'Failed to retrieve secret. Please try again.';
      showSnackbar(message, 'error');
      setViewRequested(false);
    }
  };
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      showSnackbar('Please enter a password', 'error');
      return;
    }
    
    setSubmittingPassword(true);
    setError('');
    
    try {
      const result = await refetch();
      if (result.error) {
        if (result.error.message === 'Invalid password') {
          showSnackbar('Incorrect password. Please try again.', 'error');
        } else {
          showSnackbar(result.error.message, 'error');
        }
      } else {
        // Success - form will be hidden by the parent state change
        setShowPasswordInput(false);
      }
    } catch (error: unknown) {
      const message = (error instanceof Error) ? error.message : 'Failed to unlock secret. Please try again.';
      showSnackbar(message, 'error');
    } finally {
      setSubmittingPassword(false);
    }
  };
  const copyToClipboard = async () => {
    if (secret?.secretText) {
      try {
        await navigator.clipboard.writeText(secret.secretText);
        setCopied(true);
        showSnackbar('Secret copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error('Failed to copy');
        showSnackbar('Failed to copy to clipboard', 'error');
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>      <Stack spacing={4} alignItems="center">
      {/* Header */}
      <Fade in timeout={800}>
        <Box textAlign="center">
          <Typography
            variant="h3"
            fontWeight={700}
            color="text.primary"
            sx={{
              mb: 1,
              background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Secret Message
          </Typography>
          {infoLoading ? (
            <Skeleton variant="text" width={280} height={24} sx={{ mx: 'auto' }} />
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              {secretInfo?.oneTimeAccess === false
                ? 'Secure • Reusable • Time-limited'
                : 'Secure • Self-destructing • One-time only'
              }
            </Typography>
          )}
        </Box>
      </Fade>        {/* Main Content Card */}
      <Paper
        elevation={0}
        sx={{
          p: 5,
          width: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        {infoLoading ? (
          // Loading skeleton
          <Stack spacing={3} alignItems="center">
            <Skeleton variant="circular" width={64} height={64} />
            <Stack spacing={1} alignItems="center" width="100%">
              <Skeleton variant="text" width={200} height={32} />
              <Skeleton variant="text" width={300} height={20} />
            </Stack>
            <Skeleton variant="rectangular" width={180} height={48} sx={{ borderRadius: 2 }} />
          </Stack>) : !viewRequested || secretAlreadyViewed ? (
            // Initial view state or already viewed
            secretAlreadyViewed ? (
              <Fade in timeout={600}>
                <Alert
                  severity="warning"
                  sx={{
                    borderRadius: 3,
                    border: 'none',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                  }}
                >
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    Already Accessed
                  </Typography>
                  <Typography variant="body2">
                    This secret has been viewed and permanently destroyed for security
                  </Typography>
                </Alert>
              </Fade>
            ) : (
              <Fade in timeout={600}>
                <Stack spacing={4} alignItems="center">
                  <Box textAlign="center">
                    {secretInfo?.oneTimeAccess === false ? (
                      <>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 28, color: 'white' }} />
                        </Box>
                        <Typography variant="h5" fontWeight={600} sx={{ mb: 1.5 }}>
                          Ready to View
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 320, mx: 'auto' }}>
                          This secret remains accessible until its expiration date
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                          }}
                        >
                          <WarningAmberIcon sx={{ fontSize: 28, color: 'white' }} />
                        </Box>
                        <Typography variant="h5" fontWeight={600} sx={{ mb: 1.5 }}>
                          One-Time Access
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 320, mx: 'auto' }}>
                          This secret will be permanently destroyed after viewing
                        </Typography>
                      </>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    onClick={handleView}
                    size="large"
                    startIcon={<VisibilityIcon />}
                    sx={{
                      px: 5,
                      py: 2,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Reveal Secret
                  </Button>
                </Stack>
              </Fade>
            )
          ) : showPasswordInput ? (            // Password required state
            <Fade in timeout={600}>
              <Stack spacing={4} alignItems="center">
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <LockIcon sx={{ fontSize: 24, color: 'white' }} />
                  </Box>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1.5 }}>
                    Password Required
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 280, mx: 'auto' }}>
                    Enter the password to unlock this secret
                  </Typography>
                </Box>

                <Box component="form" onSubmit={handlePasswordSubmit} sx={{ width: '100%', maxWidth: 300 }}>
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    sx={{ mb: 3 }}
                    size="medium"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!password.trim() || submittingPassword}
                    fullWidth
                    size="large"
                    sx={{
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      },
                      '&:disabled': {
                        background: '#94a3b8',
                      },
                    }}
                  >
                    {submittingPassword ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                        Unlocking...
                      </>
                    ) : (
                      'Unlock Secret'
                    )}
                  </Button>
                </Box>
              </Stack>
            </Fade>
          ) : isLoading ? (
            // Loading state
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                Decrypting secret...
              </Typography>
            </Box>
          ) : error || trpcError ? (
            // Error state
            <Alert severity="error">
              {error || trpcError?.message}
            </Alert>
          ) : !secret ? (
            // Not found state
            <Alert severity="warning">
              Secret not found or already viewed
            </Alert>
          ) : (
          // Success state - show secret
          <Stack spacing={3}>
            <Box textAlign="center">
              <CheckCircleIcon
                sx={{
                  fontSize: 40,
                  color: 'success.main',
                  mb: 2,
                  opacity: 0.8
                }}
              />
              <Typography variant="h6" fontWeight={500} sx={{ mb: 1 }}>
                Secret Revealed
              </Typography>
              <Chip
                label={`Created ${new Date(secret.createdAt).toLocaleDateString()}`}
                size="small"
                variant="outlined"
                color="primary"
              />
            </Box>

            <Divider />
            {/* Secret content */}
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Secret Content
                </Typography>
                <Button
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={copyToClipboard}
                  sx={{
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5,
                    textTransform: 'none',
                    fontSize: '0.75rem'
                  }}
                  color={copied ? 'success' : 'primary'}
                  variant="outlined"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </Box>

              <Paper
                sx={{
                  p: 3,
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {secret.secretText}
                </Typography>
              </Paper>              </Box>
            {(secretInfo?.oneTimeAccess !== false) && (
              <Alert
                severity="error"
                sx={{
                  textAlign: 'center',
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  This secret has been permanently destroyed
                </Typography>
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                  Save this information now if you need it later
                </Typography>
              </Alert>
            )}
          </Stack>
        )}
      </Paper>
    </Stack>
    </Container>
  );
}
