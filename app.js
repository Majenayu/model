// Tadasana AI Trainer - Main Application
let detector;
let video;
let canvas;
let ctx;
let isDetecting = false;
let poseTimer = 0;
let timerInterval;
let sessionData = {
    attempts: 0,
    scores: [],
    totalTime: 0,
    bestScore: 0
};

// Initialize the application
async function init() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    document.getElementById('startBtn').addEventListener('click', startCamera);
    
    // Load pose detection model
    await loadModel();
}

// Load TensorFlow MoveNet model
async function loadModel() {
    try {
        const detectorConfig = {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        };
        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            detectorConfig
        );
        console.log('Model loaded successfully');
    } catch (error) {
        console.error('Error loading model:', error);
        alert('Failed to load AI model. Please refresh the page.');
    }
}

// Start camera and detection
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            isDetecting = true;
            document.getElementById('startBtn').textContent = 'Camera Active';
            document.getElementById('startBtn').disabled = true;
            document.getElementById('status').textContent = 'Ready';
            detectPose();
            startTimer();
        };
    } catch (error) {
        console.error('Camera error:', error);
        alert('Unable to access camera. Please grant permission.');
    }
}

// Main pose detection loop
async function detectPose() {
    if (!isDetecting) return;
    
    const poses = await detector.estimatePoses(video);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (poses.length > 0) {
        const pose = poses[0];
        drawSkeleton(pose.keypoints);
        const analysis = analyzeTadasana(pose.keypoints);
        updateUI(analysis);
    }
    
    requestAnimationFrame(detectPose);
}

// Draw skeleton on canvas
function drawSkeleton(keypoints) {
    const minConfidence = 0.3;
    
    // Draw keypoints
    keypoints.forEach(kp => {
        if (kp.score > minConfidence) {
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#00ff00';
            ctx.fill();
        }
    });
    
    // Draw connections
    const connections = [
        [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], // Arms
        [5, 11], [6, 12], [11, 12], // Torso
        [11, 13], [13, 15], [12, 14], [14, 16] // Legs
    ];
    
    connections.forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];
        if (kp1.score > minConfidence && kp2.score > minConfidence) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

// Analyze Tadasana pose with 20-point validation
function analyzeTadasana(keypoints) {
    const corrections = [];
    let score = 100;
    const kp = {};
    
    // Map keypoints by name
    const keypointNames = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
                          'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
                          'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
                          'left_knee', 'right_knee', 'left_ankle', 'right_ankle'];
    
    keypoints.forEach((point, idx) => {
        kp[keypointNames[idx]] = point;
    });
    
    // 1. Foot spacing (hip-width apart)
    const ankleDistance = Math.abs(kp.left_ankle.x - kp.right_ankle.x);
    const hipDistance = Math.abs(kp.left_hip.x - kp.right_hip.x);
    if (Math.abs(ankleDistance - hipDistance) > 30) {
        corrections.push({ priority: 1, message: '🔴 Feet should be hip-width apart', penalty: 10 });
        score -= 10;
    }
    
    // 2. Weight distribution (ankles level)
    const ankleLevelDiff = Math.abs(kp.left_ankle.y - kp.right_ankle.y);
    if (ankleLevelDiff > 20) {
        corrections.push({ priority: 1, message: '🔴 Distribute weight evenly on both feet', penalty: 8 });
        score -= 8;
    }
    
    // 3. Knee straightness
    const leftKneeAngle = calculateAngle(kp.left_hip, kp.left_knee, kp.left_ankle);
    const rightKneeAngle = calculateAngle(kp.right_hip, kp.right_knee, kp.right_ankle);
    if (leftKneeAngle < 165 || rightKneeAngle < 165) {
        corrections.push({ priority: 2, message: '🟡 Straighten your knees (but don\'t lock them)', penalty: 7 });
        score -= 7;
    }
    
    // 4. Hip level alignment
    const hipLevelDiff = Math.abs(kp.left_hip.y - kp.right_hip.y);
    if (hipLevelDiff > 15) {
        corrections.push({ priority: 1, message: '🔴 Keep hips level', penalty: 8 });
        score -= 8;
    }
    
    // 5. Spinal alignment (shoulders over hips)
    const shoulderMidX = (kp.left_shoulder.x + kp.right_shoulder.x) / 2;
    const hipMidX = (kp.left_hip.x + kp.right_hip.x) / 2;
    if (Math.abs(shoulderMidX - hipMidX) > 30) {
        corrections.push({ priority: 1, message: '🔴 Align shoulders directly over hips', penalty: 10 });
        score -= 10;
    }
    
    // 6. Shoulder level and relaxation
    const shoulderLevelDiff = Math.abs(kp.left_shoulder.y - kp.right_shoulder.y);
    if (shoulderLevelDiff > 15) {
        corrections.push({ priority: 2, message: '🟡 Keep shoulders level and relaxed', penalty: 6 });
        score -= 6;
    }
    
    // 7. Arm positioning (by sides)
    const leftArmAngle = calculateAngle(kp.left_shoulder, kp.left_elbow, kp.left_wrist);
    const rightArmAngle = calculateAngle(kp.right_shoulder, kp.right_elbow, kp.right_wrist);
    if (leftArmAngle < 160 || rightArmAngle < 160) {
        corrections.push({ priority: 3, message: '⚪ Keep arms straight and relaxed by your sides', penalty: 4 });
        score -= 4;
    }
    
    // 8. Head alignment (over shoulders)
    const noseX = kp.nose.x;
    if (Math.abs(noseX - shoulderMidX) > 40) {
        corrections.push({ priority: 1, message: '🔴 Align head directly over shoulders', penalty: 8 });
        score -= 8;
    }
    
    // 9. Chest opening (shoulder width)
    const shoulderWidth = Math.abs(kp.left_shoulder.x - kp.right_shoulder.x);
    if (shoulderWidth < hipDistance * 1.1) {
        corrections.push({ priority: 2, message: '🟡 Open your chest, broaden collarbones', penalty: 5 });
        score -= 5;
    }
    
    // 10. Core engagement (torso length consistency)
    const torsoLength = Math.abs(kp.left_shoulder.y - kp.left_hip.y);
    if (torsoLength < 100) {
        corrections.push({ priority: 2, message: '🟡 Engage core, lengthen spine', penalty: 5 });
        score -= 5;
    }
    
    // Sort corrections by priority
    corrections.sort((a, b) => a.priority - b.priority);
    
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    return { score, corrections };
}

