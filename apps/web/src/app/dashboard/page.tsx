"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import { trpc } from '@/utils/trpc';
import { useSnackbar } from '@/providers/snackbar-provider';
import type { Secret } from '@/types';
import { DashboardHeader, EmptyState, LoadingState, SearchBar, SecretCard } from '@/components';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [secretToDelete, setSecretToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Secret[]>([]);
  const [searchActive, setSearchActive] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const {
    data: secrets,
    isLoading,
    error,
    refetch,
  } = trpc.secret.list.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const deleteSecretMutation = trpc.secret.delete.useMutation({
    onSuccess: () => {
      showSnackbar('Secret deleted successfully', 'success');
      refetch();
      setDeleteDialogOpen(false);
      setSecretToDelete(null);
    },
    onError: (error) => {
      showSnackbar(error.message || 'Failed to delete secret', 'error');
    },
  });

  const handleDeleteSecret = (id: string) => {
    setSecretToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (secretToDelete) {
      deleteSecretMutation.mutate({ id: secretToDelete });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSnackbar('Link copied to clipboard!', 'success');
    } catch {
      showSnackbar('Failed to copy link', 'error');
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim() || !secrets) {
      setSearchResults([]);
      setSearchActive(false);
      return;
    }
    const filtered = (secrets as Secret[])
      .filter(secret =>
        secret.secretText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        secret.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(secret => ({
        ...secret,
        status: secret.status as "viewed" | "expired" | "active",
      }));
    setSearchResults(filtered);
    setSearchActive(true);
  };
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchActive(false);
  };

  if (status === 'loading') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Skeleton variant="text" width={300} height={60} />
          <Box display="flex" flexWrap="wrap" gap={3}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" width={300} height={200} />
            ))}
          </Box>
        </Stack>
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
        <DashboardHeader />
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          handleClearSearch={handleClearSearch}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error.message || 'Failed to load secrets'}
          </Alert>
        )}

        {isLoading && (
          <LoadingState />
        )}

        {!isLoading && secrets && secrets.length === 0 && !searchActive && (
          <EmptyState
            title="No Secrets Yet"
            message="Create your first secret to get started"
            buttonText="Create Secret"
            onButtonClick={() => router.push('/create')}
          />
        )}

        {!isLoading && (
          <Box display="flex" flexWrap="wrap" gap={3}>
            {(searchActive ? searchResults : secrets || []).map((secret, index) => (
              <SecretCard
                key={secret.id}
                secret={secret}
                index={index}
                handleDeleteSecret={handleDeleteSecret}
                copyToClipboard={copyToClipboard}
              />
            ))}
          </Box>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Secret</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this secret? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={confirmDelete}
              color="error"
              variant="contained"
              disabled={deleteSecretMutation.isPending}
            >
              {deleteSecretMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
}
