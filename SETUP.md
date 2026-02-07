# Complete Setup Guide

## Prerequisites

- Python 3.9 or higher
- Modern web browser (Chrome, Edge, Firefox, or Safari)
- Webcam
- Git (for deployment)

## Local Setup (Windows)

### Option 1: Quick Start (Recommended)

1. **Download the project**
```cmd
git clone https://github.com/Majenayu/model.git
cd model
```

2. **Run the startup script**
```cmd
start.bat
```

3. **Open browser**
- Navigate to `http://localhost:5000`
- Click "Start Camera"
- Allow camera permissions
- Start training!

### Option 2: Manual Setup

1. **Install dependencies**
```cmd
pip install -r requirements.txt
```

2. **Start server**
```cmd
python server.py
```

3. **Access application**
- Open `http://localhost:5000` in your browser

## Local Setup (Mac/Linux)

1. **Download the project**
```bash
git clone https://github.com/Majenayu/model.git
cd model
```

2. **Make script executable and run**
```bash
chmod +x start.sh
./start.sh
```

3. **Open browser**
- Navigate to `http://localhost:5000`

## GitHub Setup

### First Time Setup

1. **Create repository on GitHub**
- Go to https://github.com/new
- Repository name: `model`
- Make it public
- Don't initialize with README (we have one)

2. **Push your code**
```bash
git init
git add .
git commit -m "Initial commit: Tadasana AI Trainer"
git remote add origin https://github.com/Majenayu/model.git
git branch -M main
git push -u origin main
```

### Update Existing Repository

```bash
git add .
git commit -m "Update: your changes description"
git push origin main
```

## Render Deployment

### Step-by-Step

1. **Sign up for Render**
- Go to https://render.com
- Sign up with GitHub account

2. **Create New Web Service**
- Click "New +" → "Web Service"
- Select "Build and deploy from a Git repository"
- Click "Connect" next to your GitHub account

3. **Configure Repository**
- Find and select `Majenayu/model`
- Click "Connect"

4. **Configure Service**
- **Name**: `tadasana-ai-trainer` (or your choice)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn server:app`
- **Instance Type**: `Free`

5. **Deploy**
- Click "Create Web Service"
- Wait 2-3 minutes for deployment
- Your app will be live at: `https://tadasana-ai-trainer.onrender.com`

### Render Free Tier Notes

- ✅ Free forever
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 750 hours/month limit (enough for personal use)

### Custom Domain (Optional)

1. In Render dashboard → Your service → Settings
2. Scroll to "Custom Domain"
3. Add your domain
4. Update DNS records as shown
5. Wait for SSL certificate (automatic)

## Adding Reference Image

The app includes a placeholder for the Tadasana reference image. To add your own:

1. **Get a clear Tadasana photo**
- High resolution (at least 800x1200px)
- Good lighting
- Clear view of full body
- Proper Tadasana alignment

2. **Replace the placeholder**
- Name your image `tadasana-reference.jpg`
- Place it in the project root directory
- Commit and push to GitHub

3. **Alternative: Use URL**
Edit `index.html` line 32:
```html
<img src="https://your-image-url.com/tadasana.jpg" alt="Tadasana Reference">
```

## Troubleshooting

### Camera Not Working

**Problem**: Camera doesn't start or shows black screen

**Solutions**:
1. Check browser permissions (Settings → Privacy → Camera)
2. Ensure HTTPS (required for camera API)
3. Try different browser (Chrome recommended)
4. Check if another app is using camera
5. Restart browser

### Model Loading Slow

**Problem**: "Loading model..." takes too long

**Solutions**:
1. First load downloads ~5MB model (normal)
2. Check internet connection
3. Clear browser cache and reload
4. Try different browser

### Python Dependencies Error

**Problem**: `pip install` fails

**Solutions**:
```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# If still fails, install individually
pip install Flask==3.0.0
pip install flask-cors==4.0.0
pip install gunicorn==21.2.0
```

### Port Already in Use

**Problem**: `Address already in use` error

**Solutions**:

**Windows**:
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux**:
```bash
lsof -ti:5000 | xargs kill -9
```

Or change port in `server.py`:
```python
port = int(os.environ.get('PORT', 8080))  # Changed from 5000
```

### Render Deployment Failed

**Problem**: Build or deployment fails on Render

**Solutions**:
1. Check build logs in Render dashboard
2. Verify `requirements.txt` has correct versions
3. Ensure `Procfile` exists and is correct
4. Check `runtime.txt` has valid Python version
5. Try manual deploy from Render dashboard

### Low Accuracy Scores

**Problem**: Always getting low scores even with good pose

**Solutions**:
1. Improve lighting (face light source)
2. Stand further from camera (6-8 feet)
3. Ensure full body visible in frame
4. Wear fitted clothing
5. Use plain background
6. Position camera at chest height

## Testing Checklist

Before deploying, verify:

- [ ] Camera starts successfully
- [ ] Skeleton overlay appears on video
- [ ] Score updates in real-time
- [ ] Corrections show relevant feedback
- [ ] Timer counts up
- [ ] Session stats update
- [ ] Reference image loads
- [ ] Responsive on mobile
- [ ] Works in different browsers

## Browser Compatibility

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome | ✅ | ✅ | Recommended |
| Edge | ✅ | ✅ | Recommended |
| Firefox | ✅ | ✅ | Supported |
| Safari | ✅ | ✅ | iOS 14.5+ |
| Opera | ✅ | ⚠️ | Limited testing |

## Performance Tips

### For Better Detection
- Use wired internet (not WiFi) for training
- Close other browser tabs
- Disable browser extensions
- Use incognito mode for testing

### For Faster Loading
- Enable browser cache
- Use CDN for libraries (already configured)
- Compress reference image (<500KB)

## Security Notes

- App runs entirely client-side (privacy-first)
- No video/images sent to server
- Only session stats saved (scores, time)
- No personal data collected
- Camera access only when you click "Start"

## Next Steps

After successful setup:

1. **Read Training Guide**: See `TRAINING_GUIDE.md`
2. **Practice Daily**: Aim for 10 minutes/day
3. **Track Progress**: Monitor your scores over time
4. **Share**: Deploy and share with yoga community
5. **Customize**: Add more poses or features

## Getting Help

- **GitHub Issues**: https://github.com/Majenayu/model/issues
- **Documentation**: Read all .md files in project
- **Render Support**: https://render.com/docs

## Updates

To update your deployed app:

```bash
# Make changes to code
git add .
git commit -m "Description of changes"
git push origin main
```

Render will automatically redeploy within 2-3 minutes!

---

**You're all set! Start training your Tadasana pose! 🧘**
