# SUNDAY - Tadasana AR Correction

## Overview
A web application for real-time yoga pose detection and correction, specifically for Tadasana (Mountain Pose). Uses TensorFlow.js MoveNet for pose estimation via the browser camera, with a Flask backend serving static files and storing session data.

## Project Architecture
- **Backend**: Python Flask server (`server.py`) serving static files and API endpoints
- **Frontend**: Single-page HTML (`index.html`) with vanilla JavaScript (`app.js`)
- **Pose Detection**: TensorFlow.js MoveNet (loaded via CDN)
- **Styling**: Tailwind CSS (loaded via CDN)
- **Data Storage**: JSON file (`training_data.json`) for session history

## Key Files
- `server.py` - Flask web server (port 5000)
- `index.html` - Main HTML page
- `app.js` - Pose detection and UI logic
- `requirements.txt` - Python dependencies (Flask, flask-cors, gunicorn)

## API Endpoints
- `GET /` - Serves main page
- `POST /api/save-session` - Save training session data
- `GET /api/get-history` - Get session history
- `GET /api/stats` - Get aggregate statistics

## Running
- Development: `python server.py` (runs on port 5000)
- Production: `gunicorn server:app --bind 0.0.0.0:5000`
