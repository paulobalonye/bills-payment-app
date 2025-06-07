# DNS and SSL Troubleshooting Guide

This guide will help you resolve DNS and SSL certificate issues when deploying your Nigerian Bill Payment Application to DigitalOcean.

## Common DNS Issues

### NXDOMAIN Errors (Like You're Experiencing)

The error message you received:
```
DNS problem: NXDOMAIN looking up A for 9japayments.online
```

This means that the domain name doesn't exist in the DNS system or hasn't propagated yet.

### Step-by-Step Resolution

1. **Verify Domain Registration**
   - Ensure your domain (9japayments.online) is properly registered with a domain registrar
   - Check that the registration hasn't expired

2. **Configure DigitalOcean DNS**
   - Log in to your DigitalOcean account
   - Go to "Networking" > "Domains"
   - Add your domain if it's not already there
   - Create A records for:
     ```
     9japayments.online         → Points to your Droplet's IP
     www.9japayments.online     → Points to your Droplet's IP
     admin.9japayments.online   → Points to your Droplet's IP
     ```

3. **Configure Nameservers at Your Registrar**
   - Log in to your domain registrar (GoDaddy, Namecheap, etc.)
   - Set the nameservers to DigitalOcean's nameservers:
     ```
     ns1.digitalocean.com
     ns2.digitalocean.com
     ns3.digitalocean.com
     ```

4. **Check DNS Propagation**
   - DNS changes can take time to propagate (30 minutes to 48 hours)
   - Check propagation status with these commands:
     ```bash
     dig 9japayments.online
     dig www.9japayments.online
     dig admin.9japayments.online
     ```
   - Or use online tools like [dnschecker.org](https://dnschecker.org)

5. **Verify DNS Resolution**
   - The dig command should return an A record pointing to your Droplet's IP
   - Example successful output:
     ```
     ;; ANSWER SECTION:
     9japayments.online.    3600    IN    A    123.456.789.10
     ```

## SSL Certificate Issues

### Certbot Authentication Failures

When Certbot fails to authenticate your domains, you have several options:

### Option 1: Wait for DNS Propagation

- Wait 1-4 hours for DNS changes to propagate
- Try running Certbot again:
  ```bash
  certbot --nginx -d 9japayments.online -d www.9japayments.online -d admin.9japayments.online
  ```

### Option 2: Use HTTP Challenge Instead of DNS Challenge

- The HTTP challenge method is often faster:
  ```bash
  certbot --nginx --preferred-challenges http -d 9japayments.online -d www.9japayments.online -d admin.9japayments.online
  ```

### Option 3: Deploy Without SSL Temporarily

- Use the provided `nginx-without-ssl.conf` configuration:
  ```bash
  cp nginx-without-ssl.conf /etc/nginx/sites-available/bills-app
  ln -s /etc/nginx/sites-available/bills-app /etc/nginx/sites-enabled/
  nginx -t
  systemctl restart nginx
  ```
- Add SSL later when DNS is properly configured

### Option 4: Use a Single Domain Initially

- If only one domain is resolving, start with that:
  ```bash
  certbot --nginx -d 9japayments.online
  ```
- Add the other domains later:
  ```bash
  certbot --nginx --expand -d 9japayments.online -d www.9japayments.online -d admin.9japayments.online
  ```

## Testing Your DNS Configuration

### Using dig

```bash
# Install dig if not available
apt install dnsutils

# Check the main domain
dig 9japayments.online

# Check www subdomain
dig www.9japayments.online

# Check admin subdomain
dig admin.9japayments.online
```

### Using nslookup

```bash
# Check the main domain
nslookup 9japayments.online

# Check www subdomain
nslookup www.9japayments.online

# Check admin subdomain
nslookup admin.9japayments.online
```

### Using curl

```bash
# Check if the server is responding on HTTP
curl -I http://9japayments.online
curl -I http://www.9japayments.online
curl -I http://admin.9japayments.online
```

## Temporary Deployment Without SSL

If you need to deploy immediately without waiting for DNS propagation, follow these steps:

1. Use the provided `nginx-without-ssl.conf` configuration:
   ```bash
   cp nginx-without-ssl.conf /etc/nginx/sites-available/bills-app
   ln -s /etc/nginx/sites-available/bills-app /etc/nginx/sites-enabled/
   rm /etc/nginx/sites-enabled/default  # Remove default site if it exists
   nginx -t  # Test configuration
   systemctl restart nginx
   ```

2. Deploy your application as described in the main deployment guide

3. Once DNS propagation is complete, obtain SSL certificates:
   ```bash
   certbot --nginx -d 9japayments.online -d www.9japayments.online -d admin.9japayments.online
   ```

## Using DigitalOcean's DNS Manager

DigitalOcean provides a user-friendly DNS manager:

1. Go to the DigitalOcean control panel
2. Click on "Networking" in the left sidebar
3. Click on "Domains"
4. Add your domain if it's not already there
5. Add the following A records:
   - `@` pointing to your Droplet's IP (for the root domain)
   - `www` pointing to your Droplet's IP
   - `admin` pointing to your Droplet's IP

Remember to set your domain's nameservers to DigitalOcean's nameservers at your domain registrar.

## Conclusion

DNS issues are common when deploying websites, but they're usually resolved within a few hours. The most important step is to correctly configure your DNS records at DigitalOcean and ensure your domain's nameservers are properly set.

If you continue to experience issues after following this guide, please check:
1. That your Droplet's firewall allows HTTP (port 80) and HTTPS (port 443)
2. That your domain registrar has the correct nameserver settings
3. That there are no typos in your domain names in the Nginx configuration
