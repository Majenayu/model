from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import os
import json
from datetime import datetime

app = Flask(__name__, static_folder='.')
CORS(app)

# Store training data
TRAINING_DATA_FILE = 'training_data.json'

def load_training_data():
    if os.path.exists(TRAINING_DATA_FILE):
        with open(TRAINING_DATA_FILE, 'r') as f:
            return json.load(f)
    return {'sessions': []}

def save_training_data(data):
    with open(TRAINING_DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/save-session', methods=['POST'])
def save_session():
    try:
        session_data = request.json
        session_data['timestamp'] = datetime.now().isoformat()
        
        data = load_training_data()
        data['sessions'].append(session_data)
        save_training_data(data)
        
        return jsonify({'success': True, 'message': 'Session saved'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/get-history', methods=['GET'])
def get_history():
    try:
        data = load_training_data()
        return jsonify(data)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        data = load_training_data()
        sessions = data.get('sessions', [])
        
        if not sessions:
            return jsonify({
                'total_sessions': 0,
                'total_time': 0,
                'best_score': 0,
                'avg_score': 0
            })
        
        total_time = sum(s.get('totalTime', 0) for s in sessions)
        scores = [s.get('bestScore', 0) for s in sessions]
        
        return jsonify({
            'total_sessions': len(sessions),
            'total_time': total_time,
            'best_score': max(scores) if scores else 0,
            'avg_score': sum(scores) / len(scores) if scores else 0
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
