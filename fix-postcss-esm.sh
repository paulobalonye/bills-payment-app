#!/bin/bash

# Script to fix PostCSS configuration issues with ES modules
# This script addresses the "module is not defined in ES module scope" error

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PostCSS ES Module Fixer ===${NC}"
echo -e "This script will fix the PostCSS configuration for projects using ES modules"

# Function to fix postcss config in a directory
fix_postcss_esm() {
    local dir=$1
    echo -e "\n${YELLOW}Fixing PostCSS config in ${dir}...${NC}"
    
    if [ ! -d "$dir" ]; then
        echo -e "${RED}Directory ${dir} does not exist!${NC}"
        return 1
    fi
    
    cd "$dir"
    
    # Check if package.json has type: module
    echo -e "${YELLOW}Checking package.json...${NC}"
    if [ -f "package.json" ]; then
        if grep -q '"type": "module"' package.json; then
            echo -e "${YELLOW}Project is using ES modules.${NC}"
            
            # Backup existing config if it exists
            if [ -f "postcss.config.js" ]; then
                echo -e "${YELLOW}Backing up original postcss.config.js...${NC}"
                cp postcss.config.js postcss.config.js.bak
                
                echo -e "${YELLOW}Creating ES module compatible postcss.config.js...${NC}"
                cat > postcss.config.js << 'EOL'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
EOL
                echo -e "${GREEN}✓ Created ES module compatible postcss.config.js${NC}"
            else
                echo -e "${YELLOW}Creating new postcss.config.js...${NC}"
                cat > postcss.config.js << 'EOL'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
EOL
                echo -e "${GREEN}✓ Created ES module compatible postcss.config.js${NC}"
            }
            
            # Install correct dependencies
            echo -e "${YELLOW}Installing correct Tailwind CSS dependencies...${NC}"
            npm install -D tailwindcss@^3.3.0 postcss@^8.4.23 autoprefixer@^10.4.14
            
            echo -e "${GREEN}✓ Fixed PostCSS config for ES modules in ${dir}${NC}"
        else
            echo -e "${YELLOW}Project is using CommonJS modules.${NC}"
            
            # Backup existing config if it exists
            if [ -f "postcss.config.js" ]; then
                echo -e "${YELLOW}Backing up original postcss.config.js...${NC}"
                cp postcss.config.js postcss.config.js.bak
                
                echo -e "${YELLOW}Creating CommonJS compatible postcss.config.js...${NC}"
                cat > postcss.config.js << 'EOL'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
EOL
                echo -e "${GREEN}✓ Created CommonJS compatible postcss.config.js${NC}"
            else
                echo -e "${YELLOW}Creating new postcss.config.js...${NC}"
                cat > postcss.config.js << 'EOL'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
EOL
                echo -e "${GREEN}✓ Created CommonJS compatible postcss.config.js${NC}"
            }
            
            # Install correct dependencies
            echo -e "${YELLOW}Installing correct Tailwind CSS dependencies...${NC}"
            npm install -D tailwindcss@^3.3.0 postcss@^8.4.23 autoprefixer@^10.4.14
            
            echo -e "${GREEN}✓ Fixed PostCSS config for CommonJS in ${dir}${NC}"
        fi
    else
        echo -e "${RED}package.json not found!${NC}"
        echo -e "${YELLOW}Creating ES module compatible postcss.config.js (default)...${NC}"
        cat > postcss.config.js << 'EOL'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
EOL
        echo -e "${GREEN}✓ Created ES module compatible postcss.config.js${NC}"
        
        # Install correct dependencies
        echo -e "${YELLOW}Installing correct Tailwind CSS dependencies...${NC}"
        npm install -D tailwindcss@^3.3.0 postcss@^8.4.23 autoprefixer@^10.4.14
        
        echo -e "${GREEN}✓ Fixed PostCSS config in ${dir}${NC}"
    fi
    
    # Return to original directory
    cd - > /dev/null
}

# Get the base directory
BASE_DIR=$(pwd)

# Fix frontend
fix_postcss_esm "${BASE_DIR}/frontend"

# Fix admin-frontend
fix_postcss_esm "${BASE_DIR}/admin-frontend"

echo -e "\n${BLUE}=== Alternative Solutions ===${NC}"
echo -e "If the issue persists, you can try one of these approaches:"

echo -e "\n${YELLOW}1. Rename postcss.config.js to postcss.config.cjs${NC}"
echo -e "This tells Node.js to treat the file as CommonJS regardless of package.json settings:"
echo -e "   ${GREEN}cd frontend${NC}"
echo -e "   ${GREEN}mv postcss.config.js postcss.config.cjs${NC}"

echo -e "\n${YELLOW}2. Remove type: module from package.json${NC}"
echo -e "If your project doesn't strictly need ES modules:"
echo -e "   ${GREEN}cd frontend${NC}"
echo -e "   ${GREEN}sed -i 's/\"type\": \"module\",//g' package.json${NC}"

echo -e "\n${YELLOW}3. Create a minimal Vite config${NC}"
echo -e "Create a vite.config.js file that explicitly configures PostCSS:"
echo -e "   ${GREEN}cd frontend${NC}"
echo -e "   ${GREEN}cat > vite.config.js << 'EOL'${NC}"
echo -e "   ${GREEN}import { defineConfig } from 'vite';${NC}"
echo -e "   ${GREEN}export default defineConfig({${NC}"
echo -e "   ${GREEN}  css: {${NC}"
echo -e "   ${GREEN}    postcss: {${NC}"
echo -e "   ${GREEN}      plugins: [${NC}"
echo -e "   ${GREEN}        require('tailwindcss'),${NC}"
echo -e "   ${GREEN}        require('autoprefixer'),${NC}"
echo -e "   ${GREEN}      ],${NC}"
echo -e "   ${GREEN}    },${NC}"
echo -e "   ${GREEN}  },${NC}"
echo -e "   ${GREEN}});${NC}"
echo -e "   ${GREEN}EOL${NC}"

echo -e "\n${BLUE}=== Deployment Instructions ===${NC}"
echo -e "Now try building the frontend again:"
echo -e "${YELLOW}cd frontend${NC}"
echo -e "${YELLOW}./deploy-fixed.sh${NC}"
