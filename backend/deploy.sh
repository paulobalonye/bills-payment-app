#!/bin/bash

# Stop running server if exists
pm2 stop bills-backend || true

# Install dependencies
npm install --production

# Set environment variables (if not using .env file)
# export PORT=5000
# export MONGODB_URI=your_production_mongodb_uri
# export JWT_SECRET=your_production_jwt_secret
# export PAYSTACK_SECRET_KEY=your_production_paystack_secret
# export PAYSTACK_PUBLIC_KEY=your_production_paystack_public_key
# export PAYSTACK_WEBHOOK_SECRET=your_production_webhook_secret

# Start server with PM2
pm2 start server.js --name bills-backend
pm2 save
