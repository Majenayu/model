// Tadasana AI Trainer - SUNDAY Platform Integration
// Real-time pose detection and correction for Mountain Pose

// Global Variables
let detector = null;
let videoStream = null;
let animationFrameId = null;
let poseTimer = 0;
let timerInterval = null;
let sessionData = {
    attempts: 0,
    scores: [],
    totalTime: 0,
    bestScore: 0
};

// TTS State
let ttsEnabled = false;
let isSpeaking = false;

// Pose Analysis Variables
let suggestionBuffer = [];
const BUFFER_SIZE = 15;
let stableSuggestion = null;
let correctionCounter = 0;
let scoreHistory = [];
let poseScore = 100;
let correctionHistory = [];

// MoveNet Configuration
const keypointIndices = {
    'nose': 0, 'left_eye': 1, 'right_eye': 2, 'left_ear': 3, 'right_ear': 4,
    'left_shoulder': 5, 'right_shoulder': 6, 'left_elbow': 7, 'right_elbow': 8,
    'left_wrist': 9, 'right_wrist': 10, 'left_hip': 11, 'right_hip': 12,
    'left_knee': 13, 'right_knee': 14, 'left_ankle': 15, 'right_ankle': 16
};

const MIN_CONFIDENCE = 0.3;

const SKELETON_CONNECTIONS = [
    [0, 1], [0, 2], [1, 3], [2, 4], // Head/Face
    [5, 6], // Shoulders
    [5, 7], [7, 9], // Left arm
    [6, 8], [8, 10], // Right arm
    [5, 11], [6, 12], // Torso upper
    [11, 12], // Torso lower/Hips
    [11, 13], [13, 15], // Left leg
    [12, 14], [14, 16] // Right leg
];

// Initialize Application
window.addEventListener('load', () => {
    console.log('SUNDAY Tadasana AI Trainer - Initializing...');
    setupEventListeners();
});

function setupEventListeners() {
    const startBtn = document.getElementById('start-ar-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startARAssessment);
    }
}

// Start AR Assessment
async function startARAssessment() {
    const video = document.getElementById('video-feed');
    const canvas = document.getElementById('ar-canvas');
    const ctx = canvas.getContext('2d');
    const statusDiv = document.getElementById('camera-status');
    const statusText = document.getElementById('status-text');
    const errorText = document.getElementById('error-message');
    const feedbackArea = document.getElementById('feedback-area');
    const startBtn = document.getElementById('start-ar-btn');

    const updateStatus = (message, isError = false) => {
        statusText.textContent = message;
        if (isError) {
            errorText.textContent = message;
            errorText.classList.remove('hidden');
            statusText.classList.add('hidden');
        } else {
            errorText.classList.add('hidden');
            statusText.classList.remove('hidden');
        }
        statusDiv.classList.remove('hidden');
    };

    updateStatus("Loading MoveNet model...");

    // Clean up previous session
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }

    // Load Model
    if (!detector) {
        try {
            const model = poseDetection.SupportedModels.MoveNet;
            const detectorConfig = {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            };
            detector = await poseDetection.createDetector(model, detectorConfig);
            updateStatus("Model loaded. Requesting camera access...");
        } catch (e) {
            updateStatus(`Failed to load MoveNet model: ${e.message}`, true);
            console.error(e);
            return;
        }
    }

    // Get Camera Stream
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = videoStream;
        
        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Show feedback area and hide status
            statusDiv.classList.add('hidden');
            feedbackArea.style.display = 'block';
            startBtn.style.display = 'none';
            
            // Reset session data
            poseScore = 100;
            scoreHistory = [];
            correctionHistory = [];
            updateScore(100);
            startTimer();
            
            // Start detection loop
            poseDetectionFrame(video, ctx, detector);
        };
    } catch (err) {
        console.error("Camera access error:", err);
        updateStatus("Permission denied or camera is in use. Please enable camera access.", true);
    }
}

