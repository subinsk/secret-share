import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: { status: string; responseTime?: number; error?: string };
    application: { status: string; uptime: number };
  };
}

export async function GET() {
  const startTime = Date.now();
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: { status: 'unknown' },
      application: { status: 'healthy', uptime: process.uptime() },
    },
  };

  // Check database connection
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbTime = Date.now() - dbStart;
    healthCheck.services.database = {
      status: 'healthy',
      responseTime: dbTime,
    };
  } catch (error) {
    healthCheck.services.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
    healthCheck.status = 'unhealthy';
  }

  const responseTime = Date.now() - startTime;
  const statusCode = healthCheck.status === 'unhealthy' ? 503 : 200;

  return NextResponse.json(healthCheck, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Response-Time': responseTime.toString(),
    },
  });
}
