"use client";

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
      }}
    >
      <Toolbar sx={{ minHeight: 56 }}>
        {/* Logo */}
        <Box 
          component={Link} 
          href="/"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            textDecoration: 'none',
            color: 'text.primary',
          }}
        >
          <SecurityIcon sx={{ fontSize: 24, color: 'primary.main' }} />
          <Typography 
            variant="h6" 
            fontWeight={600}
            color="text.primary"
            sx={{ fontSize: '1.1rem' }}
          >
            SecretShare
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Items */}
        {status === 'authenticated' && session ? (
          <Box display="flex" alignItems="center" gap={1}>
            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
              <Button
                component={Link}
                href="/dashboard"
                startIcon={<DashboardIcon sx={{ fontSize: 18 }} />}
                sx={{ 
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  px: 2,
                  py: 0.75
                }}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                href="/search"
                startIcon={<SearchIcon sx={{ fontSize: 18 }} />}
                sx={{ 
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  px: 2,
                  py: 0.75
                }}
              >
                Search
              </Button>
            </Box>
            
            <Button
              component={Link}
              href="/create"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              variant="contained"
              size="small"
              sx={{
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                px: 2,
                py: 0.75,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }
              }}
            >
              Create
            </Button>
            
            {/* User Menu */}
            <IconButton
              size="small"
              onClick={handleMenu}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {session.user?.name || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {session.user?.email}
                </Typography>
              </Box>
              <Divider />
              
              {/* Mobile Navigation */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <MenuItem onClick={() => { handleClose(); router.push('/dashboard'); }}>
                  <DashboardIcon sx={{ mr: 2, fontSize: 18 }} />
                  Dashboard
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); router.push('/search'); }}>
                  <SearchIcon sx={{ mr: 2, fontSize: 18 }} />
                  Search
                </MenuItem>
                <Divider />
              </Box>
              
              <MenuItem onClick={() => { handleClose(); router.push('/dashboard/settings/profile'); }}>
                Profile
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); router.push('/dashboard/settings/change-password'); }}>
                Change Password
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut} sx={{ color: 'error.main' }}>
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        ) : status === 'loading' ? (
          <Chip label="Loading..." size="small" variant="outlined" />
        ) : (
          <Box display="flex" alignItems="center" gap={1}>
            <Button 
              component={Link}
              href="/login"
              variant="outlined"
              size="small"
              sx={{
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                px: 2,
                py: 0.5
              }}
            >
              Sign In
            </Button>
            <Button 
              component={Link}
              href="/register"
              variant="contained"
              size="small"
              sx={{
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                px: 2,
                py: 0.5,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }
              }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
