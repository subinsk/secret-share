"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Paper,
  Stack,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Security as SecurityIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { trpc } from '@/utils/trpc';
import { useSnackbar } from '@/providers/snackbar-provider';
import { formatDistanceToNow } from 'date-fns';
import type { SecretListItem } from '@/types';

export default function SearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SecretListItem[]>([]);
  const [searchActive, setSearchActive] = useState(false);

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const {
    data: allSecrets,
    refetch,
  } = trpc.secret.list.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const deleteSecretMutation = trpc.secret.delete.useMutation({
    onSuccess: () => {
      showSnackbar('Secret deleted successfully', 'success');
      refetch();
    },
    onError: (error) => {
      showSnackbar(error.message || 'Failed to delete secret', 'error');
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim() || !allSecrets) {
      setSearchResults([]);
      setSearchActive(false);
      return;
    }
    const filtered = allSecrets.filter(secret =>
      secret.secretText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      secret.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
    setSearchActive(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchActive(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSnackbar('Link copied to clipboard!', 'success');
    } catch {
      showSnackbar('Failed to copy link', 'error');
    }
  };
  const getStatusColor = (status: string): 'error' | 'warning' | 'success' | 'default' => {
    switch (status) {
      case 'viewed': return 'error';
      case 'expired': return 'warning';
      case 'active': return 'success';
      default: return 'default';
    }
  };
  const getStatusText = (status: string, expiresAt: string | null): string => {
    switch (status) {
      case 'viewed': return 'Already viewed';
      case 'expired': return 'Expired';
      case 'active': 
        if (!expiresAt) return 'No expiration';
        return `Expires ${formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}`;
      default: return 'Unknown';
    }
  };

  if (status === 'loading') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" py={8}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack spacing={4}>
          {/* Header */}
          <Box>
            <Typography variant="h3" fontWeight={700} color="primary.main" mb={1}>
              Search Secrets
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Search through your created secrets
            </Typography>
          </Box>

          {/* Search Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid #e2e8f0',
              borderRadius: 3,
            }}
          >
            <TextField
              fullWidth
              placeholder="Search by secret content or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Box display="flex" gap={2} mt={2}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Paper>

          {/* Search Results */}
          {searchActive && (
            <Box>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Search Results ({searchResults.length} found)
              </Typography>

              {searchResults.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    textAlign: 'center',
                    py: 6,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    border: '2px dashed #cbd5e1',
                    borderRadius: 3,
                  }}
                >
                  <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" mb={1}>
                    No secrets found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search terms
                  </Typography>
                </Paper>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={3}>
                  {searchResults.map((secret, index) => (
                    <motion.div
                      key={secret.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card
                        elevation={0}
                        sx={{
                          width: 320,
                          border: '1px solid #e2e8f0',
                          borderRadius: 3,
                          height: '100%',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                          },
                        }}
                      >
                        <CardContent sx={{ pb: 1 }}>
                          <Stack spacing={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <SecurityIcon color="primary" />
                              <Typography variant="h6" fontWeight={600} noWrap>
                                Secret #{secret.id.slice(0, 8)}
                              </Typography>
                            </Box>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {secret.secretText.length > 50 
                                ? `${secret.secretText.substring(0, 50)}...` 
                                : secret.secretText}
                            </Typography>

                            <Box display="flex" gap={1} flexWrap="wrap">
                              <Chip
                                size="small"
                                icon={<TimeIcon />}
                                label={getStatusText(secret.status, secret.expiresAt)}
                                color={getStatusColor(secret.status)}
                                variant="outlined"
                              />
                              {secret.hasPassword && (
                                <Chip
                                  size="small"
                                  label="Password protected"
                                  variant="outlined"
                                />
                              )}
                            </Box>

                            <Typography variant="caption" color="text.secondary">
                              Created {formatDistanceToNow(new Date(secret.createdAt), { addSuffix: true })}
                            </Typography>
                          </Stack>
                        </CardContent>

                        <CardActions sx={{ px: 2, pb: 2 }}>
                          <Button
                            size="small"
                            startIcon={<CopyIcon />}
                            onClick={() => 
                              copyToClipboard(`${window.location.origin}/secret/${secret.id}`)
                            }
                          >
                            Copy Link
                          </Button>
                          <Button
                            size="small"
                            startIcon={<LinkIcon />}
                            onClick={() => router.push(`/secret/${secret.id}`)}
                          >
                            View
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteSecretMutation.mutate({ id: secret.id })}
                            sx={{ ml: 'auto' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </motion.div>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </motion.div>
    </Container>
  );
}
