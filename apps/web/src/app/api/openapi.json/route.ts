import { NextResponse } from 'next/server';

// Manual OpenAPI specification for SecretShare API
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SecretShare API',
    description: 'A secure, ephemeral secret-sharing platform API',
    version: '1.0.0',
    contact: {
      name: 'SecretShare Support',
      url: 'https://github.com/yourusername/secret-share',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      description: 'Production server',
    },
  ],
  paths: {
    '/api/trpc/secret.create': {
      post: {
        tags: ['secrets'],
        summary: 'Create a new secret',
        description: 'Creates a new encrypted secret with optional password protection and expiration',
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  secretText: {
                    type: 'string',
                    description: 'The secret content to encrypt and store',
                    minLength: 1,
                  },
                  password: {
                    type: 'string',
                    description: 'Optional password to protect the secret',
                  },
                  expiresAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Optional expiration date for the secret',
                  },
                  oneTimeAccess: {
                    type: 'boolean',
                    default: true,
                    description: 'Whether the secret can only be accessed once',
                  },
                },
                required: ['secretText'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Secret created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    url: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Authentication required',
          },
          429: {
            description: 'Rate limit exceeded',
            headers: {
              'Retry-After': {
                schema: { type: 'integer' },
                description: 'Seconds to wait before retrying',
              },
            },
          },
        },
      },
    },
    '/api/trpc/secret.get': {
      get: {
        tags: ['secrets'],
        summary: 'Retrieve a secret',
        description: 'Retrieves and decrypts a secret by ID. May mark it as viewed for one-time access secrets.',
        parameters: [
          {
            name: 'id',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'The secret ID',
          },
          {
            name: 'password',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Password if the secret is password-protected',
          },
        ],
        responses: {
          200: {
            description: 'Secret retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    secretText: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    oneTimeAccess: { type: 'boolean' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid password',
          },
          404: {
            description: 'Secret not found, expired, or already viewed',
          },
          429: {
            description: 'Rate limit exceeded',
          },
        },
      },
    },
    '/api/trpc/secret.list': {
      get: {
        tags: ['secrets'],
        summary: 'List user secrets',
        description: 'Lists all secrets created by the authenticated user',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'Secrets listed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      secretText: { 
                        type: 'string',
                        description: 'Preview of the secret (first 50 characters)'
                      },
                      createdAt: { type: 'string', format: 'date-time' },
                      expiresAt: { type: 'string', format: 'date-time', nullable: true },
                      isViewed: { type: 'boolean' },
                      oneTimeAccess: { type: 'boolean' },
                      hasPassword: { type: 'boolean' },
                      status: { 
                        type: 'string',
                        enum: ['active', 'viewed', 'expired']
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Authentication required',
          },
        },
      },
    },
    '/api/trpc/secret.delete': {
      delete: {
        tags: ['secrets'],
        summary: 'Delete a secret',
        description: 'Deletes a secret owned by the authenticated user',
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                },
                required: ['id'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Secret deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Authentication required',
          },
          404: {
            description: 'Secret not found or not authorized',
          },
        },
      },
    },
    '/api/trpc/secret.search': {
      get: {
        tags: ['secrets'],
        summary: 'Search user secrets',
        description: 'Searches through the authenticated user\'s secrets',
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            name: 'query',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Search query to match against secret content',
          },
        ],
        responses: {
          200: {
            description: 'Search results',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      secretText: { 
                        type: 'string',
                        description: 'Preview of the secret (first 50 characters)'
                      },
                      createdAt: { type: 'string', format: 'date-time' },
                      expiresAt: { type: 'string', format: 'date-time', nullable: true },
                      isViewed: { type: 'boolean' },
                      oneTimeAccess: { type: 'boolean' },
                      hasPassword: { type: 'boolean' },
                      status: { 
                        type: 'string',
                        enum: ['active', 'viewed', 'expired']
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Authentication required',
          },
        },
      },
    },
    '/api/register': {
      post: {
        tags: ['users'],
        summary: 'Register a new user',
        description: 'Creates a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
                required: ['name', 'email', 'password'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or user already exists',
          },
          429: {
            description: 'Rate limit exceeded',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      sessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'next-auth.session-token',
        description: 'NextAuth.js session cookie authentication',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
        required: ['error'],
      },
      RateLimitError: {
        allOf: [
          { $ref: '#/components/schemas/Error' },
          {
            type: 'object',
            properties: {
              retryAfter: { type: 'integer' },
            },
          },
        ],
      },
    },
  },
  tags: [
    {
      name: 'secrets',
      description: 'Secret management operations',
    },
    {
      name: 'users',
      description: 'User account operations',
    },
  ],
};

export async function GET() {
  try {
    return NextResponse.json(openApiSpec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating OpenAPI document:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate OpenAPI specification',
        message: 'The API documentation is temporarily unavailable'
      },
      { status: 500 }
    );
  }
}
