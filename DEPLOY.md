# Deployment Guide

## Deploy to Render

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Tadasana AI Trainer"
git remote add origin https://github.com/Majenayu/model.git
git branch -M main
git push -u origin main
```

### Step 2: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select the `Majenayu/model` repository
5. Configure:
   - **Name**: tadasana-ai-trainer
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn server:app`
   - **Instance Type**: Free

6. Click "Create Web Service"

### Step 3: Wait for Deployment

Render will automatically:
- Install dependencies from `requirements.txt`
- Start the Flask server using `gunicorn`
- Provide a live URL (e.g., `https://tadasana-ai-trainer.onrender.com`)

### Step 4: Test Your App

1. Open the provided URL
2. Click "Start Camera"
3. Allow camera permissions
4. Stand in Tadasana pose
5. Get real-time feedback!

## Local Testing

Before deploying, test locally:

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python server.py

# Open browser
# Navigate to http://localhost:5000
```

## Troubleshooting

### Camera Not Working
- Ensure HTTPS (Render provides this automatically)
- Check browser permissions
- Try Chrome/Edge for best compatibility

### Model Loading Slow
- First load downloads ~5MB model
- Subsequent loads use browser cache
- Consider using CDN for faster loading

### Render Free Tier Limitations
- App sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid tier for always-on service

## Custom Domain (Optional)

1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domain"
3. Add your domain (e.g., `tadasana.yourdomain.com`)
4. Update DNS records as instructed

## Environment Variables

No environment variables needed for basic deployment!

Optional for future features:
- `MONGODB_URI` - For user authentication
- `SECRET_KEY` - For session management

## Monitoring

Check your app health:
- Render Dashboard → Logs
- Monitor response times
- Check error rates

## Updates

To update your deployed app:

```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

Render will automatically redeploy!

---

**Your Tadasana AI Trainer is ready to deploy! 🚀**
