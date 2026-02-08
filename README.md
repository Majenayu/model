# Tadasana AI Trainer 🧘

Real-time AI-powered Mountain Pose (Tadasana) training with instant biomechanical feedback using TensorFlow.js and MoveNet.

## Live Demo

Deploy to Render: [Your App URL]

## Features

- **Real-time Pose Detection**: 30 FPS using Google MoveNet
- **20-Point Biomechanical Analysis**: Comprehensive Tadasana validation
- **Visual Feedback**: Live skeleton overlay with color-coded corrections
- **Priority-Based Corrections**: Critical (🔴) → Refinement (🟡) → Minor (⚪)
- **Scoring System**: 0-100% accuracy with detailed breakdown
- **Progress Tracking**: Best score, average, attempts, and time
- **SUNDAY Design**: Beautiful, responsive UI inspired by SUNDAY platform

## Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/Majenayu/model.git
cd model

# Install dependencies
pip install -r requirements.txt

# Run server
python server.py
```

Open `http://localhost:5000`

### Deploy to Render

1. Push to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect repository: `Majenayu/model`
4. Render auto-detects settings from `Procfile`
5. Deploy!

## How It Works

### Pose Detection Pipeline
```
Camera → MoveNet Model → 17 Keypoints → Angle Calculation → 
Validation Logic → Priority-Based Feedback → Visual Overlay
```

### 20-Point Tadasana Validation

**Foundation (Priority 1-3)**
- Foot spacing (hip-width)
- Weight distribution
- Foot parallel alignment

**Legs (Priority 1-3)**
- Quadriceps engagement
- Knee straightness (165-190°)
- Knee tracking over ankles

**Pelvis & Core (Priority 1-2)**
- Hip level alignment
- Pelvic positioning
- Core engagement

**Spine & Torso (Priority 1-3)**
- Spinal alignment (shoulders over hips)
- Chest opening
- Rib cage positioning

**Shoulders (Priority 2-3)**
- Shoulder level and relaxation
- Shoulder blade engagement
- Collarbone broadening

**Arms (Priority 3-4)**
- Natural arm positioning
- Energy flow through fingertips
- Hand placement by sides

**Head & Neck (Priority 1-3)**
- Head alignment over shoulders
- Neck length and crown reach
- Jaw relaxation

### Scoring Algorithm

- **90-100%**: Perfect alignment ✨
- **75-89%**: Excellent - minor refinements
- **60-74%**: Good - focus on adjustments
- **Below 60%**: Needs work - address critical issues

## Technology Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **ML**: TensorFlow.js 3.13.0, MoveNet SinglePose Lightning
- **Backend**: Flask (Python)
- **Deployment**: Render (Gunicorn)

## Project Structure

```
model/
├── index.html          # Main UI (SUNDAY-inspired design)
├── app.js              # Pose detection & analysis logic
├── server.py           # Flask backend
├── requirements.txt    # Python dependencies
├── Procfile           # Render deployment
├── runtime.txt        # Python version
├── .gitignore         # Git exclusions
└── README.md          # This file
```

## API Endpoints

- `GET /` - Main application
- `POST /api/save-session` - Save training session
- `GET /api/get-history` - Get training history
- `GET /api/stats` - Get aggregated statistics

## Training Tips

1. **Lighting**: Ensure good lighting for better detection
2. **Distance**: Stand 6-8 feet from camera
3. **Full Body**: Keep entire body visible in frame
4. **Camera Height**: Position at chest level
5. **Practice**: Aim for 70%+ score consistently

## Customization

### Adjust Sensitivity
Edit `app.js`:
```javascript
const MIN_CONFIDENCE = 0.3;  // Keypoint confidence threshold
const angleThreshold = 165;   // Knee straightness threshold
```

### Change Scoring Weights
Modify penalty values in `analyzeTadasana()`:
```javascript
corrections.push({ 
  priority: 1, 
  message: 'Your message', 
  penalty: 10  // Adjust this
});
```

## Browser Compatibility

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome  | ✅      | ✅     |
| Edge    | ✅      | ✅     |
| Firefox | ✅      | ✅     |
| Safari  | ✅      | ✅ (iOS 14.5+) |

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS (automatic on Render)
- Try Chrome/Edge for best compatibility

### Low Accuracy Scores
- Improve lighting
- Stand further from camera
- Ensure full body visible
- Wear fitted clothing

### Deployment Failed
- Check Render build logs
- Verify `Procfile`: `web: python -m gunicorn server:app --bind 0.0.0.0:$PORT`
- Ensure all dependencies in `requirements.txt`

## License

MIT License - Free for personal and commercial use

## Credits

- **TensorFlow.js**: Google Brain Team
- **MoveNet**: Google Research
- **Design Inspiration**: SUNDAY Yoga Platform
- **Tailwind CSS**: Tailwind Labs

## Author

**Majenayu**
- GitHub: [@Majenayu](https://github.com/Majenayu)
- Repository: [model](https://github.com/Majenayu/model)

---

**Namaste** 🙏

*Built with ❤️ for the yoga community*
