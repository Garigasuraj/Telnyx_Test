# Deploy to Vercel from GitHub

This guide will walk you through deploying your Telnyx Media Streaming app to Vercel directly from GitHub.

## 📋 Prerequisites

- GitHub account with repository containing this code
- Vercel account (free at https://vercel.com)
- Telnyx API credentials:
  - API Key
  - Phone Number
  - Connection ID
  - Webhook URL (will be generated after deployment)

## ✅ Step 1: Push Code to GitHub

### 1.1 Initialize Git (if not already done)
```bash
cd /Users/surajgariga/Documents/Telnyx_Test_APP
git init
git add .
git commit -m "Initial commit: Telnyx Media Streaming App"
```

### 1.2 Create GitHub Repository
1. Go to https://github.com/new
2. Create repository name: `Telnyx_Test_APP`
3. Do NOT initialize with README (you already have one)
4. Click "Create repository"

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/Telnyx_Test_APP.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## 🚀 Step 2: Deploy to Vercel

### 2.1 Connect GitHub to Vercel
1. Go to https://vercel.com/new
2. Click "Continue with GitHub" (or sign in)
3. Authorize Vercel to access your GitHub account
4. Select "Import Git Repository"
5. Search for and select `Telnyx_Test_APP`

### 2.2 Configure Project Settings
1. **Project Name**: `telnyx-media-streaming` (or your choice)
2. **Framework Preset**: Select `Other` (Express.js isn't in the default list)
3. **Root Directory**: `./` (leave as default)
4. **Build Command**: Leave empty (Vercel will use default)
5. **Output Directory**: Leave empty

### 2.3 Set Environment Variables
Before clicking "Deploy", add your environment variables:

Click "Environment Variables" and add:

```
TELNYX_API_KEY=your_actual_api_key_here
TELNYX_PHONE_NUMBER=+1234567890
TELNYX_CONNECTION_ID=your_connection_id
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

**Important**: Use your actual Telnyx credentials here.

### 2.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete (takes 2-5 minutes)
3. You'll see a "Congratulations!" message with your live URL

## 📱 Step 3: Configure Webhooks in Telnyx

Once deployment is complete, Vercel will provide a URL like:
```
https://your-app-name.vercel.app
```

### 3.1 Update Telnyx Webhook URL
1. Go to Telnyx Dashboard: https://portal.telnyx.com
2. Navigate to **Connections** → Your Connection
3. Find **Webhook URLs** section
4. Set the webhook URL to: `https://your-app-name.vercel.app/webhooks`
5. Enable events:
   - ✅ Call Initiated
   - ✅ Call Answered
   - ✅ Call Completed
   - ✅ Call Hangup
   - ✅ Streaming Started
   - ✅ Streaming Stopped
   - ✅ DTMF Received
6. Click "Save"

## ✨ Step 4: Test Your Deployment

1. Visit your deployed app: `https://your-app-name.vercel.app`
2. Click "New Call" button
3. Enter a destination phone number
4. Click "Initiate Call"
5. Check "Active Calls" to see your call in real-time

## 🔄 Automatic Deployments

Your app is now set up for continuous deployment! Every time you:
```bash
git push origin main
```

Vercel will automatically rebuild and redeploy your app.

## 🔐 Security Tips

1. **Never commit `.env`** - It's already in `.gitignore`
2. **Keep API keys secret** - Only add them in Vercel's Environment Variables dashboard
3. **Use HTTPS** - Vercel provides free SSL/TLS certificates
4. **WebSocket Security** - Vercel supports WebSockets on paid plans
   - If using free plan, WebSocket might not work properly
   - Consider upgrading to Vercel Pro for full WebSocket support

## ⚠️ Important Limitations on Free Vercel Plan

1. **WebSocket Support**: Limited on free tier
   - Real-time media streaming may be restricted
   - Consider upgrading to Vercel Pro ($20/month)

2. **Execution Time**: Functions timeout after 10 seconds
   - Most API calls should complete in time
   - Long-running processes may need optimization

3. **Environment**: Serverless (stateless)
   - Each request is a fresh process
   - In-memory caches (Maps, etc.) won't persist

4. **Alternative**: Use Vercel Pro or other platforms (AWS, Heroku, DigitalOcean)

## 🎯 Recommended: Vercel Pro

For full functionality with WebSockets and real-time streaming:

```bash
vercel upgrade
```

Or visit: https://vercel.com/account/billing/overview

## 📊 Monitor Your Deployment

### View Logs
```bash
vercel logs your-app-name
```

### View Analytics
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Navigate to "Analytics" tab

### Rebuild/Redeploy
```bash
# Manual redeploy
vercel --prod

# View deployment status
vercel deploy --prod
```

## 🚨 Troubleshooting

### Issue: "Build failed"
- Check Vercel build logs for errors
- Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

### Issue: "Webhook not receiving events"
- Verify webhook URL is correct in Telnyx dashboard
- Check Vercel logs for 404 errors
- Ensure TELNYX_API_KEY is set in Vercel environment

### Issue: "WebSocket connection failed"
- You need Vercel Pro for full WebSocket support
- Free tier has limited WebSocket support
- Consider upgrading or using alternative hosting

### Issue: "Calls not appearing"
- Check if environment variables are set correctly
- Verify Telnyx API key and credentials
- Check Vercel function logs for errors

## 📝 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] GitHub repository is public (or private with access granted)
- [ ] Vercel account created
- [ ] Project imported from GitHub to Vercel
- [ ] Environment variables set in Vercel dashboard
- [ ] Deployment successful (green checkmark)
- [ ] App accessible at your Vercel URL
- [ ] Webhook URL updated in Telnyx dashboard
- [ ] Webhook events enabled
- [ ] Test call successful

## 🆘 Need Help?

- **Vercel Issues**: https://vercel.com/support
- **Telnyx Issues**: https://developers.telnyx.com/docs
- **GitHub Issues**: https://docs.github.com

## 📚 Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Express.js on Vercel](https://vercel.com/guides/using-express-with-vercel)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [WebSocket Support](https://vercel.com/docs/functions/serverless-functions#websocket-support)

---

**Your app is now live! 🎉**
