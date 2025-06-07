#!/bin/bash

# Script to fix Tailwind CSS PostCSS plugin issues in the Nigerian Bill Payment Application
# This script addresses the "@tailwindcss/postcss" module not found error

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Tailwind CSS PostCSS Plugin Fixer ===${NC}"
echo -e "This script will fix the Tailwind CSS PostCSS plugin issue in the frontend and admin-frontend"

# Function to fix tailwind issue in a directory
fix_tailwind_issue() {
    local dir=$1
    echo -e "\n${YELLOW}Fixing Tailwind CSS issue in ${dir}...${NC}"
    
    if [ ! -d "$dir" ]; then
        echo -e "${RED}Directory ${dir} does not exist!${NC}"
        return 1
    fi
    
    cd "$dir"
    
    echo -e "${YELLOW}1. Checking postcss.config.js...${NC}"
    if [ -f "postcss.config.js" ]; then
        echo -e "${YELLOW}Backing up original postcss.config.js...${NC}"
        cp postcss.config.js postcss.config.js.bak
        
        echo -e "${YELLOW}Updating postcss.config.js...${NC}"
        cat > postcss.config.js << 'EOL'
export default {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL
        echo -e "${GREEN}✓ Updated postcss.config.js${NC}"
    else
        echo -e "${RED}postcss.config.js not found!${NC}"
        echo -e "${YELLOW}Creating postcss.config.js...${NC}"
        cat > postcss.config.js << 'EOL'
export default {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL
        echo -e "${GREEN}✓ Created postcss.config.js${NC}"
    fi
    
    echo -e "${YELLOW}2. Installing correct Tailwind CSS dependencies...${NC}"
    npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
    
    echo -e "${YELLOW}3. Checking tailwind.config.js...${NC}"
    if [ -f "tailwind.config.js" ]; then
        echo -e "${YELLOW}Backing up original tailwind.config.js...${NC}"
        cp tailwind.config.js tailwind.config.js.bak
        
        echo -e "${YELLOW}Updating tailwind.config.js...${NC}"
        cat > tailwind.config.js << 'EOL'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL
        echo -e "${GREEN}✓ Updated tailwind.config.js${NC}"
    else
        echo -e "${RED}tailwind.config.js not found!${NC}"
        echo -e "${YELLOW}Creating tailwind.config.js...${NC}"
        cat > tailwind.config.js << 'EOL'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL
        echo -e "${GREEN}✓ Created tailwind.config.js${NC}"
    fi
    
    echo -e "${YELLOW}4. Checking index.css...${NC}"
    if [ -f "src/index.css" ]; then
        echo -e "${YELLOW}Backing up original index.css...${NC}"
        cp src/index.css src/index.css.bak
        
        echo -e "${YELLOW}Checking if index.css contains Tailwind directives...${NC}"
        if ! grep -q "@tailwind" src/index.css; then
            echo -e "${YELLOW}Adding Tailwind directives to index.css...${NC}"
            cat > src/index.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Original CSS content follows */
EOL
            cat src/index.css.bak >> src/index.css
            echo -e "${GREEN}✓ Updated index.css with Tailwind directives${NC}"
        else
            echo -e "${GREEN}✓ index.css already contains Tailwind directives${NC}"
        fi
    else
        echo -e "${RED}src/index.css not found!${NC}"
        echo -e "${YELLOW}Creating src/index.css...${NC}"
        mkdir -p src
        cat > src/index.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL
        echo -e "${GREEN}✓ Created src/index.css${NC}"
    fi
    
    echo -e "${GREEN}✓ Fixed Tailwind CSS issue in ${dir}${NC}"
    
    # Return to original directory
    cd - > /dev/null
}

# Get the base directory
BASE_DIR=$(pwd)

# Fix frontend
fix_tailwind_issue "${BASE_DIR}/frontend"

# Fix admin-frontend
fix_tailwind_issue "${BASE_DIR}/admin-frontend"

echo -e "\n${BLUE}=== Deployment Instructions ===${NC}"
echo -e "Now try building the frontend again:"
echo -e "${YELLOW}cd frontend${NC}"
echo -e "${YELLOW}./deploy-fixed.sh${NC}"
echo -e "\nAnd then the admin frontend:"
echo -e "${YELLOW}cd ../admin-frontend${NC}"
echo -e "${YELLOW}./deploy-fixed.sh${NC}"

echo -e "\n${BLUE}=== Alternative Solution ===${NC}"
echo -e "If the issue persists, you can try manually updating the package.json:"
echo -e "1. Edit package.json in both frontend and admin-frontend directories"
echo -e "2. Make sure the dependencies include:"
echo -e "   \"tailwindcss\": \"^3.3.0\","
echo -e "   \"postcss\": \"^8.4.23\","
echo -e "   \"autoprefixer\": \"^10.4.14\""
echo -e "3. Run npm install and then try building again"