// Main pose detection loop
async function poseDetectionFrame(video, ctx, detector) {
    animationFrameId = requestAnimationFrame(() => poseDetectionFrame(video, ctx, detector));

    if (detector && video.readyState === 4) {
        const poses = await detector.estimatePoses(video);
        
        // Clear canvas
        ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
        
        if (poses.length > 0) {
            const pose = poses[0];
            const keypoints = pose.keypoints;
            
            // Analyze Tadasana
            let corrections = checkTadasana(keypoints);
            let affectedKeypoints = new Set();
            
            corrections.forEach(c => {
                if (c.affected) {
                    c.affected.forEach(kpName => affectedKeypoints.add(kpName));
                }
            });

            // Stabilized feedback
            correctionCounter++;
            if (correctionCounter >= BUFFER_SIZE) {
                stableSuggestion = corrections.length > 0 ? corrections[0] : { message: "Perfect Tadasana! Hold this pose.", color: 'green' };
                correctionCounter = 0;
            }

            const displayCorrection = stableSuggestion || corrections[0] || { message: "Analyzing pose...", color: 'gray' };
            updateFeedback(displayCorrection);

            // Calculate score
            let frameScore = calculateScore(corrections);
            scoreHistory.push(frameScore);
            if (scoreHistory.length > 30) {
                scoreHistory.shift();
            }
            
            poseScore = scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length;
            updateScore(poseScore);
            updateStatus(poseScore);

            // Log corrections periodically
            if (correctionCounter % 200 === 0) {
                logCorrections(corrections);
                if (ttsEnabled && corrections.length > 0) {
                    speakCorrection(corrections[0].message);
                }
            }

            // Draw pose
            drawKeypoints(keypoints, ctx, affectedKeypoints, corrections);
            drawSkeleton(keypoints, ctx, affectedKeypoints, corrections);
            drawScore(ctx, poseScore, video.videoWidth, video.videoHeight);
        } else {
            updateFeedback({ message: "No person detected. Stand further back or adjust lighting.", color: 'red' });
        }
    }
}

