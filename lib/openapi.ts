import { generateOpenApiDocument } from 'trpc-openapi';
import { appRouter } from '../packages/api/index';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'SecretShare API',
  description: 'A secure, ephemeral secret-sharing platform API',
  version: '1.0.0',
  baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  docsUrl: '/api/docs',
  tags: ['secrets', 'users'],
});

export default openApiDocument;
