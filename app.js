/**
 * SUNDAY - Advanced AR Correction Engine
 * Focus: High-precision posture analysis and live feedback
 */

const SUNDAY = {
    // Configuration
    MIN_CONFIDENCE: 0.35,
    BUFFER_SIZE: 15, // Frames for stabilization
    ACCURACY_THRESHOLD: 70, // %
    
    // State
    detector: null,
    stream: null,
    animationId: null,
    isInitialised: false,
    ttsEnabled: false,
    
    // Live Session Metrics
    metrics: {
        accuracy: 0,
        bestAccuracy: 0,
        stability: 0,
        symmetry: 0,
        timer: 0,
        timerInterval: null
    },

    // Pose History & Stabilization
    history: {
        scores: [],
        suggestions: [],
        counter: 0,
        stableMessage: null
    },

    // UI Elements
    elements: {},

    /**
     * Initialize UI References and Event Listeners
     */
    init() {
        console.log("SUNDAY Engine: Initializing...");
        
        // Cache DOM Elements
        this.elements = {
            video: document.getElementById('video-feed'),
            canvas: document.getElementById('ar-canvas'),
            overlay: document.getElementById('camera-overlay'),
            overlayText: document.getElementById('overlay-text'),
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            accuracyValue: document.getElementById('accuracy-value'),
            accuracyBar: document.getElementById('accuracy-bar'),
            accuracyStatus: document.getElementById('accuracy-status'),
            mainSuggestion: document.getElementById('main-suggestion'),
            correctionList: document.getElementById('correction-list'),
            ttsToggle: document.getElementById('tts-toggle'),
            metricStability: document.getElementById('metric-stability'),
            metricSymmetry: document.getElementById('metric-symmetry'),
            metricTimer: document.getElementById('metric-timer'),
            metricBest: document.getElementById('metric-best')
        };

        // Event Listeners
        this.elements.startBtn.addEventListener('click', () => this.startSession());
        this.elements.stopBtn.addEventListener('click', () => this.stopSession());
        this.elements.ttsToggle.addEventListener('click', () => this.toggleTTS());

        // Initial Load of Model
        this.loadModel();
    },

    /**
     * Load MoveNet Model
     */
    async loadModel() {
        try {
            const detectorConfig = {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                enableSmoothing: true
            };
            this.detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
            
            this.elements.overlayText.textContent = "Vision Engine Ready";
            this.elements.startBtn.classList.remove('hidden');
        } catch (err) {
            console.error("SUNDAY Error: Model load failed", err);
            this.elements.overlayText.textContent = "Engine Fail: Refresh Page";
        }
    },

    /**
     * Start the AR Session
     */
    async startSession() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
            });
            
            this.elements.video.srcObject = this.stream;
            
            this.elements.video.onloadedmetadata = () => {
                this.elements.video.play();
                
                // Align Canvas
                this.elements.canvas.width = this.elements.video.videoWidth;
                this.elements.canvas.height = this.elements.video.videoHeight;
                
                // Hide Overlay
                this.elements.overlay.style.opacity = '0';
                setTimeout(() => this.elements.overlay.classList.add('hidden'), 500);
                
                // Reset Metrics
                this.resetMetrics();
                this.startTimer();
                
                // Start Vision Loop
                this.isInitialised = true;
                this.loop();
            };
        } catch (err) {
            console.error("SUNDAY Error: Camera denied", err);
            alert("Camera access is required for AR correction.");
        }
    },

    /**
     * Main Vision Loop
     */
    async loop() {
        if (!this.isInitialised) return;

        this.animationId = requestAnimationFrame(() => this.loop());

        if (this.detector && this.elements.video.readyState === 4) {
            const poses = await this.detector.estimatePoses(this.elements.video);
            const ctx = this.elements.canvas.getContext('2d');
            
            ctx.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);

            if (poses.length > 0) {
                const pose = poses[0];
                const keypoints = pose.keypoints;
                
                // 1. Biomechanical Analysis
                const analysis = this.analyzeTadasana(keypoints);
                
                // 2. Update UI & Metrics
                this.processAnalysis(analysis);
                
                // 3. Visuals
                this.draw(ctx, keypoints, analysis);
            } else {
                this.updateAccuracy(0, "Person not detected");
            }
        }
    },

    /**
     * Comprehensive Tadasana Posture Check
     */
    analyzeTadasana(keypoints) {
        const getPt = (name) => {
            const kp = keypoints.find(k => k.name === name);
            return (kp && kp.score > this.MIN_CONFIDENCE) ? kp : null;
        };

        const leftHip = getPt('left_hip'), rightHip = getPt('right_hip');
        const leftKnee = getPt('left_knee'), rightKnee = getPt('right_knee');
        const leftAnkle = getPt('left_ankle'), rightAnkle = getPt('right_ankle');
        const leftShoulder = getPt('left_shoulder'), rightShoulder = getPt('right_shoulder');
        const nose = getPt('nose');

        let corrections = [];
        let affected = new Set();
        let frameStability = 100;
        let frameSymmetry = 100;

        // Visibility Check
        if (!leftHip || !rightHip || !leftShoulder || !rightShoulder) {
            return { score: 0, status: "Body out of frame", corrections: [], affected: [], stability: 0, symmetry: 0 };
        }

        // 1. FOUNDATION: Foot and Ankle Alignment
        if (leftAnkle && rightAnkle) {
            const ankleDist = Math.abs(leftAnkle.x - rightAnkle.x);
            const hipDist = Math.abs(leftHip.x - rightHip.x);
            if (ankleDist < hipDist * 0.7) {
                corrections.push({ msg: "Widen stance slightly for stability", lvl: 'warn', pts: ['left_ankle', 'right_ankle'] });
            }
        }

        // 2. LEGS: Knee Straightness
        const checkKnee = (h, k, a, side) => {
            if (!h || !k || !a) return;
            const angle = this.calcAngle(h, k, a);
            if (angle < 165) {
                corrections.push({ msg: `Straighten ${side} knee`, lvl: 'err', pts: [`${side}_knee`] });
                frameStability -= 15;
            }
        };
        checkKnee(leftHip, leftKnee, leftAnkle, 'left');
        checkKnee(rightHip, rightKnee, rightAnkle, 'right');

        // 3. PELVIS: Level Hips
        const hipDiff = Math.abs(leftHip.y - rightHip.y);
        if (hipDiff > 25) {
            corrections.push({ msg: "Level your hips", lvl: 'err', pts: ['left_hip', 'right_hip'] });
            frameSymmetry -= 20;
        }

        // 4. TORSO: Shoulders over Hips
        const avgHipX = (leftHip.x + rightHip.x) / 2;
        const avgShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
        if (Math.abs(avgHipX - avgShoulderX) > 30) {
            corrections.push({ msg: "Align shoulders over hips", lvl: 'err', pts: ['left_shoulder', 'right_shoulder'] });
            frameStability -= 10;
        }

        // 5. HEAD: Centered
        if (nose) {
            const headOffset = Math.abs(nose.x - avgShoulderX);
            if (headOffset > 25) {
                corrections.push({ msg: "Center your head", lvl: 'warn', pts: ['nose'] });
                frameSymmetry -= 10;
            }
        }

        // Aggregate Affected Points
        corrections.forEach(c => c.pts.forEach(p => affected.add(p)));

        // Calculate Final Frame Score
        let score = 100;
        corrections.forEach(c => score -= (c.lvl === 'err' ? 15 : 7));
        score = Math.max(0, score);

        return {
            score,
            status: corrections.length === 0 ? "Perfect Alignment" : "Adjusting...",
            corrections,
            affected: Array.from(affected),
            stability: Math.max(0, frameStability),
            symmetry: Math.max(0, frameSymmetry)
        };
    },

    /**
     * Process frame analysis and update UI/Metrics
     */
    processAnalysis(analysis) {
        // Smoothing
        this.history.scores.push(analysis.score);
        if (this.history.scores.length > 20) this.history.scores.shift();
        this.metrics.accuracy = Math.round(this.history.scores.reduce((a, b) => a + b, 0) / this.history.scores.length);

        // Best Score Tracking
        if (this.metrics.accuracy > this.metrics.bestAccuracy) {
            this.metrics.bestAccuracy = this.metrics.accuracy;
            this.elements.metricBest.textContent = `${this.metrics.bestAccuracy}%`;
        }

        // Stability & Symmetry Updates
        this.elements.metricStability.textContent = `${analysis.stability}%`;
        this.elements.metricSymmetry.textContent = `${analysis.symmetry}%`;

        // Update Gauge
        this.updateAccuracy(this.metrics.accuracy, analysis.status);

        // Stabilized Suggestions
        this.history.counter++;
        if (this.history.counter >= this.BUFFER_SIZE) {
            this.history.counter = 0;
            this.updateSuggestions(analysis.corrections);
        }
    },

    /**
     * Update Accuracy UI
     */
    updateAccuracy(val, status) {
        this.elements.accuracyValue.textContent = val;
        this.elements.accuracyBar.style.width = `${val}%`;
        this.elements.accuracyStatus.textContent = status;
        
        // Color shifts
        if (val >= 85) this.elements.accuracyStatus.className = "mt-4 text-sm font-bold text-success uppercase tracking-tighter";
        else if (val >= 60) this.elements.accuracyStatus.className = "mt-4 text-sm font-bold text-accent uppercase tracking-tighter";
        else this.elements.accuracyStatus.className = "mt-4 text-sm font-bold text-red-500 uppercase tracking-tighter";
    },

    /**
     * Update Suggestions and Correction List
     */
    updateSuggestions(corrections) {
        const topCorr = corrections[0];
        const newMsg = topCorr ? topCorr.msg : "Focus on deep breaths. You're stable.";
        
        if (this.history.stableMessage !== newMsg) {
            this.history.stableMessage = newMsg;
            this.elements.mainSuggestion.textContent = newMsg;
            
            // Speak if TTS enabled
            if (this.ttsEnabled) this.speak(newMsg);
        }

        // List all corrections
        this.elements.correctionList.innerHTML = '';
        corrections.forEach(c => {
            const div = document.createElement('div');
            div.className = `flex items-center space-x-2 text-sm ${c.lvl === 'err' ? 'text-red-400' : 'text-yellow-400'}`;
            div.innerHTML = `<span class="font-bold">${c.lvl === 'err' ? '✗' : '⚠'}</span> <span>${c.msg}</span>`;
            this.elements.correctionList.appendChild(div);
        });
    },

    /**
     * Draw Pose and Skeleton
     */
    draw(ctx, keypoints, analysis) {
        const connections = [
            [5, 6], [5, 11], [6, 12], [11, 12], // Torso
            [5, 7], [7, 9], [6, 8], [8, 10], // Arms
            [11, 13], [13, 15], [12, 14], [14, 16] // Legs
        ];

        ctx.lineWidth = 3;
        
        // Draw Skeleton
        connections.forEach(([i, j]) => {
            const kp1 = keypoints[i], kp2 = keypoints[j];
            if (kp1.score > this.MIN_CONFIDENCE && kp2.score > this.MIN_CONFIDENCE) {
                const isAffected = analysis.affected.includes(kp1.name) || analysis.affected.includes(kp2.name);
                ctx.strokeStyle = isAffected ? 'rgba(239, 68, 68, 0.8)' : 'rgba(66, 165, 245, 0.6)';
                ctx.beginPath();
                ctx.moveTo(kp1.x, kp1.y);
                ctx.lineTo(kp2.x, kp2.y);
                ctx.stroke();
            }
        });

        // Draw Keypoints
        keypoints.forEach(kp => {
            if (kp.score > this.MIN_CONFIDENCE) {
                const isAffected = analysis.affected.includes(kp.name);
                ctx.fillStyle = isAffected ? '#EF4444' : '#42A5F5';
                ctx.beginPath();
                ctx.arc(kp.x, kp.y, isAffected ? 6 : 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    },

    /**
     * Utility: Calculate Angle (B as Vertex)
     */
    calcAngle(A, B, C) {
        const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
        const BC = Math.sqrt(Math.pow(C.x - B.x, 2) + Math.pow(C.y - B.y, 2));
        const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
        const cos = (Math.pow(AB, 2) + Math.pow(BC, 2) - Math.pow(AC, 2)) / (2 * AB * BC);
        return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
    },

    /**
     * Timer Management
     */
    startTimer() {
        this.metrics.timer = 0;
        this.metrics.timerInterval = setInterval(() => {
            if (this.metrics.accuracy >= this.ACCURACY_THRESHOLD) {
                this.metrics.timer++;
                this.elements.metricTimer.textContent = `${this.metrics.timer}s`;
            } else {
                this.metrics.timer = 0;
                this.elements.metricTimer.textContent = `0s`;
            }
        }, 1000);
    },

    /**
     * Stop Session and Cleanup
     */
    stopSession() {
        this.isInitialised = false;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.stream) this.stream.getTracks().forEach(t => t.stop());
        if (this.metrics.timerInterval) clearInterval(this.metrics.timerInterval);
        
        this.elements.overlay.classList.remove('hidden');
        this.elements.overlay.style.opacity = '1';
        this.elements.overlayText.textContent = "Session Complete";
        this.elements.startBtn.textContent = "Restart Assessment";
    },

    /**
     * Voice Guide Toggle
     */
    toggleTTS() {
        this.ttsEnabled = !this.ttsEnabled;
        const btn = this.elements.ttsToggle;
        const dot = btn.querySelector('span');
        
        if (this.ttsEnabled) {
            btn.classList.add('bg-primary/30');
            dot.classList.replace('left-1', 'left-7');
            dot.classList.replace('bg-gray-600', 'bg-primary');
            this.speak("Voice guide active");
        } else {
            btn.classList.remove('bg-primary/30');
            dot.classList.replace('left-7', 'left-1');
            dot.classList.replace('bg-primary', 'bg-gray-600');
            window.speechSynthesis.cancel();
        }
    },

    speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(text);
        ut.rate = 0.95;
        ut.pitch = 1.0;
        window.speechSynthesis.speak(ut);
    },

    resetMetrics() {
        this.metrics = { accuracy: 0, bestAccuracy: 0, stability: 0, symmetry: 0, timer: 0, timerInterval: null };
        this.elements.accuracyValue.textContent = '0';
        this.elements.metricBest.textContent = '0%';
        this.elements.metricTimer.textContent = '0s';
    }
};

// Start Engine on Load
window.addEventListener('DOMContentLoaded', () => SUNDAY.init());