// Tadasana Analysis Function
function checkTadasana(keypoints) {
    const getPoint = (name) => {
        const kp = keypoints.find(k => k.name === name);
        if (!kp || kp.score < MIN_CONFIDENCE) return null;
        return { x: kp.x, y: kp.y };
    };

    const leftHip = getPoint('left_hip');
    const leftKnee = getPoint('left_knee');
    const leftAnkle = getPoint('left_ankle');
    const rightHip = getPoint('right_hip');
    const rightKnee = getPoint('right_knee');
    const rightAnkle = getPoint('right_ankle');
    const leftShoulder = getPoint('left_shoulder');
    const rightShoulder = getPoint('right_shoulder');
    const leftElbow = getPoint('left_elbow');
    const rightElbow = getPoint('right_elbow');
    const nose = getPoint('nose');
    const leftWrist = getPoint('left_wrist');
    const rightWrist = getPoint('right_wrist');

    let corrections = [];

    // Global visibility check
    if (!leftHip || !rightHip || !leftShoulder || !rightShoulder || !nose) {
        return [{ message: "Ensure your full body is visible in the frame.", affected: ['nose', 'left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'], color: 'red', priority: 1 }];
    }

    // 1. Foot spacing (hip-width apart)
    if (leftAnkle && rightAnkle) {
        const feetDistance = Math.abs(leftAnkle.x - rightAnkle.x);
        const hipWidth = Math.abs(leftHip.x - rightHip.x);
        const idealFeetDistance = Math.max(40, hipWidth * 0.9);
        const tolerance = 20;
        
        if (feetDistance < idealFeetDistance - tolerance) {
            corrections.push({ message: "🔴 Feet: step wider apart for stable foundation (hip-width)", affected: ['left_ankle', 'right_ankle'], color: 'red', priority: 1 });
        } else if (feetDistance > idealFeetDistance + tolerance + 15) {
            corrections.push({ message: "🔴 Feet: step closer together, align under hips", affected: ['left_ankle', 'right_ankle'], color: 'red', priority: 1 });
        }
    }

    // 2. Weight distribution
    if (leftAnkle && rightAnkle) {
        const ankleLevelDiff = Math.abs(leftAnkle.y - rightAnkle.y);
        if (ankleLevelDiff > 12) {
            corrections.push({ message: "🔴 Balance: distribute weight evenly on both feet", affected: ['left_ankle', 'right_ankle'], color: 'red', priority: 1 });
        }
    }

    // 3. Knee straightness
    if (leftHip && leftKnee && leftAnkle) {
        const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
        if (leftKneeAngle < 165) {
            corrections.push({ message: `🔴 Left leg: engage quadriceps, straighten knee (${Math.round(leftKneeAngle)}°)`, affected: ['left_hip', 'left_knee', 'left_ankle'], color: 'red', priority: 1 });
        }
    }

    if (rightHip && rightKnee && rightAnkle) {
        const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
        if (rightKneeAngle < 165) {
            corrections.push({ message: `🔴 Right leg: engage quadriceps, straighten knee (${Math.round(rightKneeAngle)}°)`, affected: ['right_hip', 'right_knee', 'right_ankle'], color: 'red', priority: 1 });
        }
    }

    // 4. Hip alignment
    if (leftHip && rightHip) {
        const hipHeightDiff = Math.abs(leftHip.y - rightHip.y);
        if (hipHeightDiff > 20) {
            const higherSide = leftHip.y < rightHip.y ? "left" : "right";
            corrections.push({ message: `🔴 Pelvis: level hips, lower ${higherSide} hip slightly`, affected: ['left_hip', 'right_hip'], color: 'red', priority: 1 });
        }
    }

    // 5. Spinal alignment
    if (leftShoulder && rightShoulder && leftHip && rightHip) {
        const avgShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
        const avgHipX = (leftHip.x + rightHip.x) / 2;
        const spinalAlignment = Math.abs(avgShoulderX - avgHipX);
        
        if (spinalAlignment > 25) {
            if (avgShoulderX < avgHipX) {
                corrections.push({ message: "🔴 Spine: bring chest forward, shoulders over hips", affected: ['left_shoulder', 'right_shoulder'], color: 'red', priority: 1 });
            } else {
                corrections.push({ message: "🔴 Spine: draw shoulders back over hips", affected: ['left_shoulder', 'right_shoulder'], color: 'red', priority: 1 });
            }
        }
    }

    // 6. Shoulder alignment
    if (leftShoulder && rightShoulder) {
        const shoulderHeightDiff = Math.abs(leftShoulder.y - rightShoulder.y);
        if (shoulderHeightDiff > 20) {
            const higherShoulder = leftShoulder.y < rightShoulder.y ? "left" : "right";
            corrections.push({ message: `🟡 Shoulders: relax ${higherShoulder} shoulder down`, affected: ['left_shoulder', 'right_shoulder'], color: 'yellow', priority: 2 });
        }
    }

    // 7. Head alignment
    if (nose && leftShoulder && rightShoulder) {
        const avgShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
        const headAlignment = Math.abs(nose.x - avgShoulderX);
        if (headAlignment > 35) {
            corrections.push({ message: "🔴 Head: center over shoulders, neutral neck", affected: ['nose'], color: 'red', priority: 1 });
        }
    }

    // Sort by priority and limit to top 3
    corrections.sort((a, b) => (a.priority || 5) - (b.priority || 5));
    if (corrections.length > 3) {
        corrections = corrections.slice(0, 3);
    }

    // Positive reinforcement
    if (corrections.length === 0) {
        corrections.push({ message: "✨ Perfect Tadasana! Feel the mountain's strength. Breathe deeply.", affected: [], color: 'green', priority: 0 });
    }

    return corrections;
}

// Calculate angle between three points
function calculateAngle(A, B, C) {
    if (!A || !B || !C) return 180;
    
    const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    const BC = Math.sqrt(Math.pow(C.x - B.x, 2) + Math.pow(C.y - B.y, 2));
    const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
    
    if (AB === 0 || BC === 0) return 180;
    
    const cosAngle = (Math.pow(AB, 2) + Math.pow(BC, 2) - Math.pow(AC, 2)) / (2 * AB * BC);
    const clampedCosAngle = Math.max(-1, Math.min(1, cosAngle));
    const angleRad = Math.acos(clampedCosAngle);
    return (angleRad * 180) / Math.PI;
}

// Calculate score based on corrections
function calculateScore(corrections) {
    let frameScore = 100;
    
    corrections.forEach(corr => {
        const priority = corr.priority || 5;
        if (corr.color === 'red') {
            if (priority === 1) {
                frameScore -= 25; // Critical issues
            } else {
                frameScore -= 15; // Major issues
            }
        } else if (corr.color === 'yellow') {
            if (priority <= 2) {
                frameScore -= 10; // Important refinements
            } else {
                frameScore -= 6; // Minor issues
            }
        } else if (corr.color === 'green') {
            frameScore = Math.min(100, frameScore + 8); // Bonus for perfect
        }
    });
    
    return Math.max(0, Math.min(100, frameScore));
}

