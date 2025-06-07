#!/bin/bash

# Script to fix Tailwind CSS theme colors issue
# This script addresses the "The `bg-primary-600` class does not exist" error

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Tailwind CSS Theme Colors Fixer ===${NC}"
echo -e "This script will update the tailwind.config.js file to include custom theme colors"

# Function to fix tailwind theme in a directory
fix_tailwind_theme() {
    local dir=$1
    echo -e "\n${YELLOW}Fixing Tailwind CSS theme in ${dir}...${NC}"
    
    if [ ! -d "$dir" ]; then
        echo -e "${RED}Directory ${dir} does not exist!${NC}"
        return 1
    fi
    
    cd "$dir"
    
    # Backup existing config if it exists
    if [ -f "tailwind.config.js" ]; then
        echo -e "${YELLOW}Backing up original tailwind.config.js...${NC}"
        cp tailwind.config.js tailwind.config.js.bak
        
        echo -e "${YELLOW}Updating tailwind.config.js with theme colors...${NC}"
        cat > tailwind.config.js << 'EOL'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        info: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'dropdown': '0 2px 5px 0 rgba(0, 0, 0, 0.1)',
        'button': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'input': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'card': '0.5rem',
        'button': '0.375rem',
        'input': '0.375rem',
      },
      spacing: {
        'card-padding': '1.5rem',
        'section': '4rem',
      },
    },
  },
  plugins: [],
}
EOL
        echo -e "${GREEN}✓ Updated tailwind.config.js with theme colors${NC}"
    else
        echo -e "${RED}tailwind.config.js not found!${NC}"
        echo -e "${YELLOW}Creating tailwind.config.js with theme colors...${NC}"
        cat > tailwind.config.js << 'EOL'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        info: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
      },
    },
  },
  plugins: [],
}
EOL
        echo -e "${GREEN}✓ Created tailwind.config.js with theme colors${NC}"
    fi
    
    # Install correct dependencies
    echo -e "${YELLOW}Installing correct Tailwind CSS dependencies...${NC}"
    npm install -D tailwindcss@^3.3.0 postcss@^8.4.23 autoprefixer@^10.4.14
    
    echo -e "${GREEN}✓ Fixed Tailwind CSS theme in ${dir}${NC}"
    
    # Return to original directory
    cd - > /dev/null
}

# Get the base directory
BASE_DIR=$(pwd)

# Fix frontend
fix_tailwind_theme "${BASE_DIR}/frontend"

# Fix admin-frontend
fix_tailwind_theme "${BASE_DIR}/admin-frontend"

echo -e "\n${BLUE}=== Deployment Instructions ===${NC}"
echo -e "Now try building the frontend again:"
echo -e "${YELLOW}cd frontend${NC}"
echo -e "${YELLOW}./deploy-fixed.sh${NC}"
echo -e "\nAnd then the admin frontend:"
echo -e "${YELLOW}cd ../admin-frontend${NC}"
echo -e "${YELLOW}./deploy-fixed.sh${NC}"

echo -e "\n${BLUE}=== Manual Fix ===${NC}"
echo -e "If the issue persists, you can try examining the CSS file that's causing the error:"
echo -e "1. Look at line 37 in src/index.css to see what custom classes are being used"
echo -e "2. Make sure those classes are defined in your tailwind.config.js"
echo -e "3. You might need to add more custom colors or utilities to your tailwind.config.js"
