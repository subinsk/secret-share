"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { trpc } from '@/utils/trpc';
import { useSnackbar } from '@/providers/snackbar-provider';

const expirationOptions = [
  { value: '1h', label: '1 Hour' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export default function CreateSecretPage() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [secretText, setSecretText] = useState('');
  const [password, setPassword] = useState('');
  const [expiration, setExpiration] = useState('24h');
  const [oneTimeAccess, setOneTimeAccess] = useState(true);
  const [secretUrl, setSecretUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const createSecretMutation = trpc.secret.create.useMutation({
    onSuccess: (data: { url: string }) => {
      setSecretUrl(data.url);
      showSnackbar('Secret created successfully!', 'success');
    },
    onError: (error: unknown) => {
      const errMsg = error instanceof Error ? error.message : 'Failed to create secret';
      showSnackbar(errMsg, 'error');
    },
  });

  const calculateExpirationDate = (expiration: string): Date => {
    const now = new Date();
    switch (expiration) {
      case '1h':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretText.trim()) {
      showSnackbar('Please enter a secret to share', 'error');
      return;
    }

    createSecretMutation.mutate({
      secretText: secretText.trim(),
      password: password.trim() || undefined,
      expiresAt: calculateExpirationDate(expiration),
      oneTimeAccess,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(secretUrl);
      showSnackbar('URL copied to clipboard!', 'success');
    } catch {
      showSnackbar('Failed to copy URL', 'error');
    }
  };

  if (secretUrl) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Secret Created Successfully!
          </Typography>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your secret has been created and is ready to share.
          </Alert>
          <Typography variant="h6" gutterBottom>
            Share this URL:
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.300',
              mb: 3,
              wordBreak: 'break-all',
            }}
          >
            <Typography variant="body2" fontFamily="monospace">
              {secretUrl}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button variant="contained" onClick={copyToClipboard}>
              Copy URL
            </Button>
            <Button variant="outlined" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </Box>
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Important:</strong> This URL will only work{' '}
              {oneTimeAccess ? 'once' : `until ${expiration}`}. Make sure to share it securely.
            </Typography>
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create a Secret
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Share sensitive information securely with expiration and password protection.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Secret Text"
            value={secretText}
            onChange={(e) => setSecretText(e.target.value)}
            placeholder="Enter your secret message, password, or sensitive information..."
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Password Protection (Optional)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Set a password to protect this secret"
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          <TextField
            fullWidth
            select
            label="Expiration"
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
            sx={{ mb: 3 }}
          >
            {expirationOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={oneTimeAccess}
                onChange={(e) => setOneTimeAccess(e.target.checked)}
              />
            }
            label="One-time access (secret will be deleted after first view)"
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={createSecretMutation.isPending}
            sx={{ py: 1.5 }}
          >
            {createSecretMutation.isPending ? <CircularProgress size={24} /> : 'Create Secret'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