// Update UI functions
function updateScore(score) {
    const scoreElement = document.getElementById('pose-score');
    const scoreBar = document.getElementById('score-bar');
    
    if (scoreElement && scoreBar) {
        scoreElement.textContent = Math.round(score) + '%';
        scoreBar.style.width = `${Math.max(0, Math.min(100, score))}%`;
        
        // Change color based on score
        if (score >= 85) {
            scoreBar.className = 'bg-green-400 h-2 rounded-full transition-all duration-500';
        } else if (score >= 70) {
            scoreBar.className = 'bg-yellow-400 h-2 rounded-full transition-all duration-500';
        } else {
            scoreBar.className = 'bg-red-400 h-2 rounded-full transition-all duration-500';
        }
    }
    
    // Update session data
    sessionData.scores.push(score);
    if (score > sessionData.bestScore) {
        sessionData.bestScore = score;
    }
}

function updateStatus(score) {
    const statusElement = document.getElementById('pose-status');
    if (statusElement) {
        if (score >= 90) {
            statusElement.textContent = '🌟 Perfect!';
        } else if (score >= 75) {
            statusElement.textContent = '✨ Excellent';
        } else if (score >= 60) {
            statusElement.textContent = '👍 Good';
        } else {
            statusElement.textContent = '🔧 Needs Work';
        }
    }
}

function updateFeedback(correction) {
    const feedbackText = document.getElementById('current-feedback-text');
    if (feedbackText) {
        feedbackText.textContent = correction.message;
        
        // Update color
        feedbackText.classList.remove('text-green-400', 'text-yellow-400', 'text-red-400', 'text-gray-400');
        if (correction.color === 'red') {
            feedbackText.classList.add('text-red-400');
        } else if (correction.color === 'yellow') {
            feedbackText.classList.add('text-yellow-400');
        } else if (correction.color === 'green') {
            feedbackText.classList.add('text-green-400');
        } else {
            feedbackText.classList.add('text-gray-400');
        }
    }
}

function logCorrections(corrections) {
    if (!correctionHistory) correctionHistory = [];
    const correctionLog = document.getElementById('correction-log');
    if (!correctionLog) return;

    corrections.forEach(corr => {
        const corrText = corr.message;
        const lastCorr = correctionHistory[correctionHistory.length - 1];
        
        if (!lastCorr || lastCorr !== corrText) {
            correctionHistory.push(corrText);
            if (correctionHistory.length > 5) {
                correctionHistory.shift();
            }
            
            const logHtml = '<p class="text-xs text-gray-500 font-semibold mb-2">Correction Log & Suggestions:</p>' +
                correctionHistory.map((msg, idx) => {
                    let icon = '•';
                    let colorClass = 'text-gray-400';
                    if (msg.includes('Perfect') || msg.includes('✨')) {
                        icon = '✓';
                        colorClass = 'text-green-400';
                    } else if (msg.includes('🔴')) {
                        icon = '✗';
                        colorClass = 'text-red-400';
                    } else if (msg.includes('🟡')) {
                        icon = '⚠';
                        colorClass = 'text-yellow-400';
                    }
                    return `<p class="text-xs ${colorClass} pl-2"><span class="font-bold">${icon}</span> ${msg}</p>`;
                }).join('');
            
            correctionLog.innerHTML = logHtml;
            correctionLog.scrollTop = correctionLog.scrollHeight;
        }
    });
}

