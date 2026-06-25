/* ==========================================
   Space Attack: Game Engine & Systems Script
   ========================================== */

// Game Configuration & State
const state = {
        score: 0,
        missed: 0,
        timer: 60,
        highScore: 0,
        difficulty: 'Medium', // Easy, Medium, Hard
        isPaused: false,
        isPlaying: false,
        combo: 0,
        maxCombo: 0,
        lastKillTime: 0,
        destroyedCount: 0,
        totalSpawned: 0,
        achievementsUnlockedThisRun: [],
        activeJets: [],
        particles: [],
        floatingTexts: [],
        isMuted: false,
        isMemeMode: true,
        isFireModeActive: false
};

const gameDuration = 60;
const comboTimeoutDuration = 1500; // 1.5 seconds

// DOM References
const starfieldCanvas = document.getElementById('starfield-bg');
const starfieldCtx = starfieldCanvas.getContext('2d');

const welcomeModal = document.getElementById('welcome-modal');
const gameoverModal = document.getElementById('gameover-modal');
const pauseScreen = document.getElementById('pause-screen');
const attackField = document.querySelector('.attack-field');
const achievementToaster = document.getElementById('achievement-toaster');

// Header
const headerScore = document.getElementById('header-score');
const headerHighScore = document.getElementById('header-highscore');
const headerPauseBtn = document.getElementById('header-pause-btn');
const headerSoundBtn = document.getElementById('header-sound-btn');
const headerMemeBtn = document.getElementById('header-meme-btn');
const modalAudioBtn = document.getElementById('modal-audio-btn');
const modalMemeBtn = document.getElementById('modal-meme-btn');
const soundOnIcon = document.querySelector('.sound-on-icon');
const soundOffIcon = document.querySelector('.sound-off-icon');
const faaahSound = document.querySelector('.faaah-sound');

// HUD Panel
const hudDifficulty = document.getElementById('hud-difficulty');
const hudTimer = document.getElementById('hud-timer');
const timerCircle = document.querySelector('.progress-ring__circle');
const hudCombo = document.getElementById('hud-combo');
const hudComboFill = document.getElementById('hud-combo-fill');
const hudComboCard = document.getElementById('hud-combo-card');
const hudDestroyedCount = document.getElementById('hud-destroyed-count');
const hudMissedCount = document.getElementById('hud-missed-count');
const hudAccuracy = document.getElementById('hud-accuracy');
const shields = [
        document.getElementById('shield-1'),
        document.getElementById('shield-2'),
        document.getElementById('shield-3')
];
const shieldHealthLabel = document.getElementById('shield-health-label');

