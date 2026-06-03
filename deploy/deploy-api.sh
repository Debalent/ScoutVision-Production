#!/bin/bash
# deploy-api.sh — builds and zips the API for Elastic Beanstalk upload
# Run from repo root: bash deploy/deploy-api.sh

set -e

echo "Building API..."
cd apps/api
npm ci
npm run build

echo "Creating deployment zip..."
cd ../..
zip -r eb-deploy.zip \
  apps/api/dist \
  apps/api/node_modules \
  apps/api/package.json \
  apps/api/Procfile \
  apps/api/.ebextensions \
  prisma/schema.prisma \
  --exclude "*.ts" "*.map"

echo "Done — upload eb-deploy.zip to Elastic Beanstalk console"
echo "Or use: eb deploy (if EB CLI is installed)"
