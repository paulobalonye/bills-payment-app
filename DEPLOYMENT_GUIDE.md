# Deploying Nigerian Bill Payment Application to DigitalOcean

This guide provides step-by-step instructions for deploying the Nigerian Bill Payment application (including backend, frontend, and admin dashboard) to DigitalOcean.

## Prerequisites

1. A DigitalOcean account
2. A domain name (for SSL setup)
3. Basic knowledge of Linux commands
4. MongoDB Atlas account (or another MongoDB provider)

## Step 1: Create a DigitalOcean Droplet

1. Log in to your DigitalOcean account
2. Click "Create" and select "Droplets"
3. Choose the following options:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic (Shared CPU)
   - **Size**: Standard ($24/mo with 4GB RAM, 2 CPUs, 80GB SSD) - recommended for production
   - **Datacenter Region**: Choose the region closest to your users (e.g., Lagos or Johannesburg for Nigerian users)
   - **Authentication**: SSH keys (recommended) or Password
   - **Hostname**: bills-payment-app (or your preferred name)
4. Click "Create Droplet"

## Step 2: Set Up Your Domain

1. Go to your domain registrar and point your domain to DigitalOcean nameservers:
   - ns1.digitalocean.com
   - ns2.digitalocean.com
   - ns3.digitalocean.com

2. In DigitalOcean, go to "Networking" > "Domains"
3. Add your domain and create the following records:
   - A record: @ pointing to your Droplet's IP
   - A record: www pointing to your Droplet's IP
   - A record: admin pointing to your Droplet's IP (for admin dashboard)

## Step 3: Initial Server Setup

SSH into your Droplet:

```bash
ssh root@your_droplet_ip
```

Update the system and install required packages:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Install Git
apt install -y git
```

## Step 4: Set Up DNS and SSL Certificate

### DNS Configuration

Before obtaining SSL certificates, ensure your DNS is properly configured:

1. **Verify DNS Records**:
   ```bash
   # Make the DNS checker script executable
   chmod +x check-dns.sh
   
   # Run the DNS checker
   ./check-dns.sh
   ```

2. **Troubleshoot DNS Issues**:
   If you encounter DNS issues, refer to the `DNS_SSL_TROUBLESHOOTING.md` guide.

3. **Temporary Deployment Without SSL**:
   If DNS propagation is still in progress, you can temporarily deploy without SSL:
   ```bash
   cp nginx-without-ssl.conf /etc/nginx/sites-available/bills-app
   ln -s /etc/nginx/sites-available/bills-app /etc/nginx/sites-enabled/
   rm /etc/nginx/sites-enabled/default  # Remove default site if it exists
   nginx -t  # Test configuration
   systemctl restart nginx
   ```

### SSL Certificate Setup

Once DNS is properly configured:

```bash
# Obtain SSL certificate
certbot --nginx -d 9japayments.online -d www.9japayments.online -d admin.9japayments.online
```

If you encounter issues with the DNS challenge, try the HTTP challenge:

```bash
certbot --nginx --preferred-challenges http -d 9japayments.online -d www.9japayments.online -d admin.9japayments.online
```

Follow the prompts to complete the SSL setup.

## Step 5: Clone the Repository

```bash
# Create directory for the application
mkdir -p /var/www/bills-app
cd /var/www/bills-app

# Clone your repository
git clone https://github.com/yourusername/bills-payment-app.git .
```

## Step 6: Set Up Environment Variables

Create a .env file for the backend:

```bash
cd /var/www/bills-app/backend
cp .env.example .env
nano .env
```

Update the environment variables with your production values:

```
PORT=5000
MONGODB_URI=mongodb+srv://paulobalonye:9ZcodPi50qgnQO88@cluster0.1azpml0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=DUidsuAJ005RIrjR+uMDKrutzsGlcIpuzSbp1d1mj+F3zr4u4+QlnoYJP9DXYxe1PkhGqazpFjcy6flGMHI2bA==
PAYSTACK_SECRET_KEY=sk_live_cb40ef316c1a5ffc3f177fd2f3a9dd16708fe187
PAYSTACK_PUBLIC_KEY=pk_live_1288d51bf8d0820c51d2dc2ca84fab8ae4d12340
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret
```

### Generating a Secure JWT Secret

For security, you should use a strong random string as your JWT secret. We've provided two scripts to help you generate one:

**Using Bash (works on Linux/Mac/WSL):**
```bash
# Make the script executable
chmod +x generate-jwt-secret.sh