// Buttons
const startGameBtn = document.getElementById('start-game-btn');
const resumeBtn = document.getElementById('resume-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const gameoverRetryBtn = document.getElementById('gameover-retry-btn');
const gameoverMenuBtn = document.getElementById('gameover-menu-btn');

// Audio elements
const themeSound = document.querySelector('.theme-sound');
const jetDestroySound = document.querySelector('.destroy-sound');
const jetEscapeSound = document.querySelector('.jet-escape-sound');
const gameOverSound = document.querySelector('.game-over');
const gameWinSound = document.querySelector('.game-win');
const buttonClickSound = document.querySelector('.button-click-sound');

// Constants for radial timer ring
const radius = 50;
const circumference = 2 * Math.PI * radius;

// Achievement Configuration
const ACHIEVEMENTS = {
        first_kill: {
                id: 'first_kill',
                title: 'First Blood',
                desc: 'Destroyed your first enemy fighter jet.',
                icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2L2 22h20L12 2zm0 5l6 12H6l6-12z"/></svg>'
        },
        kill_10: {
                id: 'kill_10',
                title: 'Squad Decimator',
                desc: 'Destroyed 10 enemy fighters in a single mission.',
                icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 18c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>'
        },
        kill_25: {
                id: 'kill_25',
                title: 'Space Ace',
                desc: 'Destroyed 25 enemy fighters in a single mission.',
                icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'
        },
        perfect_win: {
                id: 'perfect_win',
                title: 'Perfect Defender',
                desc: 'Won a mission with 100% shield health.',
                icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 18c-3.37-.93-6-4.63-6-8.91V6.38l6-2.25 6 2.25v4.71c0 4.28-2.63 7.98-6 8.91z"/></svg>'
        },
        space_commander: {
                id: 'space_commander',
                title: 'Space Commander',
                desc: 'Achieved victory on Hard difficulty.',
                icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>'
        }
};

// ==========================================
// Twinkling Starfield Initialization
// ==========================================
let stars = [];
function initStarfield() {
        starfieldCanvas.width = window.innerWidth;
        starfieldCanvas.height = window.innerHeight;
        stars = [];
        const starCount = window.innerWidth < 600 ? 60 : 150;
        for (let i = 0; i < starCount; i++) {
                stars.push({
                        x: Math.random() * starfieldCanvas.width,
                        y: Math.random() * starfieldCanvas.height,
                        radius: Math.random() * 1.5 + 0.5,
                        alpha: Math.random(),
                        speed: Math.random() * 0.02 + 0.005,
                        twinkleDir: Math.random() > 0.5 ? 1 : -1
                });
        }
}

function updateAndDrawStarfield() {
        starfieldCtx.clearRect(0, 0, starfieldCanvas.width, starfieldCanvas.height);
        stars.forEach(star => {
                starfieldCtx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                starfieldCtx.beginPath();
                starfieldCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                starfieldCtx.fill();

                star.alpha += star.speed * star.twinkleDir;
                if (star.alpha >= 1) {
                        star.alpha = 1;
                        star.twinkleDir = -1;
                } else if (star.alpha <= 0.1) {
                        star.alpha = 0.1;
                        star.twinkleDir = 1;
                }
        });
}

// Background Animation Loop (Runs always)
function backgroundAnimationLoop() {
        updateAndDrawStarfield();
        requestAnimationFrame(backgroundAnimationLoop);
}

// ==========================================
// Event Listeners Setup
// ==========================================
window.addEventListener('resize', () => {
        starfieldCanvas.width = window.innerWidth;
        starfieldCanvas.height = window.innerHeight;
});

// Start background stars
initStarfield();
backgroundAnimationLoop();

// Sound button setup in header
headerSoundBtn.addEventListener('click', toggleMute);
headerPauseBtn.addEventListener('click', togglePause);
headerMemeBtn.addEventListener('click', toggleMemeMode);
modalAudioBtn.addEventListener('click', toggleMute);
modalMemeBtn.addEventListener('click', toggleMemeMode);

// Tab switching logic in Welcome modal
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
                playClickSound();
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
});

// Difficulty Selection in Welcome Modal
const diffBtns = document.querySelectorAll('.diff-btn');
diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
                playClickSound();
                diffBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.difficulty = btn.dataset.diff;
        });
});

// Overlay triggers
startGameBtn.addEventListener('click', () => {
        playClickSound();
        welcomeModal.classList.add('hidden');
        startGame();
});

resumeBtn.addEventListener('click', () => {
        playClickSound();
        togglePause();
});

pauseRestartBtn.addEventListener('click', () => {
        playClickSound();
        togglePause();
        restartGame();
});

gameoverRetryBtn.addEventListener('click', () => {
        playClickSound();
        gameoverModal.classList.add('hidden');
        restartGame();
});

gameoverMenuBtn.addEventListener('click', () => {
        playClickSound();
        gameoverModal.classList.add('hidden');
        welcomeModal.classList.remove('hidden');
});

// Keyboard hooks
window.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P') {
                if (state.isPlaying) {
                        togglePause();
                }
        }
});

// Set up radial timer SVG properties
timerCircle.style.strokeDasharray = `${circumference} ${circumference}`;
timerCircle.style.strokeDashoffset = 0;

// Load high score and sound state
state.highScore = parseInt(localStorage.getItem('space_attack_highscore')) || 0;
headerHighScore.textContent = padZero(state.highScore);
state.isMuted = localStorage.getItem('space_attack_muted') === 'true';
state.isMemeMode = localStorage.getItem('space_attack_meme_mode') !== 'false';
applyMuteState();
applyMemeModeState();

