#!/bin/bash

# Script to generate a secure JWT secret for Nigerian Bill Payment Application
# This script provides multiple methods to generate secure random strings

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== JWT Secret Generator ===${NC}"
echo -e "This script will generate secure random strings suitable for JWT_SECRET"
echo -e "Choose the method that works best on your system\n"

# Method 1: OpenSSL (most systems have this)
echo -e "${YELLOW}Method 1: Using OpenSSL (recommended)${NC}"
if command -v openssl &> /dev/null; then
    # Generate a 64-byte random string and encode it as base64
    JWT_SECRET_1=$(openssl rand -base64 64 | tr -d '\n')
    echo -e "${GREEN}JWT_SECRET=${JWT_SECRET_1}${NC}"
else
    echo "OpenSSL not found on your system"
fi

echo ""

# Method 2: /dev/urandom (Linux/Mac)
echo -e "${YELLOW}Method 2: Using /dev/urandom${NC}"
if [ -e /dev/urandom ]; then
    # Generate a 64-byte random string from /dev/urandom and encode it as base64
    JWT_SECRET_2=$(cat /dev/urandom | head -c 64 | base64 | tr -d '\n')
    echo -e "${GREEN}JWT_SECRET=${JWT_SECRET_2}${NC}"
else
    echo "/dev/urandom not available on your system"
fi

echo ""

# Method 3: Node.js crypto module
echo -e "${YELLOW}Method 3: Using Node.js crypto module${NC}"
if command -v node &> /dev/null; then
    JWT_SECRET_3=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
    echo -e "${GREEN}JWT_SECRET=${JWT_SECRET_3}${NC}"
else
    echo "Node.js not found on your system"
fi

echo ""

# Method 4: UUID v4 (less secure but simple)
echo -e "${YELLOW}Method 4: Using UUID v4 (simple but less secure)${NC}"
if command -v uuidgen &> /dev/null; then
    JWT_SECRET_4=$(uuidgen)
    echo -e "${GREEN}JWT_SECRET=${JWT_SECRET_4}${NC}"
elif command -v node &> /dev/null; then
    JWT_SECRET_4=$(node -e "console.log(require('crypto').randomUUID())")
    echo -e "${GREEN}JWT_SECRET=${JWT_SECRET_4}${NC}"
else
    echo "Neither uuidgen nor Node.js found on your system"
fi

echo -e "\n${BLUE}=== How to Use ===${NC}"
echo -e "1. Copy one of the generated secrets above"
echo -e "2. Add it to your .env file:"
echo -e "   JWT_SECRET=your_copied_secret"
echo -e "3. Make sure to keep this secret secure and don't share it"

echo -e "\n${BLUE}=== Security Note ===${NC}"
echo -e "The OpenSSL method (Method 1) is recommended for production use."
echo -e "For maximum security, generate this secret directly on your production server,"
echo -e "not on your development machine."
