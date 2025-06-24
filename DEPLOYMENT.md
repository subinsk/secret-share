# Deployment Guide

## Local Development

### Prerequisites
- Node.js 18 or higher
- Yarn package manager  
- PostgreSQL database

### Setup

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secrets
   ```

3. **Database setup**
   ```bash
   yarn db:generate
   yarn db:push
   ```

4. **Start development server**
   ```bash
   yarn dev
   ```

## Vercel Deployment

### 1. Push to GitHub
Push your code to a GitHub repository.

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository

### 3. Configure Environment Variables
In your Vercel project dashboard, add these environment variables:

```
DATABASE_URL=your_production_database_url
NEXTAUTH_SECRET=your_production_secret_key
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app/api
```

### 4. Deploy
Vercel will automatically deploy your app. The `vercel.json` configuration is already set up.

## Database Options for Production

### Option 1: Neon (Recommended)
- Free PostgreSQL hosting
- Easy setup with Prisma
- Go to [neon.tech](https://neon.tech)

### Option 2: Vercel Postgres
- Integrated with Vercel
- Go to your Vercel dashboard → Storage → Create Database

### Option 3: Railway
- Free tier available
- Go to [railway.app](https://railway.app)

## Post-Deployment

1. **Run database migrations**
   ```bash
   npx prisma db push
   ```

2. **Test the deployment**
   - Visit your deployed URL
   - Test user registration
   - Test secret creation and viewing

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | `your-super-secret-key` |
| `NEXTAUTH_URL` | App URL for callbacks | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Public API URL | `https://your-app.vercel.app/api` |

## Troubleshooting

### Build Errors
- Check TypeScript errors: `yarn type-check`
- Check linting: `yarn lint`

### Database Issues
- Ensure DATABASE_URL is correct
- Run `yarn db:generate` after schema changes

### Authentication Issues
- Verify NEXTAUTH_URL matches your domain
- Ensure NEXTAUTH_SECRET is set
