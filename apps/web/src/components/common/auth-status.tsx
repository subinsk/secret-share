"use client";

import { useSession, signOut } from 'next-auth/react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <CircularProgress size={20} />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (session) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Typography>Welcome, {session.user?.name || session.user?.email}</Typography>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => router.push('/dashboard')}
        >
          Dashboard
        </Button>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          Sign Out
        </Button>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Button 
        variant="contained" 
        size="small"
        onClick={() => router.push('/login')}
      >
        Sign In
      </Button>
      <Button 
        variant="outlined" 
        size="small"
        onClick={() => router.push('/register')}
      >
        Register
      </Button>
    </Box>
  );
}
