// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['api'],
  typescript: {
    // Allow build to succeed even with type errors during development
    ignoreBuildErrors: false,
  },
  eslint: {
    // Allow build to succeed even with ESLint errors during development  
    ignoreDuringBuilds: false,
  },  // Explicitly define environment variables
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
}

module.exports = nextConfig
