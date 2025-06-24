# SecretShare - Secure Secret Sharing Platform

A robust, secure, full-stack secret sharing platform built with modern web technologies.

## Tech Stack

- **Frontend**: Next.js 14 (TypeScript, App Router)
- **Backend**: tRPC v10 with React Query
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **UI**: Material-UI (MUI) v5
- **Animations**: Framer Motion
- **Password Hashing**: bcryptjs
- **Date Handling**: date-fns

## Project Structure

```
secret-share/
├── apps/
│   └── web/                     # Next.js frontend application
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   │   ├── api/        # API routes (NextAuth, registration, etc.)
│       │   │   ├── dashboard/  # User dashboard
│       │   │   ├── create/     # Create secret page
│       │   │   ├── secret/     # View secret page
│       │   │   ├── login/      # Login page
│       │   │   ├── register/   # Registration page
│       │   │   ├── profile/    # User profile page
│       │   │   ├── search/     # Search secrets page
│       │   │   └── layout.tsx  # Root layout
│       │   ├── components/     # Reusable React components
│       │   ├── providers/      # Context providers
│       │   ├── utils/          # Utility functions and tRPC client
│       │   └── middleware.ts   # Route protection middleware
│       └── package.json
├── packages/
│   └── api/                    # tRPC backend API
│       ├── index.ts           # Main router export
│       ├── trpc.ts            # tRPC configuration
│       ├── secret.ts          # Secret management routes
│       └── user.ts            # User management routes
├── prisma/
│   └── schema.prisma          # Database schema
├── .env                       # Environment variables
└── package.json              # Root package.json (workspace config)
```

## Features

### Core Features
- **Secret Creation**: Create encrypted secrets with optional passwords and expiration
- **Secure Viewing**: One-time access secrets that self-destruct after viewing
- **User Authentication**: Secure login/registration with NextAuth.js
- **Dashboard**: Manage all created secrets with status indicators
- **Search**: Search through created secrets by content or ID
- **Profile Management**: Update user profile and change passwords
- **Password Protection**: Optional password protection for secrets
- **Auto Expiration**: Set custom expiration times for secrets

### Security Features
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure session management
- **Route Protection**: Middleware-based authentication
- **Input Validation**: Zod schema validation
- **CSRF Protection**: NextAuth.js built-in protection
- **One-time Access**: Secrets marked as viewed after first access
- **Encryption at Rest**: AES-256-CBC encryption for all secrets
- **Rate Limiting**: Per-IP and per-user rate limiting
- **Secure Headers**: Security-first middleware configuration

### UI/UX Features
- **Modern Design**: Clean, responsive Material-UI interface
- **Animations**: Smooth Framer Motion animations
- **Dark/Light Theme**: Consistent theming across the app
- **Mobile Responsive**: Works seamlessly on all devices
- **User Feedback**: Toast notifications for all actions
- **Loading States**: Proper loading indicators and skeleton screens
- **API Documentation**: Interactive Swagger UI documentation

### Bonus Features
- **Secret Burn Notifications**: Email notifications when secrets are viewed
- **Comprehensive API Docs**: Complete OpenAPI 3.0 specification
- **Rate Limiting**: Advanced rate limiting with multiple tiers
- **Encryption at Rest**: Military-grade encryption for all secrets
- **Security Audit**: Complete security feature implementation

## Setup & Installation

### Prerequisites
- Node.js 18+
- Yarn package manager
- PostgreSQL database

### Environment Variables
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/secretshare"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Encryption (REQUIRED for production)
# Generate with: node -p "require('crypto').randomBytes(32).toString('hex')"
ENCRYPTION_KEY="your-64-character-hex-encryption-key-here-keep-this-secret"

# Email Notifications (Optional - for secret burn notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd secret-share
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development server**
   ```bash
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## API Routes

### Interactive API Documentation
Visit `/api/docs` for complete interactive API documentation with Swagger UI.

### tRPC Routes
- `secret.create` - Create a new secret
- `secret.get` - Retrieve a secret by ID
- `secret.getInfo` - Get secret metadata without content
- `secret.list` - List user's secrets
- `secret.search` - Search user's secrets
- `secret.delete` - Delete a secret
- `user.updateProfile` - Update user profile
- `user.getProfile` - Get user profile

### REST API Routes
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication
- `POST /api/register` - User registration
- `POST /api/profile` - Update user profile
- `POST /api/change-password` - Change user password
- `GET /api/openapi.json` - OpenAPI specification
- `GET /api/docs` - Interactive API documentation

## Database Schema

```prisma
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  name           String?
  hashedPassword String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  secrets        Secret[]
}

model Secret {
  id         String    @id @default(cuid())
  secretText String
  password   String?
  expiresAt  DateTime?
  isViewed   Boolean   @default(false)
  userId     String?
  user       User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}
```

## Development Commands

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run database migrations
npx prisma db push

# Generate Prisma client
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Secret**: Add a new secret with optional password and expiration
3. **Share Link**: Copy the generated link to share the secret
4. **View Secret**: Recipients can view the secret once using the link
5. **Manage Secrets**: Use the dashboard to track and manage your secrets
6. **Search**: Find specific secrets using the search functionality

## Security Considerations

### Encryption & Data Protection
- **Encryption at Rest**: All secrets are encrypted using AES-256-CBC before storage
- **Password Hashing**: User passwords hashed with bcryptjs (12 salt rounds)
- **One-time Access**: Secrets with one-time access are permanently deleted after viewing
- **Secure Key Management**: Encryption keys stored securely outside the database

### Rate Limiting & Abuse Prevention
- **IP-based Rate Limiting**: Multiple tiers of rate limiting per IP address
  - General API: 100 requests per 15 minutes
  - Secret creation: 5 requests per minute
  - Secret access: 20 requests per minute
  - Authentication: 10 requests per 15 minutes
- **User-based Rate Limiting**: Additional limits for authenticated users

### Authentication & Authorization
- **NextAuth.js**: Industry-standard authentication with session management
- **Route Protection**: Middleware-based authentication for protected routes
- **CSRF Protection**: Built-in cross-site request forgery protection
- **Input Validation**: Comprehensive Zod schema validation on all endpoints

### Privacy & Monitoring
- **No Plaintext Logging**: Secrets and passwords never logged in plaintext
- **Burn Notifications**: Optional email notifications when secrets are accessed
- **Access Auditing**: Optional logging of access attempts for security monitoring
- **IP Tracking**: Anonymous IP logging for rate limiting and abuse prevention

### Security Headers & Policies
- **Secure Headers**: Security-first middleware configuration
- **Content Security Policy**: Protection against XSS attacks
- **HTTPS Enforcement**: All production traffic encrypted in transit

## Deployment

The application is ready for deployment on platforms like:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Render**
- Any Node.js hosting provider

### Deployment Checklist
1. Set up environment variables in your hosting platform:
   - `DATABASE_URL` - Production PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Secure random string for JWT signing
   - `NEXTAUTH_URL` - Your production domain URL
   - `ENCRYPTION_KEY` - 64-character hex encryption key (REQUIRED)
   - `SMTP_*` variables - Optional, for email notifications
2. Configure your production database (PostgreSQL recommended)
3. Update `NEXTAUTH_URL` to your production domain
4. Run database migrations: `npx prisma db push`
5. Test all functionality in production environment

### Environment Variables for Production
```bash
# Required
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
NEXTAUTH_SECRET="your-super-long-random-secret-key"
NEXTAUTH_URL="https://your-app.vercel.app"
ENCRYPTION_KEY="your-64-character-hex-encryption-key"

# Optional (for email notifications)
SMTP_HOST="your-smtp-host"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.