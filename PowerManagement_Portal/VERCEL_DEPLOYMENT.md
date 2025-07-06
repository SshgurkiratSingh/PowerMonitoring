# Vercel Deployment Guide

This application has been configured for deployment on Vercel with Prisma. This document outlines the changes made and further steps required.

## Changes Made

1. **Created Prisma Client Singleton** - Created a singleton pattern for Prisma client to avoid connection issues on Vercel's serverless functions.
   - File: `/app/lib/prisma.ts`

2. **Updated Package.json Scripts** - Added necessary scripts:
   - `postinstall`: Runs Prisma generate after package installation
   - Modified `build`: Runs Prisma generate before Next.js build

3. **Added Vercel Configuration** - Created `vercel.json` for configuration settings.

4. **Updated API Routes Example** - Updated `/app/api/devices/route.ts` to use the Prisma singleton.

## Next Steps Required

### Update All API Routes

All API routes that use Prisma need to be updated to use the singleton pattern. For each file that contains:

```typescript
import { PrismaClient } from '@/app/generated/prisma';
const prisma = new PrismaClient();
```

Change to:

```typescript
import prisma from '@/app/lib/prisma';
```

### Environment Variables on Vercel

When deploying to Vercel, make sure to add the following environment variables:

1. `DATABASE_URL` - Your MongoDB connection string
2. `NEXT_PUBLIC_MAPBOX_TOKEN` - Your Mapbox token 
3. Any other environment variables defined in your `.env` file

## Deploying to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

## Local Development

Local development workflow remains unchanged:

```bash
npm install
npm run dev
```

## Troubleshooting

- If you encounter database connection issues, check that your MongoDB instance allows connections from Vercel's IP addresses.
- For connection pool errors, the singleton pattern should prevent them, but if they occur, you may need to adjust Prisma connection settings.
