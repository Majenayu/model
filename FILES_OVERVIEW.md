# Project Files Overview

Complete list of all files in the Tadasana AI Trainer project with descriptions.

## Core Application Files

### 1. `index.html` (Main Application)
**Purpose**: Frontend user interface
**Size**: ~150 lines
**Key Features**:
- Responsive layout with Tailwind CSS
- Video feed and canvas overlay
- Reference image display
- Real-time feedback panels
- Session statistics dashboard
- Mobile-optimized design

**Dependencies**:
- TensorFlow.js 3.13.0
- TensorFlow Pose Detection 2.0.0
- Tailwind CSS (CDN)

---

### 2. `app.js` (AI Logic)
**Purpose**: Pose detection and analysis
**Size**: ~250 lines
**Key Features**:
- MoveNet model initialization
- Real-time pose detection loop
- 20-point Tadasana validation
- Angle calculation algorithms
- Skeleton drawing on canvas
- Score calculation and feedback
- Session data tracking
- Auto-save functionality

**Main Functions**:
- `init()` - Initialize application
- `loadModel()` - Load TensorFlow model
- `startCamera()` - Access webcam
- `detectPose()` - Main detection loop
- `analyzeTadasana()` - Pose validation
- `calculateAngle()` - Angle computation
- `drawSkeleton()` - Visual overlay
- `updateUI()` - Update interface

---

### 3. `server.py` (Backend)
**Purpose**: Flask web server and API
**Size**: ~80 lines
**Key Features**:
- Static file serving
- Session data storage
- Training history API
- Statistics aggregation
- CORS enabled

**API Endpoints**:
- `GET /` - Serve main app
- `POST /api/save-session` - Save training data
- `GET /api/get-history` - Get all sessions
- `GET /api/stats` - Get aggregated stats

---

## Deployment Files

### 4. `requirements.txt`
**Purpose**: Python dependencies
**Contents**:
```
Flask==3.0.0
flask-cors==4.0.0
gunicorn==21.2.0
```

---

### 5. `Procfile`
**Purpose**: Render deployment configuration
**Contents**:
```
web: gunicorn server:app
```

---

### 6. `runtime.txt`
**Purpose**: Specify Python version
**Contents**:
```
python-3.11.0
```

---

### 7. `.gitignore`
**Purpose**: Exclude files from Git
**Excludes**:
- Python cache files
- Virtual environments
- Training data (local only)
- System files

---

## Documentation Files

### 8. `README.md` (Main Documentation)
**Purpose**: Project overview and introduction
**Sections**:
- Project description
- Features overview
- Quick start guide
- Technology stack
- Deployment instructions
- Usage guide
- API documentation
- Troubleshooting

**Target Audience**: Developers and users

---

### 9. `QUICK_START.md` (5-Minute Guide)
**Purpose**: Get started immediately
**Sections**:
- Installation (30 seconds)
- Running locally (1 minute)
- First training session (3 minutes)
- Deployment (5 minutes)
- Common issues

**Target Audience**: New users wanting fast setup

---

### 10. `SETUP.md` (Detailed Setup)
**Purpose**: Comprehensive installation guide
**Sections**:
- Prerequisites
- Local setup (Windows/Mac/Linux)
- GitHub configuration
- Render deployment
- Adding reference image
- Troubleshooting
- Testing checklist
- Browser compatibility

**Target Audience**: Users needing detailed instructions

---

### 11. `DEPLOY.md` (Deployment Guide)
**Purpose**: Step-by-step deployment
**Sections**:
- GitHub push instructions
- Render configuration
- Environment variables
- Custom domain setup
- Monitoring
- Updates and maintenance

**Target Audience**: Users deploying to production

---

### 12. `TRAINING_GUIDE.md` (User Manual)
**Purpose**: How to use the trainer effectively
**Sections**:
- What is Tadasana
- Benefits of the pose
- How to use the app
- Understanding feedback
- 20-point validation checklist
- Common mistakes and fixes
- Training progression (4 weeks)
- Breathing techniques
- Advanced variations
- Progress tracking tips

**Target Audience**: Yoga practitioners

---

### 13. `PROJECT_SUMMARY.md` (Technical Overview)
**Purpose**: Comprehensive technical documentation
**Sections**:
- Architecture overview
- Validation system details
- API specifications
- Performance metrics
- Use cases
- Future enhancements
- Customization guide
- Data collection notes

**Target Audience**: Developers and contributors

---

### 14. `DEPLOYMENT_CHECKLIST.md` (QA Checklist)
**Purpose**: Ensure successful deployment
**Sections**:
- Pre-deployment tests
- GitHub setup steps
- Render configuration
- Post-deployment testing
- Cross-browser testing
- Performance tests
- Monitoring tasks
- Troubleshooting guide

**Target Audience**: Deployers and QA testers

---

### 15. `FILES_OVERVIEW.md` (This File)
**Purpose**: Document all project files
**Sections**:
- Core application files
- Deployment files
- Documentation files
- Utility files
- Asset files

