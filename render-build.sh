#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push --accept-data-loss

# Run database seed
npx prisma db seed

# Build Next.js app
npm run build
