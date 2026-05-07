# 🚀 Deployment Guide - Telnyx Media Streaming App

Your Telnyx Media Streaming application is ready for deployment! This guide covers various deployment options.

## ✅ Pre-Deployment Checklist

- [ ] All tests passing
- [ ] `.env` file with real credentials (keep locally, never commit)
- [ ] `.env.example` with placeholder values (committed to repo)
- [ ] Application runs locally without errors
- [ ] All dependencies are in `package.json`
- [ ] `.gitignore` includes `node_modules/` and `.env`

## 🏠 Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Telnyx credentials
nano .env

# Start development server (with auto-reload)
npm run dev

# Application available at http://localhost:3000
```

## 🌐 Deployment Options

### Option 1: Heroku (Recommended for Quick Start)

#### Prerequisites
- Heroku account (https://www.heroku.com)
- Heroku CLI installed
- Git repository

#### Steps

1. **Create Heroku App**
```bash
heroku login
heroku create your-app-name
```

2. **Set Environment Variables**
```bash
heroku config:set TELNYX_API_KEY=your_actual_api_key
heroku config:set TELNYX_PHONE_NUMBER=+1234567890
heroku config:set TELNYX_CONNECTION_ID=your_connection_id
heroku config:set NODE_ENV=production
heroku config:set WEBHOOK_URL=https://your-app-name.herokuapp.com/webhooks
```

3. **Deploy**
```bash
git push heroku main
```

4. **View Logs**
```bash
heroku logs --tail
```

#### Heroku Considerations
- Free tier has limitations
- Application will sleep after 30 minutes of inactivity (paid plans solve this)
- For production, use hobby tier or higher

### Option 2: Docker Deployment

#### Create Dockerfile

The project already includes Docker support. Here's the setup:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
```

#### Build and Run Locally

```bash
# Build image
docker build -t telnyx-app .

# Run container
docker run \
  -p 3000:3000 \
  --env-file .env \
  --name telnyx-app \
  telnyx-app
```

#### Deploy to Docker Hub

```bash
# Tag image
docker tag telnyx-app your-username/telnyx-app:latest

# Push to Docker Hub
docker push your-username/telnyx-app:latest
```

### Option 3: AWS Elastic Beanstalk

#### Prerequisites
- AWS account
- AWS CLI installed
- EB CLI installed

#### Steps

1. **Initialize EB Project**
```bash
eb init -p node.js-18 --region us-east-1
```

2. **Create Environment**
```bash
eb create telnyx-app-env
```

3. **Set Environment Variables**
```bash
eb setenv TELNYX_API_KEY=your_key TELNYX_PHONE_NUMBER=+1234567890
```

4. **Deploy**
```bash
eb deploy
```

### Option 4: Google Cloud App Engine

#### Prerequisites
- Google Cloud Project
- gcloud CLI installed

#### Steps

1. **Create `app.yaml`**
```yaml
runtime: nodejs18

env: standard

env_variables:
  NODE_ENV: "production"

automatic_scaling:
  min_instances: 1
  max_instances: 10
```

2. **Deploy**
```bash
gcloud app deploy
```

### Option 5: Azure App Service

#### Prerequisites
- Azure account
- Azure CLI installed

#### Steps

1. **Create Resource Group**
```bash
az group create -n telnyx-app -l eastus
```

2. **Create App Service Plan**
```bash
az appservice plan create -n telnyx-plan -g telnyx-app --sku F1
```

3. **Create Web App**
```bash
az webapp create -n telnyx-app -g telnyx-app -p telnyx-plan --runtime "node|18.0"
```

4. **Configure Environment Variables**
```bash
az webapp config appsettings set -n telnyx-app -g telnyx-app \
  --settings TELNYX_API_KEY=your_key TELNYX_PHONE_NUMBER=+1234567890
```

5. **Deploy from Git**
```bash
az webapp deployment source config-zip -n telnyx-app -g telnyx-app --src deploy.zip
```

### Option 6: DigitalOcean App Platform

#### Steps

