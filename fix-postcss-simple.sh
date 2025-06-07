#!/bin/bash

# Simple script to fix PostCSS configuration issues by using a minimal configuration
# This script addresses the Tailwind CSS nesting plugin issues

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Simple PostCSS Config Fixer ===${NC}"
echo -e "This script will apply a minimal PostCSS configuration to fix build issues"

# Function to apply simple PostCSS config to a directory
apply_simple_postcss_config() {
    local dir=$1
    echo -e "\n${YELLOW}Applying simple PostCSS config to ${dir}...${NC}"
    
    if [ ! -d "$dir" ]; then
        echo -e "${RED}Directory ${dir} does not exist!${NC}"
        return 1
    fi
    
    cd "$dir"
    
    # Backup existing config if it exists
    if [ -f "postcss.config.js" ]; then
        echo -e "${YELLOW}Backing up original postcss.config.js...${NC}"
        cp postcss.config.js postcss.config.js.bak
    fi
    
    # Copy the simple config
    if [ -f "postcss.config.simple.js" ]; then
        echo -e "${YELLOW}Copying simple PostCSS config...${NC}"
        cp postcss.config.simple.js postcss.config.js
        echo -e "${GREEN}✓ Applied simple PostCSS config${NC}"
    else
        echo -e "${YELLOW}Creating simple PostCSS config...${NC}"
        cat > postcss.config.js << 'EOL'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL
        echo -e "${GREEN}✓ Created simple PostCSS config${NC}"
    fi
    
    # Install correct dependencies
    echo -e "${YELLOW}Installing correct Tailwind CSS dependencies...${NC}"
    npm install -D tailwindcss@^3.3.0 postcss@^8.4.23 autoprefixer@^10.4.14
    
    echo -e "${GREEN}✓ Applied simple PostCSS config to ${dir}${NC}"
    
    # Return to original directory
    cd - > /dev/null
}

# Get the base directory
BASE_DIR=$(pwd)

# Apply to frontend
apply_simple_postcss_config "${BASE_DIR}/frontend"

# Apply to admin-frontend
apply_simple_postcss_config "${BASE_DIR}/admin-frontend"

echo -e "\n${BLUE}=== Deployment Instructions ===${NC}"
echo -e "Now try building the frontend again:"
echo -e "${YELLOW}cd frontend${NC}"
echo -e "${YELLOW}./deploy-fixed.sh${NC}"
echo -e "\nAnd then the admin frontend:"
echo -e "${YELLOW}cd ../admin-frontend${NC}"
echo -e "${YELLOW}./deploy-fixed.sh${NC}"

echo -e "\n${BLUE}=== Manual Fix ===${NC}"
echo -e "If the issue persists, you can try manually updating the postcss.config.js:"
echo -e "1. Edit postcss.config.js in both frontend and admin-frontend directories"
echo -e "2. Make sure it contains only:"
echo -e "   ${GREEN}module.exports = {${NC}"
echo -e "   ${GREEN}  plugins: {${NC}"
echo -e "   ${GREEN}    tailwindcss: {},${NC}"
echo -e "   ${GREEN}    autoprefixer: {},${NC}"
echo -e "   ${GREEN}  },${NC}"
echo -e "   ${GREEN}}${NC}"
echo -e "3. Run npm install -D tailwindcss@^3.3.0 postcss@^8.4.23 autoprefixer@^10.4.14"
echo -e "4. Try building again"