# Run the script
./generate-jwt-secret.sh
```

**Using Node.js:**
```bash
# Run the Node.js script
node generate-jwt-secret.js
```

Choose one of the generated secrets and add it to your `.env` file. For maximum security, generate this secret directly on your production server, not on your development machine.

## Step 7: Deploy the Backend

```bash
cd /var/www/bills-app/backend

# Install dependencies
npm install --production

# Make deploy script executable
chmod +x deploy.sh

# Run deploy script
./deploy.sh
```

Verify that the backend is running:

```bash
pm2 status
```

## Step 8: Deploy the Frontend

Update the API base URL in the frontend:

```bash
cd /var/www/bills-app/frontend
nano src/services/api.js
```

Make sure the API base URL is set to `/api` (Nginx will handle the proxy).

Build the frontend:

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deploy script
./deploy.sh
```

## Step 9: Deploy the Admin Frontend

Update the API base URL in the admin frontend:

```bash
cd /var/www/bills-app/admin-frontend
nano src/services/api.js
```

Make sure the API base URL is set to `/api` (Nginx will handle the proxy).

Build the admin frontend:

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deploy script
./deploy.sh
```

## Step 10: Configure Nginx

Create a new Nginx configuration file:

```bash
nano /etc/nginx/sites-available/bills-app
```

Copy the content from the nginx.conf file in your repository.

Enable the site:

```bash
ln -s /etc/nginx/sites-available/bills-app /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remove default site
nginx -t  # Test configuration
systemctl restart nginx
```

## Step 11: Set Up Continuous Deployment (Optional)

For automatic deployments, you can set up a simple deployment script that pulls from your repository and rebuilds the application:

```bash
cd /var/www/bills-app
nano deploy-all.sh
```

Add the following content:

```bash
#!/bin/bash

# Pull latest changes
git pull

# Deploy backend
cd /var/www/bills-app/backend
./deploy.sh

# Deploy frontend
cd /var/www/bills-app/frontend
./deploy.sh

# Deploy admin frontend
cd /var/www/bills-app/admin-frontend
./deploy.sh

# Restart Nginx
systemctl restart nginx

echo "Deployment completed successfully!"
```

Make the script executable:

```bash
chmod +x deploy-all.sh
```

## Step 12: Set Up MongoDB Backup (Recommended)

Set up a cron job to backup your MongoDB database regularly:

```bash
apt install -y mongodb-clients
mkdir -p /var/backups/mongodb

# Create backup script
nano /usr/local/bin/backup-mongodb.sh
```

Add the following content:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/mongodb"
MONGODB_URI="your_mongodb_connection_string"
DB_NAME="your_database_name"

# Create backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$TIMESTAMP"

# Keep only the last 7 backups
ls -dt "$BACKUP_DIR"/* | tail -n +8 | xargs rm -rf
```

Make the script executable:

```bash
chmod +x /usr/local/bin/backup-mongodb.sh
```

Set up a daily cron job:

```bash
crontab -e
```

Add the following line:

```
0 0 * * * /usr/local/bin/backup-mongodb.sh
```

## Step 13: Set Up Monitoring (Recommended)

Install and configure monitoring tools:

```bash
# Install monitoring tools
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Set up PM2 monitoring
pm2 monitor
```

## Step 14: Security Hardening (Recommended)

Enhance server security:

```bash
# Set up firewall
ufw allow ssh
ufw allow http
ufw allow https
ufw enable

# Install fail2ban to prevent brute force attacks
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## Troubleshooting

### DNS and SSL Issues

For DNS and SSL certificate issues, we've provided dedicated resources:

- **DNS Checker Script**: Run `./check-dns.sh` to diagnose DNS configuration issues
- **Troubleshooting Guide**: Refer to `DNS_SSL_TROUBLESHOOTING.md` for detailed solutions
- **Temporary Nginx Config**: Use `nginx-without-ssl.conf` if you need to deploy before DNS propagation is complete

Common SSL commands:
- Renew certificates: `certbot renew`
- Test Nginx configuration: `nginx -t`
- Force HTTP challenge: `certbot --nginx --preferred-challenges http -d yourdomain.com`

### Frontend Build Issues

#### Rollup Build Errors

If you encounter Rollup build errors like:
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

We've provided several solutions:

1. **Use the fix-rollup-build.sh script**:
   ```bash
   chmod +x fix-rollup-build.sh
   ./fix-rollup-build.sh
   ```
   This script removes node_modules, reinstalls dependencies, and adds platform-specific Rollup binaries.

2. **Use the enhanced deployment scripts**:
   ```bash
   # For frontend
   cd frontend
   chmod +x deploy-fixed.sh
   ./deploy-fixed.sh
   
   # For admin frontend
   cd admin-frontend
   chmod +x deploy-fixed.sh
   ./deploy-fixed.sh
   ```
   These scripts include built-in fixes for common build issues.

3. **Manual fix**:
   ```bash
   cd frontend  # or admin-frontend
   rm -rf node_modules package-lock.json
   npm install
   npm install --no-save @rollup/rollup-linux-x64-gnu @rollup/rollup-linux-x64-musl
   npm run build
   ```

4. **Use legacy OpenSSL provider**:
   ```bash
   cd frontend  # or admin-frontend
   NODE_OPTIONS=--openssl-legacy-provider npm run build
   ```

#### Tailwind CSS PostCSS Plugin Issues

If you encounter Tailwind CSS PostCSS plugin errors like:
```
[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package...
```

We've provided a solution:

1. **Use the fix-tailwind-postcss.sh script**:
   ```bash
   chmod +x fix-tailwind-postcss.sh
   ./fix-tailwind-postcss.sh
   ```
   This script:
   - Updates postcss.config.js with the correct configuration
   - Installs the latest versions of tailwindcss, postcss, and autoprefixer
   - Updates tailwind.config.js
   - Ensures index.css contains the proper Tailwind directives

#### Tailwind CSS Nesting Plugin Issues

If you encounter errors related to the Tailwind CSS nesting plugin like:
```
Loading PostCSS Plugin failed: Package subpath './nesting' is not defined by "exports" in /node_modules/tailwindcss/package.json
```

We've provided multiple solutions:

1. **Use the fix-tailwind-nesting.sh script**:
   ```bash
   chmod +x fix-tailwind-nesting.sh
   ./fix-tailwind-nesting.sh
   ```
   This script:
   - Updates postcss.config.js to use postcss-nesting instead of tailwindcss/nesting
   - Installs the correct versions of tailwindcss, postcss, and autoprefixer
   - Installs postcss-nesting separately

2. **Use the fix-postcss-simple.sh script**:
   ```bash
   chmod +x fix-postcss-simple.sh
   ./fix-postcss-simple.sh
   ```
   This script:
   - Applies a minimal PostCSS configuration that works with most setups
   - Installs compatible versions of tailwindcss, postcss, and autoprefixer

#### ES Module Issues with PostCSS

If you encounter errors related to ES modules like:
```
[ReferenceError] module is not defined in ES module scope
This file is being treated as an ES module because it has a '.js' file extension and '/package.json' contains "type": "module".
```

We've provided multiple solutions:

1. **Use the fix-postcss-esm.sh script**:
   ```bash
   chmod +x fix-postcss-esm.sh
   ./fix-postcss-esm.sh
   ```
   This script:
   - Detects if your project is using ES modules
   - Creates the appropriate PostCSS configuration format
   - Installs compatible versions of tailwindcss, postcss, and autoprefixer

2. **Use the fix-postcss-cjs.sh script** (recommended solution):
   ```bash
   chmod +x fix-postcss-cjs.sh
   ./fix-postcss-cjs.sh
   ```
   This script:
   - Removes postcss.config.js
   - Creates postcss.config.cjs (CommonJS format)
   - Installs compatible versions of tailwindcss, postcss, and autoprefixer

3. **Manual fix**:
   ```bash
   cd frontend  # or admin-frontend
   
   # Rename postcss.config.js to postcss.config.cjs
   mv postcss.config.js postcss.config.js.bak
   
   # Create a CommonJS format config file
   cat > postcss.config.cjs << 'EOL'
   module.exports = {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     }
   }
   EOL
   
   # Install correct dependencies
   npm install -D tailwindcss@^3.3.0 postcss@^8.4.23 autoprefixer@^10.4.14
   
   # Try building again
   npm run build
   ```

4. **Alternative: Configure PostCSS in vite.config.js**:
   ```bash
   cd frontend  # or admin-frontend
   
   # Edit vite.config.js to include PostCSS config
   cat > vite.config.js << 'EOL'
   import { defineConfig } from 'vite';
   import tailwindcss from 'tailwindcss';
   import autoprefixer from 'autoprefixer';
   
   export default defineConfig({
     css: {
       postcss: {
         plugins: [
           tailwindcss,
           autoprefixer,
         ],
       },
     },
   });
   EOL
   
   # Install correct dependencies
   npm install -D tailwindcss@^3.3.0 postcss@^8.4.23 autoprefixer@^10.4.14
   
   # Try building again
   npm run build
   ```

#### Tailwind CSS Theme Colors Issues

If you encounter errors related to missing Tailwind CSS classes like:
```
The `bg-primary-600` class does not exist. If `bg-primary-600` is a custom class, make sure it is defined within a `@layer` directive.
```

We've provided a solution:

1. **Use the fix-tailwind-theme.sh script**:
   ```bash
   chmod +x fix-tailwind-theme.sh
   ./fix-tailwind-theme.sh
   ```
   This script:
   - Updates tailwind.config.js to include custom theme colors
   - Adds color palettes for primary, secondary, success, danger, warning, and info
   - Installs compatible versions of tailwindcss, postcss, and autoprefixer

2. **Manual fix**:
   ```bash
   cd frontend  # or admin-frontend
   
   # Edit tailwind.config.js to include custom theme colors
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
           // Add other color palettes as needed
         },
       },
     },
     plugins: [],
   }
   EOL
   
   # Try building again
   npm run build
   ```

3. **Alternative: Modify the CSS file**:
   If you know which CSS file is using the custom classes (e.g., src/index.css), you can:
   - Remove the custom classes
   - Replace them with standard Tailwind classes
   - Or define them within a `@layer` directive:
   ```css
   @layer components {
     .bg-primary-600 {
       @apply bg-blue-600;
     }
   }
   ```

### Backend Issues

- Check PM2 logs: `pm2 logs bills-backend`
- Verify environment variables: `cat /var/www/bills-app/backend/.env`
- Check MongoDB connection: `mongo your_mongodb_uri`

### Frontend Issues

- Check Nginx error logs: `tail -f /var/log/nginx/error.log`
- Verify build files: `ls -la /var/www/bills-app/frontend/dist`
- Check permissions: `chmod -R 755 /var/www/bills-app/frontend/dist`

## Maintenance

### Regular Updates

```bash
# Update system packages
apt update && apt upgrade -y

# Update Node.js packages
cd /var/www/bills-app/backend
npm update

cd /var/www/bills-app/frontend
npm update

cd /var/www/bills-app/admin-frontend
npm update
```

### Monitoring Disk Space

```bash
# Check disk usage
df -h

# Clean up unnecessary files if needed
apt autoremove -y
apt clean
```

## Scaling (Future Considerations)

As your application grows, consider:

1. **Upgrading your Droplet**: Increase RAM and CPU as needed
2. **Load Balancing**: Set up multiple Droplets with a load balancer
3. **Database Scaling**: Consider MongoDB Atlas scaling options
4. **CDN Integration**: Use DigitalOcean Spaces with CDN for static assets
5. **Containerization**: Consider Docker and Kubernetes for more complex deployments

## Conclusion

Your Nigerian Bill Payment application should now be successfully deployed to DigitalOcean. The setup includes:

- Secure HTTPS connections
- Separate frontend and admin dashboard
- Backend API with PM2 process management
- Regular database backups
- Basic monitoring and security

For additional support, refer to DigitalOcean's documentation or contact your development team.
