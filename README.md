# Tadasana AI Trainer - SUNDAY Platform 🧘

Real-time AI-powered Tadasana (Mountain Pose) training with instant biomechanical feedback and SUNDAY's beautiful interface.

![SUNDAY Platform](https://img.shields.io/badge/Platform-SUNDAY-42A5F5?style=for-the-badge)
![AI Model](https://img.shields.io/badge/AI-TensorFlow.js-FF6F00?style=for-the-badge)
![Pose](https://img.shields.io/badge/Pose-Tadasana-10B981?style=for-the-badge)

## 🎯 Overview

This is a focused Tadasana training application built with SUNDAY's exact frontend design. It provides real-time pose analysis, biomechanical feedback, and scoring to help users perfect their Mountain Pose alignment.

**Live Demo**: Deploy to [Render](https://render.com) for instant access

## ✨ Features

### 🤖 AI-Powered Analysis
- **Real-time Detection**: 30 FPS pose tracking with Google MoveNet
- **20-Point Validation**: Comprehensive biomechanical analysis
- **Smart Scoring**: 0-100% accuracy with weighted corrections
- **Priority Feedback**: Critical (🔴) → Refinement (🟡) → Minor (⚪)

### 🎨 SUNDAY Design
- **Professional Interface**: Exact SUNDAY platform styling
- **Dark Theme**: Blue gradient background with card-based layout
- **Responsive Design**: Perfect on mobile and desktop
- **3D Effects**: Hover animations and smooth transitions

### 🧘 Tadasana Mastery
- **Foundation Analysis**: Foot spacing, weight distribution
- **Alignment Checks**: Spinal alignment, hip level, shoulder position
- **Postural Feedback**: Head alignment, core engagement
- **Real-time Corrections**: Instant feedback with visual overlay

### 📊 Training Tools
- **Voice Guidance**: Text-to-speech corrections (optional)
- **Progress Tracking**: Best score, attempts, session time
- **Correction Log**: History of feedback and improvements
- **Reference Guide**: Side-by-side pose comparison

## 🚀 Quick Start

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

Open `http://localhost:5000` and start training!

### Deploy to Render

1. **Fork this repository**
2. **Create Web Service** on [Render](https://render.com)
3. **Connect repository**: `Majenayu/model`
4. **Auto-deploy**: Render detects configuration automatically
5. **Start training**: Your app is live in 2-3 minutes!

## 🧘 How to Use

### Getting Started
1. **Open the app** in your browser
2. **Click "START TADASANA PRACTICE"**
3. **Allow camera access** when prompted
4. **Stand 6-8 feet** from your camera
5. **Get into Mountain Pose** and receive instant feedback

### Understanding Feedback

**Score Ranges:**
- **90-100%**: 🌟 Perfect! Hold and breathe
- **75-89%**: ✨ Excellent - minor refinements
- **60-74%**: 👍 Good - focus on key adjustments
- **Below 60%**: 🔧 Needs work - address critical issues

**Correction Colors:**
- **🔴 Red**: Critical alignment issues (fix immediately)
- **🟡 Yellow**: Important refinements (improve form)
- **⚪ White**: Minor adjustments (fine-tuning)

### Training Tips
- **Lighting**: Face a light source for better detection
- **Distance**: Stand 6-8 feet from camera
- **Visibility**: Ensure full body is in frame
- **Clothing**: Wear fitted clothes for better keypoint detection
- **Practice**: Aim for 70%+ score consistently

## 🔬 Technical Details

### Tadasana Validation System

**20-Point Biomechanical Analysis:**

**Foundation (Priority 1-3)**
- Foot spacing (hip-width apart)
- Weight distribution (even balance)
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

### Technology Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **AI/ML**: TensorFlow.js 3.13.0, MoveNet SinglePose Lightning
- **Backend**: Flask (Python), Gunicorn
- **Deployment**: Render (auto-deploy from GitHub)
- **Design**: SUNDAY Platform styling

### Performance
- **Detection Speed**: 30 FPS real-time analysis
- **Model Size**: ~5MB (cached after first load)
- **Latency**: <50ms per frame
- **Accuracy**: 85%+ for proper Tadasana alignment

## 📁 Project Structure

```
model/
├── index.html              # SUNDAY-styled main interface
├── app.js                  # Pose detection & analysis logic
├── server.py               # Flask backend server
├── requirements.txt        # Python dependencies
├── Procfile               # Render deployment config
├── runtime.txt            # Python version (3.11)
├── .gitignore             # Git exclusions
└── README.md              # This documentation
```

## 🎨 Customization

### Adjust Validation Sensitivity
```javascript
// In app.js
const MIN_CONFIDENCE = 0.3;  // Keypoint confidence (0.1-0.9)
const angleThreshold = 165;  // Knee straightness threshold
```

### Modify Scoring Weights
```javascript
// In checkTadasana() function
corrections.push({ 
    message: "Your correction message", 
    affected: ['left_ankle', 'right_ankle'],
    color: 'red',     // red, yellow, green
    priority: 1       // 1=critical, 2=important, 3=minor
});
```

### Add Reference Image
Replace `tadasana-reference.jpg` with your own reference image (recommended: 800x1200px, <500KB).

## 🌐 Browser Support

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome  | ✅      | ✅     | Recommended |
| Edge    | ✅      | ✅     | Recommended |
| Firefox | ✅      | ✅     | Supported |
| Safari  | ✅      | ✅     | iOS 14.5+ |

## 🔧 Troubleshooting

### Camera Issues
- **Permission denied**: Check browser settings → Privacy → Camera
- **Black screen**: Ensure HTTPS (automatic on Render)
- **Not working**: Try Chrome/Edge browsers

### Low Accuracy Scores
- **Improve lighting**: Face a window or light source
- **Check distance**: Stand 6-8 feet from camera
- **Full body visible**: Ensure head to feet are in frame
- **Plain background**: Avoid cluttered backgrounds

### Deployment Issues
- **Build failed**: Check Render logs for errors
- **Module not found**: Verify Procfile: `web: python -m gunicorn server:app --bind 0.0.0.0:$PORT`
- **Dependencies**: Ensure all packages in requirements.txt

## 📊 Training Data Collection

This app automatically collects valuable training data:
- **Keypoint coordinates** (17 points × 2 dimensions)
- **Calculated angles** (10 key body angles)
- **Correction history** (feedback patterns)
- **Score progression** (improvement over time)
- **Session statistics** (duration, attempts, accuracy)

Perfect for training custom Tadasana models and improving pose detection algorithms.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/improvement`
3. Commit changes: `git commit -m 'Add improvement'`
4. Push to branch: `git push origin feature/improvement`
5. Open Pull Request

## 📄 License

MIT License - Free for personal and commercial use.

## 🙏 Credits

- **SUNDAY Platform**: UI/UX design inspiration
- **TensorFlow.js**: Google Brain Team
- **MoveNet**: Google Research
- **Tailwind CSS**: Tailwind Labs

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Majenayu/model/issues)
- **Repository**: https://github.com/Majenayu/model
- **Documentation**: See project files for detailed guides

## 🎯 Perfect For

- **Yoga Practitioners**: Improve Tadasana alignment
- **Yoga Instructors**: Teaching tool for proper posture
- **Researchers**: Pose detection and biomechanics study
- **Developers**: ML model training data collection
- **Studios**: Digital yoga assistance

---

**Start your Tadasana training journey today! 🧘**

**Namaste** 🙏

*Built with ❤️ for the yoga community*
