#!/bin/bash

# Script to fix Tailwind CSS nesting plugin issues in the Nigerian Bill Payment Application
# This script addresses the "Package subpath './nesting' is not defined by exports" error

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Tailwind CSS Nesting Plugin Fixer ===${NC}"
echo -e "This script will fix the Tailwind CSS nesting plugin issue in the frontend and admin-frontend"

# Function to fix tailwind nesting issue in a directory
fix_tailwind_nesting_issue() {
    local dir=$1
    echo -e "\n${YELLOW}Fixing Tailwind CSS nesting issue in ${dir}...${NC}"
    
    if [ ! -d "$dir" ]; then
        echo -e "${RED}Directory ${dir} does not exist!${NC}"
        return 1
    fi
    
    cd "$dir"
    
    echo -e "${YELLOW}1. Checking postcss.config.js...${NC}"
    if [ -f "postcss.config.js" ]; then
        echo -e "${YELLOW}Backing up original postcss.config.js...${NC}"
        cp postcss.config.js postcss.config.js.bak
        
        echo -e "${YELLOW}Updating postcss.config.js to remove nesting plugin...${NC}"
        cat > postcss.config.js << 'EOL'
export default {
  plugins: {
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
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL
        echo -e "${GREEN}✓ Created postcss.config.js${NC}"
    fi
    
    echo -e "${YELLOW}2. Installing correct Tailwind CSS dependencies...${NC}"
    npm install -D tailwindcss@^3.3.0 postcss@^8.4.23 autoprefixer@^10.4.14
    
    # Install postcss-nesting separately if needed
    echo -e "${YELLOW}3. Installing postcss-nesting separately...${NC}"
    npm install -D postcss-nesting
    
    echo -e "${YELLOW}4. Updating postcss.config.js to use postcss-nesting...${NC}"
    cat > postcss.config.js << 'EOL'
export default {
  plugins: {
    'postcss-nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL
    echo -e "${GREEN}✓ Updated postcss.config.js to use postcss-nesting${NC}"
    
    echo -e "${YELLOW}5. Checking tailwind.config.js...${NC}"
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
    
    echo -e "${GREEN}✓ Fixed Tailwind CSS nesting issue in ${dir}${NC}"
    
    # Return to original directory
    cd - > /dev/null
}

# Get the base directory
BASE_DIR=$(pwd)

# Fix frontend
fix_tailwind_nesting_issue "${BASE_DIR}/frontend"

# Fix admin-frontend
fix_tailwind_nesting_issue "${BASE_DIR}/admin-frontend"

echo -e "\n${BLUE}=== Deployment Instructions ===${NC}"
echo -e "Now try building the frontend again:"
echo -e "${YELLOW}cd frontend${NC}"
echo -e "${YELLOW}./deploy-fixed.sh${NC}"
echo -e "\nAnd then the admin frontend:"
echo -e "${YELLOW}cd ../admin-frontend${NC}"
echo -e "${YELLOW}./deploy-fixed.sh${NC}"

echo -e "\n${BLUE}=== Alternative Solution ===${NC}"
echo -e "If the issue persists, you can try a simpler postcss.config.js:"
echo -e "1. Edit postcss.config.js in both frontend and admin-frontend directories"
echo -e "2. Replace the content with:"
echo -e "   ${GREEN}module.exports = {${NC}"
echo -e "   ${GREEN}  plugins: {${NC}"
echo -e "   ${GREEN}    tailwindcss: {},${NC}"
echo -e "   ${GREEN}    autoprefixer: {},${NC}"
echo -e "   ${GREEN}  },${NC}"
echo -e "   ${GREEN}}${NC}"
echo -e "3. Run npm install and then try building again"
