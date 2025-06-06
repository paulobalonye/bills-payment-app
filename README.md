# Nigerian Bill Payment Application

A full-stack bill payment web application for the Nigerian market using Node.js (Express) for the backend and React for the frontend. The application integrates Paystack to handle wallet top-ups and bill payments (airtime, electricity, and cable TV).

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Wallet Management**: Fund wallet using Paystack payment gateway
- **Bill Payments**:
  - Airtime purchase for all Nigerian networks
  - Electricity bill payments (prepaid and postpaid)
  - Cable TV subscriptions (DSTV, GOTV, Startimes)
- **Transaction History**: View and filter transaction history
- **Admin Dashboard**: Secure admin panel for managing users, transactions, and payments
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Project Structure

The application is divided into three main components:

1. **Backend**: Node.js/Express API with MongoDB
2. **Frontend**: React user interface for customers
3. **Admin Frontend**: React admin dashboard for administrators

## Deployment

This application can be deployed to DigitalOcean using the following steps:

1. Create a DigitalOcean Droplet (Ubuntu 22.04 LTS recommended)
2. Set up your domain and DNS records
3. Install required software (Node.js, Nginx, PM2, etc.)
4. Configure SSL certificates
5. Deploy the backend, frontend, and admin dashboard
6. Set up MongoDB backups and monitoring

For detailed deployment instructions, please refer to the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) file.

## Quick Deployment

We've included several scripts to simplify the deployment process:

- `deploy-all.sh`: Deploys all components (backend, frontend, admin)
- `backend/deploy.sh`: Deploys only the backend
- `frontend/deploy.sh`: Builds the frontend
- `admin-frontend/deploy.sh`: Builds the admin dashboard
- `backup-mongodb.sh`: Creates a backup of the MongoDB database

To deploy the entire application:

```bash
chmod +x deploy-all.sh
./deploy-all.sh
```

## Environment Variables

The application requires several environment variables to be set in the `.env` file:

```
PORT=5000
MONGODB_URI=mongodb+srv://your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret
```

## Nginx Configuration

The application uses Nginx as a reverse proxy to serve the frontend and admin dashboard while routing API requests to the backend. The configuration file is provided in `nginx.conf`.

## Security Considerations

- All API endpoints are protected with JWT authentication
- Admin routes are restricted to users with the admin role
- SSL/TLS encryption is used for all connections
- Regular database backups are recommended

## Maintenance

Regular maintenance tasks include:

- Updating system packages
- Monitoring disk space
- Checking application logs
- Backing up the database
- Renewing SSL certificates

## Support

For support or questions about deployment, please contact the development team.
