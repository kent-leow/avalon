# 🚀 Avalon Game Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Avalon Game application to production after successful integration testing.

## ✅ Pre-Deployment Checklist

### Integration Test Results
- ✅ All 18 features implemented and tested
- ✅ TypeScript compilation successful (no errors)
- ✅ ESLint validation passed (no issues)
- ✅ Production build completed successfully
- ✅ All demo pages and integrations functional
- ✅ Database schema properly configured
- ✅ API routes fully implemented

## 🏗️ Production Deployment Steps

### 1. Environment Setup

#### Database Configuration
```bash
# Set up production PostgreSQL database
DATABASE_URL="postgresql://username:password@hostname:5432/avalon_prod"

# Run migrations
yarn db:migrate

# Generate Prisma client
yarn db:generate
```

#### Environment Variables
Create production `.env` file:
```env
# Database
DATABASE_URL=postgresql://username:password@hostname:5432/avalon_prod

# Next.js
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key

# Optional: Analytics
ANALYTICS_ID=your-analytics-id
```

### 2. Vercel Deployment (Recommended)

#### Install Vercel CLI
```bash
npm i -g vercel
```

#### Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy (first time)
vercel --prod

# Set environment variables in Vercel dashboard
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
```

#### Configure Vercel Settings
- **Framework**: Next.js
- **Build Command**: `yarn build`
- **Install Command**: `yarn install`
- **Output Directory**: `.next`

### 3. Alternative: Docker Deployment

#### Create Dockerfile
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build application
COPY . .
RUN yarn build

# Production image
FROM node:18-alpine AS production
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./package.json

EXPOSE 3000
CMD ["yarn", "start"]
```

#### Build and Deploy
```bash
# Build Docker image
docker build -t avalon-game .

# Run container
docker run -p 3000:3000 -e DATABASE_URL=your-db-url avalon-game
```

### 4. Alternative: VPS/Server Deployment

#### Server Setup
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Yarn
npm install -g yarn
```

#### Deploy Application
```bash
# Clone repository
git clone https://github.com/your-username/avalon.git
cd avalon

# Install dependencies
yarn install

# Build application
yarn build

# Start with PM2
pm2 start yarn --name "avalon-game" -- start
pm2 save
pm2 startup
```

## 🔧 Post-Deployment Configuration

### 1. Database Setup
```bash
# Run database migrations
yarn db:migrate

# Seed initial data (if needed)
yarn db:seed
```

### 2. SSL Certificate Setup
```bash
# Using Let's Encrypt with certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Nginx Configuration
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring and Logging

### 1. Application Monitoring
```bash
# Install monitoring tools
npm install -g @vercel/analytics
npm install -g sentry-cli
```

### 2. Database Monitoring
```bash
# Monitor database performance
yarn db:studio

# Set up database backups
pg_dump avalon_prod > backup-$(date +%Y%m%d).sql
```

### 3. Performance Monitoring
```javascript
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

## 🔐 Security Configuration

### 1. Security Headers
```javascript
// next.config.js
const nextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
      ],
    },
  ],
};
```

### 2. Rate Limiting
```javascript
// middleware.ts
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10s'),
});

export async function middleware(request) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  return NextResponse.next();
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
          
      - name: Install dependencies
        run: yarn install --frozen-lockfile
        
      - name: Run tests
        run: yarn test
        
      - name: Run type check
        run: yarn typecheck
        
      - name: Run lint
        run: yarn lint
        
      - name: Build application
        run: yarn build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🧪 Health Checks

### 1. API Health Check
```javascript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check database connection
    await db.room.findFirst();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
}
```

### 2. Monitoring Script
```bash
#!/bin/bash
# health-check.sh

while true; do
  response=$(curl -s -o /dev/null -w "%{http_code}" https://your-domain.com/api/health)
  
  if [ $response -eq 200 ]; then
    echo "$(date): Health check passed"
  else
    echo "$(date): Health check failed with status $response"
    # Send alert notification
  fi
  
  sleep 60
done
```

## 🚀 Go-Live Checklist

### Pre-Launch
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Monitoring tools set up
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Health checks working

### Launch
- [ ] Application deployed to production
- [ ] All features tested in production
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] Backup systems in place
- [ ] Support documentation ready

### Post-Launch
- [ ] Monitor application performance
- [ ] Review error logs
- [ ] Validate user flows
- [ ] Monitor database performance
- [ ] Set up regular backups
- [ ] Plan scaling strategy

## 📞 Support and Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Review error logs and performance metrics
2. **Monthly**: Update dependencies and security patches
3. **Quarterly**: Review and optimize database performance
4. **Annually**: Security audit and penetration testing

### Emergency Response
1. **Incident Response Plan**: Document steps for critical issues
2. **Rollback Procedures**: Quick rollback to previous version
3. **Communication Plan**: User notification system
4. **Escalation Process**: Team contact information

## 🎉 Conclusion

The Avalon Game application is now ready for production deployment. All systems have been tested and validated, and the application follows industry best practices for security, performance, and maintainability.

**Status: ✅ READY FOR PRODUCTION**

---

*Deployment guide created on July 16, 2025*
*All systems validated and ready for production*
