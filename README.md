# Tadasana AI Trainer 🧘

Real-time AI-powered Mountain Pose (Tadasana) training application with instant feedback and pose correction.

## Features

- **Real-time Pose Detection**: Uses TensorFlow.js and MoveNet for accurate pose estimation
- **20-Point Validation System**: Comprehensive biomechanical analysis
- **Visual Feedback**: Live skeleton overlay on camera feed
- **Reference Image**: Side-by-side comparison with correct pose
- **Scoring System**: 0-100% accuracy with detailed corrections
- **Training History**: Track your progress over time
- **Priority-Based Corrections**: Critical (🔴), Refinement (🟡), Minor (⚪)

## Live Demo

[Deploy to Render](https://render.com)

## Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Majenayu/model.git
cd model
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python server.py
```

4. Open browser at `http://localhost:5000`

### Deploy to Render

1. Fork this repository
2. Create new Web Service on Render
3. Connect your GitHub repository
4. Render will auto-detect settings from `Procfile`
5. Deploy!

## How It Works

### Pose Detection
- Uses Google's MoveNet SinglePose Lightning model
- Detects 17 body keypoints in real-time
- Runs entirely in the browser (client-side)

### Tadasana Analysis
The app validates 10 key aspects of Mountain Pose:

1. **Foot Spacing**: Hip-width apart
2. **Weight Distribution**: Even on both feet
3. **Knee Alignment**: Straight but not locked (165-190°)
4. **Hip Level**: Balanced left and right
5. **Spinal Alignment**: Shoulders over hips
6. **Shoulder Position**: Level and relaxed
7. **Arm Placement**: Straight by sides
8. **Head Alignment**: Over shoulders
9. **Chest Opening**: Broadened collarbones
10. **Core Engagement**: Lengthened spine

### Scoring System
- **90-100%**: Perfect alignment ✨
- **75-89%**: Excellent - minor refinements
- **60-74%**: Good - focus on adjustments
- **Below 60%**: Needs work - address critical issues

## Technology Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **ML**: TensorFlow.js, MoveNet Pose Detection
- **Backend**: Flask (Python)
- **Deployment**: Render

## Project Structure

```
model/
├── index.html          # Main application UI
├── app.js              # Pose detection & analysis logic
├── server.py           # Flask backend
├── requirements.txt    # Python dependencies
├── Procfile           # Render deployment config
├── runtime.txt        # Python version
├── training_data.json # Session history (auto-generated)
└── README.md          # This file
```

## API Endpoints

- `GET /` - Main application
- `POST /api/save-session` - Save training session
- `GET /api/get-history` - Get training history
- `GET /api/stats` - Get overall statistics

## Training Tips

1. **Lighting**: Ensure good lighting for better detection
2. **Distance**: Stand 6-8 feet from camera
3. **Full Body**: Keep entire body visible in frame
4. **Camera Height**: Position at chest level
5. **Practice**: Aim for 70%+ score consistently

## Customization

### Add Reference Image
Replace the placeholder in `index.html`:
```html
<img src="your-tadasana-image.jpg" alt="Tadasana Reference">
```

### Adjust Sensitivity
Modify thresholds in `app.js`:
```javascript
const minConfidence = 0.3;  // Keypoint confidence
const angleThreshold = 165; // Knee straightness
```

## Browser Compatibility

- Chrome/Edge: ✅ Recommended
- Firefox: ✅ Supported
- Safari: ✅ Supported (iOS 14.5+)

## License

MIT License - feel free to use for your own training!

## Author

**Majenayu**
- GitHub: [@Majenayu](https://github.com/Majenayu)

## Acknowledgments

- TensorFlow.js team for pose detection models
- Google MoveNet for fast pose estimation
- Yoga community for pose guidance

---

**Namaste** 🙏
