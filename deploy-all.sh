#!/bin/bash

echo "Starting deployment of Nigerian Bill Payment Application..."

# Pull latest changes if in a git repository
if [ -d ".git" ]; then
  echo "Pulling latest changes from git repository..."
  git pull
else
  echo "Not a git repository. Skipping git pull."
fi

# Deploy backend
echo "Deploying backend..."
cd backend
chmod +x deploy.sh
./deploy.sh
cd ..

# Deploy frontend
echo "Deploying frontend..."
cd frontend
chmod +x deploy.sh
./deploy.sh
cd ..

# Deploy admin frontend
echo "Deploying admin frontend..."
cd admin-frontend
chmod +x deploy.sh
./deploy.sh
cd ..

echo "Deployment completed successfully!"
echo "Note: You may need to restart Nginx with 'sudo systemctl restart nginx' if you've made changes to the Nginx configuration."