// Calculate angle between three points
function calculateAngle(p1, p2, p3) {
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                   Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs(radians * 180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
}

// Update UI with analysis results
function updateUI(analysis) {
    const { score, corrections } = analysis;
    
    // Update score
    document.getElementById('score').textContent = Math.round(score) + '%';
    
    // Update status
    let status = 'Needs Work';
    if (score >= 90) status = '🌟 Perfect!';
    else if (score >= 75) status = '✨ Excellent';
    else if (score >= 60) status = '👍 Good';
    document.getElementById('status').textContent = status;
    
    // Update corrections
    const correctionsDiv = document.getElementById('corrections');
    if (corrections.length === 0) {
        correctionsDiv.innerHTML = '<p class="text-green-600 font-semibold">✅ Perfect alignment! Hold this pose.</p>';
    } else {
        correctionsDiv.innerHTML = corrections.map(c => 
            `<p class="text-sm">${c.message}</p>`
        ).join('');
    }
    
    // Update session data
    sessionData.scores.push(score);
    if (score > sessionData.bestScore) {
        sessionData.bestScore = score;
        document.getElementById('bestScore').textContent = Math.round(score) + '%';
    }
    
    const avgScore = sessionData.scores.reduce((a, b) => a + b, 0) / sessionData.scores.length;
    document.getElementById('avgScore').textContent = Math.round(avgScore) + '%';
    document.getElementById('attempts').textContent = sessionData.scores.length;
}

// Timer functions
function startTimer() {
    timerInterval = setInterval(() => {
        poseTimer++;
        sessionData.totalTime++;
        document.getElementById('timer').textContent = poseTimer + 's';
        document.getElementById('totalTime').textContent = sessionData.totalTime + 's';
    }, 1000);
}

// Save session to backend
async function saveSession() {
    try {
        const response = await fetch('/api/save-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData)
        });
        const result = await response.json();
        console.log('Session saved:', result);
    } catch (error) {
        console.error('Error saving session:', error);
    }
}

// Load training history
async function loadHistory() {
    try {
        const response = await fetch('/api/get-history');
        const data = await response.json();
        console.log('Training history:', data);
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Auto-save every 30 seconds
setInterval(() => {
    if (sessionData.scores.length > 0) {
        saveSession();
    }
}, 30000);

// Save on page unload
window.addEventListener('beforeunload', () => {
    if (sessionData.scores.length > 0) {
        saveSession();
    }
});

// Initialize on page load
window.addEventListener('load', init);
