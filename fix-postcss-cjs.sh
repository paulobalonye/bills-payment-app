#!/bin/bash

# Script to fix PostCSS configuration issues by using .cjs extension
# This script addresses the "module is not defined in ES module scope" error

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PostCSS CJS Fixer ===${NC}"
echo -e "This script will rename postcss.config.js to postcss.config.cjs to fix ES module issues"

# Function to fix postcss config in a directory
fix_postcss_cjs() {
    local dir=$1
    echo -e "\n${YELLOW}Fixing PostCSS config in ${dir}...${NC}"
    
    if [ ! -d "$dir" ]; then
        echo -e "${RED}Directory ${dir} does not exist!${NC}"
        return 1
    fi
    
    cd "$dir"
    
    # Backup and remove existing JS config if it exists
    if [ -f "postcss.config.js" ]; then
        echo -e "${YELLOW}Backing up original postcss.config.js...${NC}"
        cp postcss.config.js postcss.config.js.bak
        
        echo -e "${YELLOW}Removing postcss.config.js...${NC}"
        rm postcss.config.js
        echo -e "${GREEN}✓ Removed postcss.config.js${NC}"
    fi
    
    # Check if CJS config already exists
    if [ ! -f "postcss.config.cjs" ]; then
        echo -e "${YELLOW}Creating postcss.config.cjs...${NC}"
        cat > postcss.config.cjs << 'EOL'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
EOL
        echo -e "${GREEN}✓ Created postcss.config.cjs${NC}"
    else
        echo -e "${GREEN}✓ postcss.config.cjs already exists${NC}"
    fi
    
    # Install correct dependencies
    echo -e "${YELLOW}Installing correct Tailwind CSS dependencies...${NC}"
    npm install -D tailwindcss@^3.3.0 postcss@^8.4.23 autoprefixer@^10.4.14
    
    echo -e "${GREEN}✓ Fixed PostCSS config in ${dir}${NC}"
    
    # Return to original directory
    cd - > /dev/null
}

# Get the base directory
BASE_DIR=$(pwd)

# Fix frontend
fix_postcss_cjs "${BASE_DIR}/frontend"

# Fix admin-frontend
fix_postcss_cjs "${BASE_DIR}/admin-frontend"

echo -e "\n${BLUE}=== Deployment Instructions ===${NC}"
echo -e "Now try building the frontend again:"
echo -e "${YELLOW}cd frontend${NC}"
echo -e "${YELLOW}./deploy-fixed.sh${NC}"
echo -e "\nAnd then the admin frontend:"
echo -e "${YELLOW}cd ../admin-frontend${NC}"
echo -e "${YELLOW}./deploy-fixed.sh${NC}"

echo -e "\n${BLUE}=== Manual Fix ===${NC}"
echo -e "If the issue persists, you can try manually updating the vite.config.js file:"
echo -e "1. Edit vite.config.js in both frontend and admin-frontend directories"
echo -e "2. Add PostCSS configuration directly to the Vite config:"
echo -e "   ${GREEN}import { defineConfig } from 'vite';${NC}"
echo -e "   ${GREEN}import tailwindcss from 'tailwindcss';${NC}"
echo -e "   ${GREEN}import autoprefixer from 'autoprefixer';${NC}"
echo -e "   ${GREEN}${NC}"
echo -e "   ${GREEN}export default defineConfig({${NC}"
echo -e "   ${GREEN}  css: {${NC}"
echo -e "   ${GREEN}    postcss: {${NC}"
echo -e "   ${GREEN}      plugins: [${NC}"
echo -e "   ${GREEN}        tailwindcss,${NC}"
echo -e "   ${GREEN}        autoprefixer,${NC}"
echo -e "   ${GREEN}      ],${NC}"
echo -e "   ${GREEN}    },${NC}"
echo -e "   ${GREEN}  },${NC}"
echo -e "   ${GREEN}});${NC}"