// ==========================================
// Audio / SFX Management
// ==========================================
function playClickSound() {
        if (state.isMuted) return;
        buttonClickSound.currentTime = 0;
        buttonClickSound.play().catch(err => console.warn(err));
}

function playDestroySound() {
        if (state.isMuted || !jetDestroySound) return;
        jetDestroySound.currentTime = 0;
        jetDestroySound.play().catch(err => console.warn(err));
}

function playEscapeSound() {
        if (state.isMuted || !jetEscapeSound) return;
        jetEscapeSound.currentTime = 0;
        jetEscapeSound.play().catch(err => console.warn(err));
}

function playFaaahSound() {
        if (state.isMuted || !faaahSound) return;
        faaahSound.currentTime = 0;
        faaahSound.play().catch(err => console.warn(err));
}

// Satisfying hype synthesizer power-up sweep played once when Fire Mode triggers
function playHypeFireSound() {
        if (state.isMuted) return;
        try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                // A quick rising major arpeggio frequency sweep that sounds extremely satisfying!
                const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, idx) => {
                        const time = audioCtx.currentTime + idx * 0.05;
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        
                        osc.type = 'sawtooth';
                        osc.frequency.setValueAtTime(freq, time);
                        osc.frequency.exponentialRampToValueAtTime(freq * 1.6, time + 0.1);
                        
                        gain.gain.setValueAtTime(0.08, time);
                        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
                        
                        osc.start(time);
                        osc.stop(time + 0.12);
                });
        } catch (e) {
                console.warn("Hype audio synthesis failed:", e);
        }
}

function toggleMemeMode() {
        state.isMemeMode = !state.isMemeMode;
        localStorage.setItem('space_attack_meme_mode', state.isMemeMode);
        applyMemeModeState();
        playClickSound();
}

function applyMemeModeState() {
        if (state.isMemeMode) {
                headerMemeBtn.classList.add('active');
                modalMemeBtn.classList.add('active');
                modalMemeBtn.textContent = '😂 Faaah Mode: ON';
        } else {
                headerMemeBtn.classList.remove('active');
                modalMemeBtn.classList.remove('active');
                modalMemeBtn.textContent = '😂 Faaah Mode: OFF';
        }
}

// Visual Pulse Feedback Trigger
function triggerTextPulse(el) {
        if (!el) return;
        el.classList.remove('pulse-active');
        void el.offsetWidth; // Trigger DOM reflow to restart animation
        el.classList.add('pulse-active');
}

function playWinSound() {
        if (state.isMuted || !gameWinSound) return;
        gameWinSound.currentTime = 0;
        gameWinSound.play().catch(err => console.warn(err));
}

function playGameOverSound() {
        if (state.isMuted || !gameOverSound) return;
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(err => console.warn(err));
}

// Synthesize low-countdown tension tick sound
function playTickSound() {
        if (state.isMuted) return;
        try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch A note
                gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);

                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.1);
        } catch (e) {
                console.warn(e);
        }
}

// Synthesize level/achievement unlock chirp
function playChirpSound() {
        if (state.isMuted) return;
        try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.15); // Slide to C6
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);

                osc.start();
                osc.stop(audioCtx.currentTime + 0.18);
        } catch (e) {
                console.warn(e);
        }
}

function toggleMute() {
        state.isMuted = !state.isMuted;
        localStorage.setItem('space_attack_muted', state.isMuted);
        applyMuteState();
        playClickSound();
}

function applyMuteState() {
        if (state.isMuted) {
                soundOnIcon.classList.add('hidden');
                soundOffIcon.classList.remove('hidden');
                themeSound.pause();
                themeSound.volume = 0.0;
                modalAudioBtn.classList.remove('active');
                modalAudioBtn.textContent = '🔊 Master Sound: OFF';
        } else {
                soundOnIcon.classList.remove('hidden');
                soundOffIcon.classList.add('hidden');
                themeSound.volume = 0.45;
                modalAudioBtn.classList.add('active');
                modalAudioBtn.textContent = '🔊 Master Sound: ON';
                if (state.isPlaying && !state.isPaused) {
                        themeSound.play().catch(e => console.warn("Theme play blocked:", e));
                }
        }
}

