#!/bin/bash

# Enhanced deployment script for the admin frontend
# This script includes fixes for common build issues

echo "Starting admin frontend deployment..."

# Check if we're in the admin-frontend directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Make sure you're in the admin-frontend directory."
    exit 1
fi

# Step 1: Clean up previous build artifacts
echo "Cleaning up previous build..."
rm -rf dist

# Step 2: Check for and fix common build issues
echo "Checking for potential build issues..."

# Check if node_modules exists and has the right dependencies
if [ ! -d "node_modules" ] || [ ! -d "node_modules/rollup" ]; then
    echo "Installing dependencies..."
    rm -rf node_modules package-lock.json
    npm install
fi

# Check for platform-specific Rollup binaries
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    if [ ! -d "node_modules/@rollup/rollup-darwin-x64" ]; then
        echo "Installing macOS-specific Rollup binaries..."
        npm install --no-save @rollup/rollup-darwin-x64
    fi
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Linux
    if [ ! -d "node_modules/@rollup/rollup-linux-x64-gnu" ]; then
        echo "Installing Linux-specific Rollup binaries..."
        npm install --no-save @rollup/rollup-linux-x64-gnu
        npm install --no-save @rollup/rollup-linux-x64-musl
    fi
fi

# Step 3: Build the admin frontend
echo "Building admin frontend..."
# Try with standard build first
if npm run build; then
    echo "Build successful!"
else
    echo "Standard build failed, trying with legacy OpenSSL provider..."
    # Try with legacy OpenSSL provider
    NODE_OPTIONS=--openssl-legacy-provider npm run build
fi

# Step 4: Check if build was successful
if [ -d "dist" ]; then
    echo "Admin frontend built successfully!"
    
    # Step 5: Copy to deployment directory
    echo "Copying to deployment directory..."
    mkdir -p /var/www/bills-app/admin-frontend/dist
    cp -r dist/* /var/www/bills-app/admin-frontend/dist/
    
    # Step 6: Set proper permissions
    echo "Setting permissions..."
    chmod -R 755 /var/www/bills-app/admin-frontend/dist
    
    echo "Admin frontend deployment completed successfully!"
else
    echo "Build failed. Check the error messages above."
    exit 1
fi
