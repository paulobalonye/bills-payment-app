#!/bin/bash

# Script to fix Rollup build issues in the Nigerian Bill Payment Application
# This script addresses the "@rollup/rollup-linux-x64-gnu" module not found error

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Rollup Build Issue Fixer ===${NC}"
echo -e "This script will fix the Rollup build issue in the frontend and admin-frontend"

# Function to fix rollup issue in a directory
fix_rollup_issue() {
    local dir=$1
    echo -e "\n${YELLOW}Fixing Rollup issue in ${dir}...${NC}"
    
    if [ ! -d "$dir" ]; then
        echo -e "${RED}Directory ${dir} does not exist!${NC}"
        return 1
    fi
    
    cd "$dir"
    
    echo -e "${YELLOW}1. Removing node_modules and package-lock.json...${NC}"
    rm -rf node_modules package-lock.json
    
    echo -e "${YELLOW}2. Installing dependencies with npm...${NC}"
    npm install
    
    echo -e "${YELLOW}3. Installing specific Rollup binaries...${NC}"
    # Determine the platform
    if [ "$(uname)" == "Darwin" ]; then
        # macOS
        npm install --no-save @rollup/rollup-darwin-x64
    elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
        # Linux
        npm install --no-save @rollup/rollup-linux-x64-gnu
        npm install --no-save @rollup/rollup-linux-x64-musl
    fi
    
    echo -e "${GREEN}✓ Fixed Rollup issue in ${dir}${NC}"
    
    # Return to original directory
    cd - > /dev/null
}

# Get the base directory
BASE_DIR=$(pwd)

# Fix frontend
fix_rollup_issue "${BASE_DIR}/frontend"

# Fix admin-frontend
fix_rollup_issue "${BASE_DIR}/admin-frontend"

echo -e "\n${BLUE}=== Deployment Instructions ===${NC}"
echo -e "Now try building the frontend again:"
echo -e "${YELLOW}cd frontend${NC}"
echo -e "${YELLOW}./deploy.sh${NC}"
echo -e "\nAnd then the admin frontend:"
echo -e "${YELLOW}cd ../admin-frontend${NC}"
echo -e "${YELLOW}./deploy.sh${NC}"

echo -e "\n${BLUE}=== Alternative Solution ===${NC}"
echo -e "If the issue persists, you can try modifying the build scripts to use a different bundler:"
echo -e "1. Edit package.json in both frontend and admin-frontend directories"
echo -e "2. Change the build script from 'vite build' to 'NODE_OPTIONS=--openssl-legacy-provider vite build'"
echo -e "   This can help with certain Node.js compatibility issues"

echo -e "\n${BLUE}=== Server-Specific Note ===${NC}"
echo -e "This error often occurs due to platform-specific binary dependencies."
echo -e "Make sure you're running Node.js v18.x as specified in the deployment guide."
echo -e "Current Node.js version: $(node -v)"