// ==========================================
// Combo & Points Dynamics
// ==========================================
function registerHit() {
        state.destroyedCount++;
        const now = Date.now();
        
        // Reset or increment combo depending on timing
        if (now - state.lastKillTime <= comboTimeoutDuration) {
                state.combo++;
        } else {
                state.combo = 1;
        }
        
        state.lastKillTime = now;
        state.maxCombo = Math.max(state.maxCombo, state.combo);
        
        // Check Fire Mode activation threshold (streak of 5)
        if (state.combo >= 5 && !state.isFireModeActive) {
                state.isFireModeActive = true;
                playHypeFireSound();
                document.body.classList.add('fire-mode-active');
                spawnFloatingText("🔥 FIRE MODE ACTIVE! 🔥", attackField.clientWidth / 2 - 100, attackField.clientHeight / 2, true);
        }
        
        // Dynamic Point Calculation (combos scale scores higher!)
        const pointsAwarded = 100 * state.combo;
        state.score += pointsAwarded;
        
        // Display floating points text
        return {
                points: pointsAwarded,
                combo: state.combo
        };
}

// ==========================================
// Particle FX & Visual Enhancements
// ==========================================
function spawnExplosion(x, y) {
        const colors = ['#00D4FF', '#8B5CF6', '#EC4899', '#22C55E', '#F97316'];
        const particleCount = window.innerWidth < 600 ? 10 : 16;
        
        for (let i = 0; i < particleCount; i++) {
                const el = document.createElement('div');
                el.className = 'fx-particle';
                el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                
                const size = Math.random() * 6 + 4;
                el.style.width = `${size}px`;
                el.style.height = `${size}px`;
                el.style.boxShadow = `0 0 10px ${el.style.backgroundColor}`;
                el.style.position = 'absolute';
                el.style.borderRadius = '50%';
                
                const angle = Math.random() * Math.PI * 2;
                const velocity = Math.random() * 4 + 2;
                
                state.particles.push({
                        el: el,
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * velocity,
                        vy: Math.sin(angle) * velocity,
                        life: 1.0,
                        decay: Math.random() * 0.03 + 0.02
                });
                
                attackField.appendChild(el);
        }
}

function spawnFloatingText(text, x, y, isCombo = false) {
        const el = document.createElement('div');
        el.className = 'floating-fx-text';
        if (isCombo) el.classList.add('neon-pink-text');
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        
        state.floatingTexts.push({
                el: el,
                x: x,
                y: y,
                vy: -1.2,
                opacity: 1.0
        });
        
        attackField.appendChild(el);
}

// Update FX positions inside animation frame
function updateVFX() {
        // Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
                const p = state.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08; // subtle gravity drift
                p.life -= p.decay;
                
                p.el.style.left = `${p.x}px`;
                p.el.style.top = `${p.y}px`;
                p.el.style.opacity = p.life;
                
                if (p.life <= 0) {
                        p.el.remove();
                        state.particles.splice(i, 1);
                }
        }
        
        // Floating Texts
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
                const ft = state.floatingTexts[i];
                ft.y += ft.vy;
                ft.opacity -= 0.025;
                
                ft.el.style.top = `${ft.y}px`;
                ft.el.style.opacity = ft.opacity;
                
                if (ft.opacity <= 0) {
                        ft.el.remove();
                        state.floatingTexts.splice(i, 1);
                }
        }
}

// ==========================================
// Achievement System
// ==========================================
function checkAchievements() {
        // 1. First Kill
        if (state.destroyedCount >= 1) {
                unlockAchievement('first_kill');
        }
        // 2. Decimator (10 kills)
        if (state.destroyedCount >= 10) {
                unlockAchievement('kill_10');
        }
        // 3. Space Ace (25 kills)
        if (state.destroyedCount >= 25) {
                unlockAchievement('kill_25');
        }
}

