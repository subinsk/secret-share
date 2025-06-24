'use client';

import { useState, useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';

export default function APIDocsPage() {
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpenAPISpec = async () => {
      try {
        const response = await fetch('/api/docs');
        if (!response.ok) {
          throw new Error('Failed to fetch OpenAPI specification');
        }
        const openApiSpec = await response.json();
        setSpec(openApiSpec);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOpenAPISpec();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          API Documentation
        </Typography>
        {spec && SwaggerUI ? (
          <SwaggerUI spec={spec} />
        ) : (
          <Box mt={2}>
            <pre style={{ fontSize: 13, background: '#f5f5f5', padding: 16, borderRadius: 8, overflowX: 'auto' }}>
              {JSON.stringify(spec, null, 2)}
            </pre>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