// Drawing functions
function drawKeypoints(keypoints, ctx, affectedKeypoints, corrections) {
    if (!keypoints || !ctx) return;
    
    keypoints.forEach((keypoint, index) => {
        if (keypoint.score > MIN_CONFIDENCE) {
            const x = keypoint.x;
            const y = keypoint.y;
            
            let fillColor = '#42A5F5';
            let strokeColor = '#FFFFFF';
            let radius = 5;
            
            const keypointName = Object.keys(keypointIndices).find(name => keypointIndices[name] === index);
            
            if (keypointName && affectedKeypoints.has(keypointName)) {
                const corr = corrections.find(c => c.affected && c.affected.includes(keypointName));
                if (corr) {
                    if (corr.color === 'red') {
                        fillColor = '#EF4444';
                        strokeColor = '#FCA5A5';
                        radius = 7;
                    } else if (corr.color === 'yellow') {
                        fillColor = '#F59E0B';
                        strokeColor = '#FCD34D';
                        radius = 6;
                    } else if (corr.color === 'green') {
                        fillColor = '#10B981';
                        strokeColor = '#6EE7B7';
                        radius = 6;
                    }
                }
            }
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

function drawSkeleton(keypoints, ctx, affectedKeypoints, corrections) {
    if (!keypoints || !ctx) return;
    
    ctx.lineWidth = 3;
    
    SKELETON_CONNECTIONS.forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];
        
        if (kp1 && kp2 && kp1.score > MIN_CONFIDENCE && kp2.score > MIN_CONFIDENCE) {
            let lineColor = '#1E88E5';
            
            const kp1Name = Object.keys(keypointIndices).find(name => keypointIndices[name] === i);
            const kp2Name = Object.keys(keypointIndices).find(name => keypointIndices[name] === j);
            
            if (affectedKeypoints.has(kp1Name) || affectedKeypoints.has(kp2Name)) {
                const relevantCorrections = corrections.filter(c =>
                    c.affected && (c.affected.includes(kp1Name) || c.affected.includes(kp2Name)));
                
                if (relevantCorrections.some(c => c.color === 'red')) {
                    lineColor = '#EF4444';
                } else if (relevantCorrections.some(c => c.color === 'yellow')) {
                    lineColor = '#F59E0B';
                } else if (relevantCorrections.some(c => c.color === 'green')) {
                    lineColor = '#10B981';
                }
            }
            
            ctx.strokeStyle = lineColor;
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.stroke();
        }
    });
}

function drawScore(ctx, score, width, height) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    if (score >= 85) {
        ctx.fillStyle = '#10B981';
    } else if (score >= 70) {
        ctx.fillStyle = '#FFEB3B';
    } else {
        ctx.fillStyle = '#EF4444';
    }
    
    ctx.fillText(Math.round(score) + '%', -width + 20, 20);
    ctx.restore();
}

// Timer functions
function startTimer() {
    timerInterval = setInterval(() => {
        poseTimer++;
        sessionData.totalTime++;
        const timerElement = document.getElementById('pose-timer');
        if (timerElement) {
            timerElement.textContent = poseTimer + 's';
        }
    }, 1000);
}

// TTS functions
function toggleTTS() {
    ttsEnabled = !ttsEnabled;
    const ttsBtn = document.getElementById('tts-toggle-btn');
    const ttsIcon = document.getElementById('tts-icon');
    const ttsText = document.getElementById('tts-status-text');
    
    if (ttsEnabled) {
        ttsIcon.classList.remove('text-gray-400');
        ttsIcon.classList.add('text-accent', 'animate-pulse');
        ttsText.textContent = 'Voice Guide On';
        ttsBtn.classList.remove('bg-gray-700');
        ttsBtn.classList.add('bg-accent/20', 'border-2', 'border-accent');
    } else {
        ttsIcon.classList.remove('text-accent', 'animate-pulse');
        ttsIcon.classList.add('text-gray-400');
        ttsText.textContent = 'Voice Guide Off';
        ttsBtn.classList.remove('bg-accent/20', 'border-2', 'border-accent');
        ttsBtn.classList.add('bg-gray-700');
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        isSpeaking = false;
    }
}

function speakCorrection(message, force = false) {
    if (!('speechSynthesis' in window)) {
        console.warn('Text-to-Speech not supported');
        return;
    }
    
    if (!force && (isSpeaking || window.speechSynthesis.speaking)) {
        return;
    }
    
    if (force) {
        window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';
    
    utterance.onstart = () => { isSpeaking = true; };
    utterance.onend = () => { isSpeaking = false; };
    utterance.onerror = (event) => {
        console.error('TTS Error:', event);
        isSpeaking = false;
    };
    
    window.speechSynthesis.speak(utterance);
}

// Stop AR Assessment
function stopARAssessment() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Reset UI
    const feedbackArea = document.getElementById('feedback-area');
    const startBtn = document.getElementById('start-ar-btn');
    const statusDiv = document.getElementById('camera-status');
    
    if (feedbackArea) feedbackArea.style.display = 'none';
    if (startBtn) startBtn.style.display = 'block';
    if (statusDiv) statusDiv.classList.add('hidden');
    
    // Save session data
    saveSession();
    
    console.log("AR assessment stopped.");
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