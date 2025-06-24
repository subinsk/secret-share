"use client";

import { CircularProgress, Box } from '@mui/material';
import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="40vh"
      width="100%"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
      >
        <CircularProgress size={48} thickness={4.5} color="primary" />
      </motion.div>
    </Box>
  );
}