function unlockAchievement(id) {
        if (state.achievementsUnlockedThisRun.includes(id)) return;
        
        const unlockedGlobal = localStorage.getItem(`ach_${id}`) === 'true';
        state.achievementsUnlockedThisRun.push(id);
        
        if (!unlockedGlobal) {
                localStorage.setItem(`ach_${id}`, 'true');
                triggerAchievementToast(ACHIEVEMENTS[id]);
        }
}

function triggerAchievementToast(achievement) {
        playChirpSound();
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
                <div class="toast-icon">${achievement.icon}</div>
                <div class="toast-content">
                        <span class="toast-tag">ACHIEVEMENT UNLOCKED</span>
                        <span class="toast-title">${achievement.title}</span>
                        <span class="toast-desc">${achievement.desc}</span>
                </div>
        `;
        achievementToaster.appendChild(toast);
        setTimeout(() => toast.remove(), 4500);
}

// ==========================================
// Game Engine Loops (requestAnimationFrame)
// ==========================================
let timerInterval = null;
let spawnInterval = null;

function startGameLoop() {
        if (!state.isPlaying) return;
        
        if (!state.isPaused) {
                updateJets();
                updateVFX();
                updateComboMeter();
        }
        requestAnimationFrame(startGameLoop);
}

function updateJets() {
        const fieldWidth = attackField.clientWidth;
        for (let i = state.activeJets.length - 1; i >= 0; i--) {
                const jet = state.activeJets[i];
                jet.x += jet.speed;
                
                // Add secondary sinewave wobble for high feel
                jet.wobbleOffset += jet.wobbleSpeed;
                const wobbleY = Math.sin(jet.wobbleOffset) * 0.8;
                jet.y += wobbleY;
                
                jet.element.style.left = `${jet.x}px`;
                jet.element.style.top = `${jet.y}px`;
                
                // Escape check
                if (jet.x >= fieldWidth) {
                        handleJetEscape(jet, i);
                }
        }
}

function handleJetEscape(jet, index) {
        jet.element.remove();
        state.activeJets.splice(index, 1);
        
        // Shields decay if game is active and not already won
        if (state.isPlaying && state.missed < 3) {
                if (state.isMemeMode) {
                        playFaaahSound();
                } else {
                        playEscapeSound();
                }
                state.missed++;
                updateShieldsUI();
                updateStatsHUD();
                
                // Break combo and Fire Mode on miss
                state.combo = 0;
                if (state.isFireModeActive) {
                        state.isFireModeActive = false;
                        document.body.classList.remove('fire-mode-active');
                }
                
                if (state.missed === 3) {
                        endGame(false);
                }
        }
}

function updateComboMeter() {
        if (state.combo > 0) {
                const now = Date.now();
                const elapsed = now - state.lastKillTime;
                
                if (elapsed < comboTimeoutDuration) {
                        const widthPct = ((comboTimeoutDuration - elapsed) / comboTimeoutDuration) * 100;
                        hudComboFill.style.width = `${widthPct}%`;
                        if (hudCombo.textContent !== `${state.combo}x`) {
                                hudCombo.textContent = `${state.combo}x`;
                                triggerTextPulse(hudCombo);
                        }
                        hudComboCard.classList.remove('hidden');
                } else {
                        state.combo = 0;
                        hudComboFill.style.width = '0%';
                        hudCombo.textContent = '1x';
                        hudComboCard.classList.add('hidden');
                        if (state.isFireModeActive) {
                                state.isFireModeActive = false;
                                document.body.classList.remove('fire-mode-active');
                        }
                }
        } else {
                hudComboCard.classList.add('hidden');
                if (state.isFireModeActive) {
                        state.isFireModeActive = false;
                        document.body.classList.remove('fire-mode-active');
                }
        }
}

// ==========================================
// Spawning & Positioning Mechanics
// ==========================================
function spawnJet() {
        state.totalSpawned++;
        const jet = document.createElement('img');
        
        // Randomly alternate skins if desired, fallback to fighterjet
        jet.src = './images/fighterjet.png';
        jet.alt = 'Space Attacker';
        
        // Insert temporarily into DOM to compute offset dimensions
        attackField.appendChild(jet);
        
        const jetWidth = jet.clientWidth || 95;
        const jetHeight = jet.clientHeight || 95;
        
        // Position offscreen left
        const initialX = -jetWidth;
        
        // Constrain Y within attack field borders
        const maxSpawnY = attackField.clientHeight - jetHeight - 20;
        const minSpawnY = 20;
        const initialY = Math.random() * (maxSpawnY - minSpawnY) + minSpawnY;
        
        jet.style.left = `${initialX}px`;
        jet.style.top = `${initialY}px`;
        
        // Speed updates as timer ticks down
        const jetSpeed = calculateSpeedFactor();
        
        const jetObj = {
                element: jet,
                x: initialX,
                y: initialY,
                speed: jetSpeed,
                wobbleOffset: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.05 + 0.02
        };
        
        state.activeJets.push(jetObj);
        
        // Register Click Listener
        jet.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                destroyJet(jetObj, e);
        });
        
        // Touch supports
        jet.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                destroyJet(jetObj, e.touches[0]);
        });
}

function calculateSpeedFactor() {
        let min = 1.8;
        let max = 2.4;
        
        // Replicate speed increase over time
        if (state.timer <= 45) {
                min = 2.5;
                max = 3.2;
        }
        if (state.timer <= 20) {
                min = 3.6;
                max = 4.8;
        }
        
        // Apply difficulty factors
        let diffFactor = 1.0;
        if (state.difficulty === 'Easy') diffFactor = 0.7;
        if (state.difficulty === 'Hard') diffFactor = 1.45;
        
        return (Math.random() * (max - min) + min) * diffFactor;
}

function destroyJet(jet, e) {
        if (state.isPaused || !state.isPlaying) return;
        
        // Calculate coords relative to play field for animations
        const rect = attackField.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Process Hit
        const result = registerHit();
        
        // SFX and Visuals
        playDestroySound();
        spawnExplosion(clickX, clickY);
        
        // Floating point strings (e.g. +100 or +200 [2x])
        const pointsText = `+${result.points}`;
        spawnFloatingText(pointsText, clickX, clickY - 20);
        if (result.combo > 1) {
                spawnFloatingText(`${result.combo}x Combo!`, clickX, clickY + 10, true);
        }
        
        // Check local achievements
        checkAchievements();
        
        // Update DOM
        jet.element.remove();
        state.activeJets = state.activeJets.filter(j => j !== jet);
        
        updateScoreHUD();
        updateStatsHUD();
}

// ==========================================
// Game Lifecycle (Start, Pause, Restart, End)
// ==========================================
function startGame() {
        state.score = 0;
        state.missed = 0;
        state.timer = gameDuration;
        state.combo = 0;
        state.maxCombo = 0;
        state.destroyedCount = 0;
        state.totalSpawned = 0;
        state.isPaused = false;
        state.isPlaying = true;
        state.achievementsUnlockedThisRun = [];
        
        // Reset Visuals
        clearAllVFXAndJets();
        updateScoreHUD();
        updateShieldsUI();
        updateTimerUI();
        updateStatsHUD();
        
        hudDifficulty.textContent = state.difficulty.toUpperCase();
        
        // Mute state checks
        applyMuteState();
        if (!state.isMuted) {
                themeSound.currentTime = 1;
                themeSound.play().catch(err => console.warn(err));
        }
        
        // Fire loops
        startGameLoop();
        
        // Set Interval for Spawning
        startSpawningTimer();
        
        // Set Interval for Timer Countdown
        startCountdownTimer();
}

function startCountdownTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
                if (state.isPaused || !state.isPlaying) return;
                
                if (state.timer > 0) {
                        state.timer--;
                        updateTimerUI();
                        if (state.timer <= 5) {
                                playTickSound();
                        }
                } else {
                        endGame(true); // Game complete
                }
        }, 1000);
}

function startSpawningTimer() {
        if (spawnInterval) clearInterval(spawnInterval);
        
        let rate = 1000;
        if (state.difficulty === 'Easy') rate = 1300;
        if (state.difficulty === 'Hard') rate = 700;
        
        spawnInterval = setInterval(() => {
                if (state.isPaused || !state.isPlaying) return;
                spawnJet();
        }, rate);
}

function togglePause() {
        if (!state.isPlaying) return;
        
        state.isPaused = !state.isPaused;
        
        if (state.isPaused) {
                pauseScreen.classList.remove('hidden');
                themeSound.pause();
        } else {
                pauseScreen.classList.add('hidden');
                if (!state.isMuted) {
                        themeSound.play().catch(e => console.warn(e));
                }
        }
}

function restartGame() {
        clearGameIntervals();
        startGame();
}

function endGame(isWon) {
        state.isPlaying = false;
        clearGameIntervals();
        themeSound.pause();
        
        // Check for perfect game win condition
        if (isWon && state.missed === 0) {
                unlockAchievement('perfect_win');
        }
        // Check for Hard difficulty win
        if (isWon && state.difficulty === 'Hard') {
                unlockAchievement('space_commander');
        }
        
        // SFX
        if (isWon) {
                playWinSound();
        } else {
                playGameOverSound();
        }
        
        // High Score checking
        let newRecord = false;
        if (state.score > state.highScore) {
                state.highScore = state.score;
                localStorage.setItem('space_attack_highscore', state.highScore);
                headerHighScore.textContent = padZero(state.highScore);
                newRecord = true;
        }
        
        // Configure Game Over screen data
        configureGameOverScreen(isWon, newRecord);
        
        // Delay slight bit before showing for dramatic effect
        setTimeout(() => {
                gameoverModal.classList.remove('hidden');
                clearAllVFXAndJets();
        }, 800);
}

function clearGameIntervals() {
        if (timerInterval) clearInterval(timerInterval);
        if (spawnInterval) clearInterval(spawnInterval);
}

function clearAllVFXAndJets() {
        // Clear DOM
        state.activeJets.forEach(j => j.element.remove());
        state.particles.forEach(p => p.el.remove());
        state.floatingTexts.forEach(ft => ft.el.remove());
        
        // Clear Arrays
        state.activeJets = [];
        state.particles = [];
        state.floatingTexts = [];
        
        // Reset Fire Mode
        state.isFireModeActive = false;
        document.body.classList.remove('fire-mode-active');
}

// ==========================================
// UI Rendering & Formatting Updates
// ==========================================
function padZero(num) {
        if (num < 10) return `000${num}`;
        if (num < 100) return `00${num}`;
        if (num < 1000) return `0${num}`;
        return `${num}`;
}

function updateScoreHUD() {
        if (headerScore.textContent !== padZero(state.score)) {
                headerScore.textContent = padZero(state.score);
                triggerTextPulse(headerScore);
        }
}

function updateTimerUI() {
        if (hudTimer.textContent !== `${state.timer}`) {
                hudTimer.textContent = state.timer;
                triggerTextPulse(hudTimer);
        }
        
        // Radial progress bar adjustment
        const pct = (state.timer / gameDuration) * 100;
        const offset = circumference - (pct / 100) * circumference;
        timerCircle.style.strokeDashoffset = offset;
        
        // Timer color transitions
        if (state.timer <= 10) {
                timerCircle.setAttribute('stroke', 'var(--accent-pink)');
                hudTimer.style.textShadow = '0 0 12px var(--accent-pink)';
        } else if (state.timer <= 25) {
                timerCircle.setAttribute('stroke', 'var(--accent-orange)');
                hudTimer.style.textShadow = '0 0 12px var(--accent-orange)';
        } else {
                timerCircle.setAttribute('stroke', 'var(--accent-purple)');
                hudTimer.style.textShadow = '0 0 12px var(--accent-purple)';
        }
}

function updateShieldsUI() {
        // missed goes 0 to 3
        const activeCount = 3 - state.missed;
        
        shields.forEach((shield, idx) => {
                if (idx < activeCount) {
                        shield.className = 'shield-segment active';
                } else {
                        shield.className = 'shield-segment';
                }
        });
        
        // Apply warning styling to the last surviving shield segment
        if (activeCount === 1) {
                shields[0].className = 'shield-segment active warning';
                shieldHealthLabel.textContent = 'SHIELD CRITICAL';
                shieldHealthLabel.className = 'shield-status-text neon-pink-text';
        } else if (activeCount === 2) {
                shieldHealthLabel.textContent = 'SHIELDS WARNING';
                shieldHealthLabel.className = 'shield-status-text neon-orange-text';
        } else if (activeCount === 3) {
                shieldHealthLabel.textContent = 'SHIELDS MAXIMUM';
                shieldHealthLabel.className = 'shield-status-text neon-green-text';
        } else {
                shieldHealthLabel.textContent = 'SHIELDS DESTROYED';
                shieldHealthLabel.className = 'shield-status-text neon-pink-text';
        }
}

function updateStatsHUD() {
        if (hudDestroyedCount.textContent !== `${state.destroyedCount}`) {
                hudDestroyedCount.textContent = state.destroyedCount;
                triggerTextPulse(hudDestroyedCount);
        }
        
        if (hudMissedCount.textContent !== `${state.missed} / 3`) {
                hudMissedCount.textContent = `${state.missed} / 3`;
                triggerTextPulse(hudMissedCount);
        }
        
        // Accuracy calculation
        let accuracy = 100;
        const totalAttempts = state.destroyedCount + state.missed;
        if (totalAttempts > 0) {
                accuracy = Math.round((state.destroyedCount / totalAttempts) * 100);
        }
        
        if (hudAccuracy.textContent !== `${accuracy}%`) {
                hudAccuracy.textContent = `${accuracy}%`;
                triggerTextPulse(hudAccuracy);
        }
}

function configureGameOverScreen(isWon, newRecord) {
        const titleEl = document.getElementById('gameover-title');
        if (isWon) {
                titleEl.textContent = "MISSION COMPLETE";
                titleEl.className = "neon-green-text text-glow";
        } else {
                titleEl.textContent = "SHIELDS COMPROMISED";
                titleEl.className = "neon-pink-text text-glow";
        }
        
        const finalScoreEl = document.getElementById('gameover-final-score');
        finalScoreEl.textContent = padZero(state.score);
        triggerTextPulse(finalScoreEl);
        
        if (newRecord) {
                document.getElementById('new-record-badge').classList.remove('hidden');
        } else {
                document.getElementById('new-record-badge').classList.add('hidden');
        }
        
        // Stats grids
        const goDestroyed = document.getElementById('go-destroyed');
        goDestroyed.textContent = state.destroyedCount;
        triggerTextPulse(goDestroyed);
        
        let accuracy = 100;
        const totalAttempts = state.destroyedCount + state.missed;
        if (totalAttempts > 0) {
                accuracy = Math.round((state.destroyedCount / totalAttempts) * 100);
        }
        
        const goAccuracy = document.getElementById('go-accuracy');
        goAccuracy.textContent = `${accuracy}%`;
        triggerTextPulse(goAccuracy);
        
        const goMaxCombo = document.getElementById('go-maxcombo');
        goMaxCombo.textContent = `${state.maxCombo}x`;
        triggerTextPulse(goMaxCombo);
        
        const goDifficulty = document.getElementById('go-difficulty');
        goDifficulty.textContent = state.difficulty;
        triggerTextPulse(goDifficulty);
        
        // Unlocked achievements display
        const unlockedContainer = document.getElementById('unlocked-achievements-container');
        const listRow = document.getElementById('unlocked-achievements-list');
        listRow.innerHTML = '';
        
        if (state.achievementsUnlockedThisRun.length > 0) {
                state.achievementsUnlockedThisRun.forEach(id => {
                        const badge = document.createElement('div');
                        badge.className = 'achievement-badge-inline';
                        badge.innerHTML = `${ACHIEVEMENTS[id].icon} <span>${ACHIEVEMENTS[id].title}</span>`;
                        listRow.appendChild(badge);
                });
                unlockedContainer.classList.remove('hidden');
        } else {
                unlockedContainer.classList.add('hidden');
        }
}