**Target Audience**: Developers and maintainers

---

## Utility Files

### 16. `start.sh` (Linux/Mac Startup)
**Purpose**: Quick start script for Unix systems
**Actions**:
- Install dependencies
- Start Flask server
- Display access URL

**Usage**: `./start.sh`

---

### 17. `start.bat` (Windows Startup)
**Purpose**: Quick start script for Windows
**Actions**:
- Install dependencies
- Start Flask server
- Display access URL

**Usage**: `start.bat`

---

## Asset Files

### 18. `tadasana-reference.jpg` (Reference Image)
**Purpose**: Visual reference for correct pose
**Status**: Placeholder (user should replace)
**Recommended**:
- Resolution: 800x1200px minimum
- Format: JPG or PNG
- Size: <500KB
- Content: Clear Tadasana demonstration

**Fallback**: HTML includes SVG placeholder

---

## Auto-Generated Files

### 19. `training_data.json` (Session Storage)
**Purpose**: Store training session history
**Generated**: Automatically by server
**Contents**:
```json
{
  "sessions": [
    {
      "timestamp": "2026-02-07T10:30:00",
      "bestScore": 85,
      "avgScore": 78,
      "attempts": 15,
      "totalTime": 450
    }
  ]
}
```

**Note**: Excluded from Git (.gitignore)

---

## File Statistics

### Total Files: 19
- **Core Application**: 3 files
- **Deployment**: 4 files
- **Documentation**: 8 files
- **Utilities**: 2 files
- **Assets**: 1 file
- **Auto-generated**: 1 file

### Total Lines of Code
- **JavaScript**: ~250 lines
- **Python**: ~80 lines
- **HTML**: ~150 lines
- **Total Code**: ~480 lines
- **Documentation**: ~2,000 lines

### File Sizes (Approximate)
- **Code Files**: ~50 KB
- **Documentation**: ~150 KB
- **Total**: ~200 KB (excluding dependencies)

---

## File Dependencies

```
index.html
├── app.js (required)
├── TensorFlow.js (CDN)
├── Pose Detection (CDN)
└── Tailwind CSS (CDN)

server.py
├── requirements.txt (dependencies)
└── training_data.json (generated)

Deployment
├── Procfile (Render)
├── runtime.txt (Render)
└── requirements.txt (dependencies)
```

---

## File Relationships

```
User Flow:
1. User opens index.html
2. Browser loads app.js
3. app.js loads TensorFlow models
4. User clicks "Start Camera"
5. app.js detects pose
6. app.js sends data to server.py
7. server.py saves to training_data.json

Deployment Flow:
1. Developer pushes to GitHub
2. Render reads Procfile
3. Render checks runtime.txt
4. Render installs requirements.txt
5. Render runs gunicorn server:app
6. App is live!
```

---

## Essential Files (Minimum Required)

For the app to work, you MUST have:
1. ✅ `index.html`
2. ✅ `app.js`
3. ✅ `server.py`
4. ✅ `requirements.txt`

For deployment, you also need:
5. ✅ `Procfile`
6. ✅ `runtime.txt`

Everything else is optional but recommended!

---

## Optional Files

Can be removed without breaking functionality:
- All documentation files (.md)
- Startup scripts (.sh, .bat)
- Reference image (has fallback)
- .gitignore (but recommended)

---

## File Modification Guide

### Frequently Modified
- `app.js` - Adjust validation logic
- `index.html` - Change UI/styling
- `tadasana-reference.jpg` - Update reference

### Occasionally Modified
- `server.py` - Add API endpoints
- `requirements.txt` - Update dependencies
- `README.md` - Update documentation

### Rarely Modified
- `Procfile` - Only if changing server
- `runtime.txt` - Only for Python version
- `.gitignore` - Only for new exclusions

---

## Backup Recommendations

### Critical Files (Backup Always)
- `app.js` - Core logic
- `server.py` - Backend
- `index.html` - Frontend
- `training_data.json` - User data

### Important Files (Backup Regularly)
- All documentation
- Reference image
- Configuration files

### Auto-Recoverable (No Backup Needed)
- Dependencies (reinstallable)
- Generated files
- Cache files

---

## Version Control

### Tracked by Git
- All code files
- All documentation
- Configuration files
- Asset files (except large binaries)

### Ignored by Git
- `__pycache__/`
- `*.pyc`
- `venv/`
- `training_data.json`
- `.DS_Store`

---

## File Checklist for Deployment

Before deploying, ensure you have:
- [ ] All 6 essential files
- [ ] At least README.md
- [ ] .gitignore configured
- [ ] No sensitive data in files
- [ ] All files saved
- [ ] No syntax errors

---

## Summary

This project consists of:
- **3 core files** that make the app work
- **4 deployment files** for hosting
- **8 documentation files** for users
- **2 utility scripts** for convenience
- **1 asset file** for reference
- **1 auto-generated file** for data

**Total: 19 files, ~200 KB, ready to deploy!**

---

**All files are documented and ready for GitHub and Render deployment! 🚀**
