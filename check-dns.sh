#!/bin/bash

# DNS Checker Script for Nigerian Bill Payment Application
# This script helps diagnose DNS issues when deploying to DigitalOcean

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Domain to check
DOMAIN="9japayments.online"
SUBDOMAINS=("www" "admin")

# Check if dig is installed
if ! command -v dig &> /dev/null; then
    echo -e "${YELLOW}Installing dig (DNS lookup utility)...${NC}"
    apt update > /dev/null 2>&1
    apt install -y dnsutils > /dev/null 2>&1
fi

# Get Droplet IP
DROPLET_IP=$(curl -s http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address)
if [ -z "$DROPLET_IP" ]; then
    # If not running on DigitalOcean, try to get the public IP
    DROPLET_IP=$(curl -s https://api.ipify.org)
    echo -e "${YELLOW}Not running on a DigitalOcean Droplet. Using detected public IP: ${DROPLET_IP}${NC}"
else
    echo -e "${GREEN}Detected DigitalOcean Droplet IP: ${DROPLET_IP}${NC}"
fi

echo -e "\n${BLUE}=== DNS Configuration Checker ===${NC}"
echo -e "${BLUE}This script will check DNS configuration for your domains${NC}"
echo -e "${BLUE}Checking main domain and subdomains...${NC}\n"

# Function to check a domain
check_domain() {
    local domain=$1
    echo -e "${YELLOW}Checking ${domain}...${NC}"
    
    # Check A record
    echo -n "A record: "
    A_RECORD=$(dig +short A ${domain})
    
    if [ -z "$A_RECORD" ]; then
        echo -e "${RED}Not found! DNS record does not exist or hasn't propagated yet.${NC}"
        ISSUES=1
    else
        echo -e "${GREEN}Found: ${A_RECORD}${NC}"
        
        if [ "$A_RECORD" == "$DROPLET_IP" ]; then
            echo -e "${GREEN}✓ A record correctly points to your Droplet IP${NC}"
        else
            echo -e "${RED}✗ A record points to ${A_RECORD}, but your Droplet IP is ${DROPLET_IP}${NC}"
            ISSUES=1
        fi
    fi
    
    # Check if the domain is accessible via HTTP
    echo -n "HTTP accessibility: "
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://${domain})
    
    if [[ $HTTP_STATUS == 2* ]] || [[ $HTTP_STATUS == 3* ]]; then
        echo -e "${GREEN}Accessible (HTTP Status: ${HTTP_STATUS})${NC}"
    else
        echo -e "${RED}Not accessible (HTTP Status: ${HTTP_STATUS})${NC}"
        ISSUES=1
    fi
    
    echo ""
}

# Check main domain
ISSUES=0
check_domain $DOMAIN

# Check subdomains
for SUBDOMAIN in "${SUBDOMAINS[@]}"; do
    check_domain "${SUBDOMAIN}.${DOMAIN}"
done

# Check nameservers
echo -e "${YELLOW}Checking nameservers for ${DOMAIN}...${NC}"
NS_RECORDS=$(dig +short NS ${DOMAIN})

if [ -z "$NS_RECORDS" ]; then
    echo -e "${RED}No nameservers found for ${DOMAIN}${NC}"
    ISSUES=1
else
    echo -e "${GREEN}Nameservers:${NC}"
    echo "$NS_RECORDS" | while read ns; do
        if [[ $ns == *"digitalocean.com"* ]]; then
            echo -e "${GREEN}✓ ${ns} (DigitalOcean nameserver)${NC}"
        else
            echo -e "${YELLOW}⚠ ${ns} (Not a DigitalOcean nameserver)${NC}"
            ISSUES=1
        fi
    done
fi

echo -e "\n${BLUE}=== DNS Propagation Check ===${NC}"
echo -e "${YELLOW}Checking DNS propagation for ${DOMAIN}...${NC}"

# Use multiple DNS servers to check propagation
DNS_SERVERS=("8.8.8.8" "1.1.1.1" "208.67.222.222" "9.9.9.9")
PROPAGATED=0
NOT_PROPAGATED=0

for DNS_SERVER in "${DNS_SERVERS[@]}"; do
    echo -n "Checking with DNS server ${DNS_SERVER}: "
    RESULT=$(dig @${DNS_SERVER} +short A ${DOMAIN})
    
    if [ -z "$RESULT" ]; then
        echo -e "${RED}Not propagated${NC}"
        NOT_PROPAGATED=$((NOT_PROPAGATED+1))
    else
        echo -e "${GREEN}Propagated (${RESULT})${NC}"
        PROPAGATED=$((PROPAGATED+1))
    fi
done

PROPAGATION_PCT=$((PROPAGATED * 100 / (PROPAGATED + NOT_PROPAGATED)))
echo -e "\n${YELLOW}DNS Propagation: ${PROPAGATION_PCT}% (${PROPAGATED}/${PROPAGATED + NOT_PROPAGATED} servers)${NC}"

# Summary and recommendations
echo -e "\n${BLUE}=== Summary and Recommendations ===${NC}"

if [ $ISSUES -eq 0 ] && [ $PROPAGATION_PCT -eq 100 ]; then
    echo -e "${GREEN}✓ All DNS checks passed! Your domain appears to be correctly configured.${NC}"
    echo -e "${GREEN}✓ You should be able to obtain SSL certificates using Certbot now.${NC}"
    echo -e "\n${YELLOW}Run:${NC}"
    echo -e "certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} -d admin.${DOMAIN}"
elif [ $PROPAGATION_PCT -lt 50 ]; then
    echo -e "${RED}✗ DNS propagation is still in progress (${PROPAGATION_PCT}%).${NC}"
    echo -e "${YELLOW}Recommendations:${NC}"
    echo -e "1. Wait a few hours for DNS changes to fully propagate"
    echo -e "2. In the meantime, you can deploy without SSL using the nginx-without-ssl.conf"
    echo -e "3. Try using HTTP challenge instead of DNS challenge:"
    echo -e "   certbot --nginx --preferred-challenges http -d ${DOMAIN}"
else
    echo -e "${YELLOW}⚠ Some DNS issues were detected.${NC}"
    echo -e "${YELLOW}Recommendations:${NC}"
    echo -e "1. Verify that you've added the domain in DigitalOcean's Domains section"
    echo -e "2. Ensure you've created A records for ${DOMAIN}, www.${DOMAIN}, and admin.${DOMAIN}"
    echo -e "3. Check that your domain's nameservers are set to DigitalOcean's nameservers"
    echo -e "4. Wait a few more hours for DNS changes to fully propagate"
    echo -e "5. In the meantime, you can deploy without SSL using the nginx-without-ssl.conf"
fi

echo -e "\n${BLUE}For more detailed troubleshooting, refer to DNS_SSL_TROUBLESHOOTING.md${NC}"