1. **Connect GitHub**
   - Go to DigitalOcean Dashboard
   - Apps > Create App > GitHub

2. **Configure Build**
   - Select repository
   - Confirm build settings

3. **Set Environment Variables**
   - Add TELNYX_API_KEY, TELNYX_PHONE_NUMBER, TELNYX_CONNECTION_ID
   - Set NODE_ENV=production

4. **Deploy**
   - Click Deploy

### Option 7: Manual VPS Deployment (AWS EC2, Linode, etc.)

#### Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone repository
git clone <your-repo-url>
cd Telnyx_Test_APP
npm install
```

#### Create PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'telnyx-app',
    script: './src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

#### Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Save startup script
pm2 startup
pm2 save

# Monitor
pm2 monit
```

#### Setup Nginx Reverse Proxy

```nginx
upstream telnyx_app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://telnyx_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /media {
        proxy_pass http://telnyx_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'Upgrade';
    }
}
```

#### Enable SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📝 Production Configuration

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
SESSION_SECRET=generate-a-strong-random-string

# Telnyx
TELNYX_API_KEY=your_production_api_key
TELNYX_PHONE_NUMBER=+1234567890
TELNYX_CONNECTION_ID=your_production_connection_id

# Webhook (use your production domain)
WEBHOOK_URL=https://your-production-domain.com/webhooks

# WebSocket (use wss for production)
WEBSOCKET_SERVER_URL=wss://your-production-domain.com/media
```

### Security Checklist

- [ ] Use HTTPS (SSL/TLS certificate)
- [ ] Use WSS for WebSocket connections
- [ ] Implement rate limiting
- [ ] Add authentication/authorization if needed
- [ ] Use strong SESSION_SECRET
- [ ] Monitor logs and errors
- [ ] Set up backups
- [ ] Enable CORS properly
- [ ] Validate all inputs
- [ ] Use environment variables for secrets

## 🔍 Monitoring & Logging

### Enable Logging

```bash
# View application logs
pm2 logs telnyx-app

# View specific log file
tail -f logs/out.log
```

### Monitor Application Health

- Set up health check endpoint: `GET /health`
- Monitor response times
- Track error rates
- Monitor WebSocket connections
- Track call metrics

## 🔗 Configuring Telnyx Webhooks

After deployment, update your Telnyx account:

1. Go to Telnyx Dashboard
2. Navigate to Connection Settings
3. Set Webhook URL to: `https://your-domain.com/webhooks`
4. Enable webhook events:
   - Call initiated
   - Call answered
   - Call completed
   - Streaming started/stopped
   - DTMF received

## 📞 Testing After Deployment

1. Visit application URL
2. Make a test call
3. Monitor logs for errors
4. Check WebSocket connection
5. Verify webhooks are received

## 🆘 Troubleshooting Deployment

### Application Won't Start
- Check environment variables are set
- Verify API credentials
- Check logs for errors: `pm2 logs`

### WebSocket Connection Fails
- Verify WSS is configured in production
- Check firewall allows port 443
- Verify SSL certificate is valid

### Webhooks Not Received
- Confirm webhook URL is publicly accessible
- Check firewall allows incoming connections
- Verify URL is HTTPS
- Check Telnyx dashboard webhook settings

### High Memory Usage
- Restart application
- Check for memory leaks
- Increase instance size
- Review call management code

## 📊 Performance Tips

- Use CDN for static assets
- Enable compression
- Implement caching strategies
- Use load balancing for high traffic
- Monitor and optimize database queries
- Use clustering for CPU cores
- Implement rate limiting

## 🚀 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: your-app-name
          heroku_email: your-email@example.com
```

## 📚 Additional Resources

- [Heroku Deployment](https://devcenter.heroku.com/articles/nodejs)
- [AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/)
- [Google App Engine](https://cloud.google.com/appengine/docs/nodejs)
- [Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/)
- [Docker Deployment](https://docs.docker.com/)
- [PM2 Process Manager](https://pm2.keymetrics.io/)

---

**Happy Deploying! 🎉**
