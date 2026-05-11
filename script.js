const UI = {
    board: document.getElementById('ludo-board'),
    dice: document.getElementById('dice'),
    rollBtn: document.getElementById('btn-roll'),
    startMenu: document.getElementById('start-menu'),
    btn2P: document.getElementById('btn-2-player'),
    btn4P: document.getElementById('btn-4-player'),
    victoryOverlay: document.getElementById('victory-overlay'),
    winnerText: document.getElementById('winner-text'),
    btnRestart: document.getElementById('btn-restart'),
    turnIndicator: document.getElementById('turn-indicator'),
    turnDot: document.querySelector('.turn-indicator .dot'),
    turnText: document.querySelector('.turn-indicator .text'),
    tokensContainer: document.getElementById('tokens-container'),
    container: document.getElementById('game-container'),
    diceBadge: document.getElementById('dice-result-badge'),
    
    // In-Game Menu
    ingameMenu: document.getElementById('ingame-menu'),
    confirmPopup: document.getElementById('confirm-popup'),
    confirmMsg: document.getElementById('confirm-msg'),
    soundBtn: document.getElementById('btn-sound-toggle')
};

let soundMuted = false;
let confirmAction = null;

// --- Sound Engine ---
const SoundEngine = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    play(type) {
        if (!this.ctx || soundMuted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        const now = this.ctx.currentTime;

        switch(type) {
            case 'dice':
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.start(); osc.stop(now + 0.15);
                break;
            case 'move':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(450, now);
                osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(); osc.stop(now + 0.1);
                break;
            case 'kill':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.linearRampToValueAtTime(20, now + 0.5);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start(); osc.stop(now + 0.5);
                break;
            case 'win':
                [523, 659, 783, 1046, 1318].forEach((f, i) => {
                    const o = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    o.connect(g); g.connect(this.ctx.destination);
                    o.frequency.setValueAtTime(f, now + i * 0.1);
                    g.gain.setValueAtTime(0.15, now + i * 0.1);
                    g.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.6);
                    o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.6);
                });
                break;
        }
    }
};

// ... (Particle system and constants remain the same)

// --- Menu Functions ---
function toggleInGameMenu(show) {
    if (show) UI.ingameMenu.classList.remove('hidden');
    else UI.ingameMenu.classList.add('hidden');
}

function showConfirm(msg, action) {
    UI.confirmMsg.innerText = msg;
    confirmAction = action;
    UI.confirmPopup.classList.remove('hidden');
}

function handleConfirm(yes) {
    UI.confirmPopup.classList.add('hidden');
    if (yes && confirmAction) confirmAction();
    confirmAction = null;
}

function resetToMain() {
    UI.ingameMenu.classList.add('hidden');
    UI.startMenu.classList.remove('hidden');
    UI.victoryOverlay.classList.add('hidden');
    gameState.players = [];
    UI.tokensContainer.innerHTML = '';
    startMenuParticles();
}

function restartGame() {
    UI.ingameMenu.classList.add('hidden');
    initGame(gameState.players.length);
}

function toggleSound() {
    soundMuted = !soundMuted;
    UI.soundBtn.innerText = soundMuted ? '🔇' : '🔊';
    document.getElementById('btn-sound-main').innerText = soundMuted ? '🔇' : '🔊';
}

function startMenuParticles() {
    // Generate some constant floating particles for the start screen
    const menu = document.querySelector('.premium-start');
    const rect = menu.getBoundingClientRect();
    for(let i=0; i<15; i++) {
        setTimeout(() => {
            if (!UI.startMenu.classList.contains('hidden')) {
                Particles.create(rect.left + Math.random() * rect.width, rect.top + Math.random() * rect.height, 'rgba(255,255,255,0.2)', 5);
            }
        }, i * 500);
    }
}

// --- Interaction Events ---
document.getElementById('btn-play-now').addEventListener('click', () => initGame(2)); // Default to 2P for quick play
document.getElementById('btn-settings').addEventListener('click', () => alert("Settings: High Quality Graphics Enabled"));
document.getElementById('btn-about').addEventListener('click', () => alert("Bittumodx Ludo King v2.0\nPremium Offline Edition"));
document.getElementById('btn-exit-main').addEventListener('click', () => {
    if(confirm("Exit the game?")) window.close();
});
document.getElementById('btn-sound-main').addEventListener('click', toggleSound);

document.getElementById('btn-main-menu').addEventListener('click', () => toggleInGameMenu(true));
document.getElementById('btn-resume').addEventListener('click', () => toggleInGameMenu(false));
UI.soundBtn.addEventListener('click', toggleSound);

document.getElementById('btn-new-game').addEventListener('click', () => {
    showConfirm("Start a new game session?", resetToMain);
});

document.getElementById('btn-restart-game').addEventListener('click', () => {
    showConfirm("Restart the current match?", restartGame);
});

document.getElementById('btn-exit-game').addEventListener('click', () => {
    showConfirm("Are you sure you want to exit?", resetToMain);
});

document.getElementById('btn-confirm-yes').addEventListener('click', () => handleConfirm(true));
document.getElementById('btn-confirm-no').addEventListener('click', () => handleConfirm(false));

// Initialize Start Screen
startMenuParticles();
setInterval(() => {
    if (!UI.startMenu.classList.contains('hidden')) startMenuParticles();
}, 8000);

// ... (Rest of existing game logic functions like initGame, rollDice, etc.)

// --- Particle System ---
const Particles = {
    create(x, y, color, count = 20) {
        const container = document.createElement('div');
        container.id = 'particles-container';
        UI.container.appendChild(container);
        
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = Math.random() * 8 + 4;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.background = color;
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;
            
            const tx = (Math.random() - 0.5) * 300;
            const ty = (Math.random() - 0.5) * 300;
            p.style.setProperty('--tx', `${tx}px`);
            p.style.setProperty('--ty', `${ty}px`);
            
            container.appendChild(p);
        }
        setTimeout(() => container.remove(), 1000);
    }
};

// --- Constants ---
const COLORS = ['red', 'green', 'yellow', 'blue'];
const START_POS = { red: 0, green: 13, yellow: 26, blue: 39 };

const OUTER_PATH = [
    [6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],
    [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],
    [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],
    [14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0]
];

const HOME_PATHS = {
    red: [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
    green: [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
    yellow: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
    blue: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]]
};

const SAFE_ZONES = [ [6,1], [2,6], [1,8], [6,12], [8,13], [12,8], [13,6], [8,2] ];

let gameState = {
    players: [],
    currentTurn: 0,
    diceValue: 0,
    isRolling: false,
    waitingForMove: false,
    tokens: {},
    extraTurn: false
};

// --- Initialization ---
function initBoard() {
    // Clear existing dynamic cells
    UI.board.querySelectorAll('.cell').forEach(c => c.remove());
    
    // Standard Ludo Starting Positions
    const START_CELLS = {
        red: [6, 1], green: [1, 8], yellow: [8, 13], blue: [13, 6]
    };

    for(let r=0; r<15; r++) {
        for(let c=0; c<15; c++) {
            // Skip areas handled by static HTML (Bases and center 3x3)
            if (isInsideBase(r, c) || (r >= 6 && r <= 8 && c >= 6 && c <= 8)) continue;
            
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.gridArea = `${r + 1} / ${c + 1}`;
            
            // 1. Color Player-Specific Home Paths
            let isColored = false;
            for (let color of COLORS) {
                if (HOME_PATHS[color].some(hp => hp[0] === r && hp[1] === c)) {
                    cell.classList.add(`${color}-path`);
                    isColored = true;
                }
                // 2. Color Player Starting Squares
                const start = START_CELLS[color];
                if (start[0] === r && start[1] === c) {
                    cell.classList.add(`${color}-path`, 'start-cell');
                    isColored = true;
                }
            }
            
            // 3. Mark Safe Zones / Stars
            if (SAFE_ZONES.some(sz => sz[0] === r && sz[1] === c)) {
                cell.classList.add('safe');
            }
            
            // 4. Tinting Quadrant Paths for better visibility (Optional but requested)
            if (!isColored) {
                if (r < 6 && c === 6) cell.style.backgroundColor = "rgba(46, 204, 113, 0.05)"; // Green arm tint
                if (r > 8 && c === 8) cell.style.backgroundColor = "rgba(52, 152, 219, 0.05)"; // Blue arm tint
                if (c < 6 && r === 8) cell.style.backgroundColor = "rgba(255, 77, 77, 0.05)";   // Red arm tint
                if (c > 8 && r === 6) cell.style.backgroundColor = "rgba(241, 196, 15, 0.05)"; // Yellow arm tint
            }
            
            UI.board.appendChild(cell);
        }
    }
}

function isInsideBase(r, c) {
    return (r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6) || (r > 8 && c > 8);
}

function initGame(playerCount) {
    SoundEngine.init();
    gameState.players = playerCount === 2 ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];
    gameState.currentTurn = 0;
    gameState.tokens = {};
    UI.tokensContainer.innerHTML = '';

    gameState.players.forEach(color => {
        gameState.tokens[color] = [];
        for (let i = 0; i < 4; i++) {
            const token = document.createElement('div');
            token.className = `token ${color}`; // Explicitly setting color class
            // Handle both click and touch for modern responsiveness
            ['mousedown', 'touchstart'].forEach(evt => {
                token.addEventListener(evt, (e) => {
                    e.preventDefault();
                    handleTokenClick(color, i);
                });
            });
            UI.tokensContainer.appendChild(token);
            gameState.tokens[color][i] = { pos: -1, el: token };
            updateTokenPosition(color, i);
        }
    });

    UI.startMenu.classList.add('hidden');
    UI.victoryOverlay.classList.add('hidden');
    updateTurnUI();
}

function updateTurnUI() {
    const color = gameState.players[gameState.currentTurn];
    
    // Update Turn Indicator
    UI.turnDot.className = 'dot';
    UI.turnDot.style.backgroundColor = `var(--${color}-solid, ${color})`;
    UI.turnDot.style.boxShadow = `0 0 20px var(--${color}-solid, ${color})`;
    UI.turnText.innerText = `${color.toUpperCase()}'s Turn`;
    UI.rollBtn.disabled = false;
    
    // Dynamically Move Dice near Active Player
    const diceContainer = document.getElementById('dice-container');
    diceContainer.className = `pos-${color}`;
    
    // Highlight Active Base
    document.querySelectorAll('.base').forEach(b => b.classList.remove('active'));
    document.querySelector(`.base.${color}`).classList.add('active');
    
    // Board Tilt Effect
    document.getElementById('board-wrapper').style.transform = `rotateX(5deg) rotateY(${gameState.currentTurn * 2 - 3}deg)`;
}

async function rollDice() {
    if (gameState.isRolling || gameState.waitingForMove) return;
    gameState.isRolling = true;
    UI.rollBtn.disabled = true;
    UI.diceBadge.classList.add('hidden'); // Reset badge
    SoundEngine.play('dice');

    // High-speed random rotation for roll feel
    const duration = 1000;
    const start = performance.now();
    
    function anim(now) {
        const elapsed = now - start;
        const progress = elapsed / duration;
        if (progress < 1) {
            const rx = Math.random() * 1080;
            const ry = Math.random() * 1080;
            UI.dice.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(${1 + Math.sin(progress * Math.PI) * 0.2})`;
            requestAnimationFrame(anim);
        } else {
            finalizeDice();
        }
    }
    requestAnimationFrame(anim);

    function finalizeDice() {
        gameState.diceValue = Math.floor(Math.random() * 6) + 1;
        rotateDice(gameState.diceValue);
        
        // Show result badge after dice settles
        setTimeout(() => {
            UI.diceBadge.innerText = gameState.diceValue;
            UI.diceBadge.classList.remove('hidden');
            
            gameState.isRolling = false;
            const color = gameState.players[gameState.currentTurn];
            const validMoves = getValidMoves(color, gameState.diceValue);

            if (validMoves.length === 0) {
                setTimeout(nextTurn, 1000);
            } else {
                gameState.waitingForMove = true;
                validMoves.forEach(i => gameState.tokens[color][i].el.classList.add('active'));
            }
        }, 800);
    }
}

function rotateDice(val) {
    // Mapping container rotation to show correct top-facing face
    // Front(1): rotateY(0), Back(6): rotateY(180), Top(2): rotateX(-90), Bottom(5): rotateX(90), Left(4): rotateY(90), Right(3): rotateY(-90)
    const mapping = {
        1: 'rotateX(0deg) rotateY(0deg)',
        6: 'rotateX(0deg) rotateY(180deg)',
        2: 'rotateX(-90deg) rotateY(0deg)',
        5: 'rotateX(90deg) rotateY(0deg)',
        4: 'rotateX(0deg) rotateY(90deg)',
        3: 'rotateX(0deg) rotateY(-90deg)'
    };
    UI.dice.style.transform = mapping[val];
}

function getValidMoves(color, roll) {
    return gameState.tokens[color].map((t, i) => {
        if (t.pos === -1 && roll !== 6) return null;
        if (t.pos >= 0 && t.pos + roll > 57) return null;
        if (t.pos === 57) return null;
        return i;
    }).filter(i => i !== null);
}

async function handleTokenClick(color, index) {
    if (!gameState.waitingForMove || gameState.players[gameState.currentTurn] !== color) return;
    const token = gameState.tokens[color][index];
    const roll = gameState.diceValue;

    if (token.pos === -1 && roll !== 6) return;
    if (token.pos >= 0 && token.pos + roll > 57) return;

    gameState.waitingForMove = false;
    document.querySelectorAll('.token.active').forEach(el => el.classList.remove('active'));
    await moveToken(color, index, roll);
}

async function moveToken(color, index, roll) {
    const token = gameState.tokens[color][index];
    if (token.pos === -1) {
        token.pos = 1; 
        updateTokenPosition(color, index, true);
        SoundEngine.play('move');
        gameState.extraTurn = true;
        setTimeout(() => checkRulesAndNext(color, index), 400);
        return;
    }

    for (let i = 0; i < roll; i++) {
        token.pos++;
        updateTokenPosition(color, index, true);
        SoundEngine.play('move');
        await new Promise(r => setTimeout(r, 280)); // Slightly slower for ultra-smooth feel
    }
    checkRulesAndNext(color, index);
}

function checkRulesAndNext(color, index) {
    const token = gameState.tokens[color][index];
    let killed = false;

    if (token.pos >= 0 && token.pos < 52) {
        const coords = getCoords(color, token.pos);
        const isSafe = SAFE_ZONES.some(sz => sz[0] === coords[0] && sz[1] === coords[1]);
        if (!isSafe) {
            Object.keys(gameState.tokens).forEach(otherColor => {
                if (otherColor === color) return;
                gameState.tokens[otherColor].forEach((ot, oi) => {
                    if (ot.pos < 0 || ot.pos >= 52) return;
                    const oc = getCoords(otherColor, ot.pos);
                    if (oc[0] === coords[0] && oc[1] === coords[1]) {
                        ot.pos = -1;
                        updateTokenPosition(otherColor, oi, true);
                        killed = true;
                        const rect = ot.el.getBoundingClientRect();
                        Particles.create(rect.left, rect.top, `var(--${otherColor}-solid)`, 15);
                    }
                });
            });
        }
    }

    if (killed) { SoundEngine.play('kill'); gameState.extraTurn = true; }
    if (token.pos === 57) {
        SoundEngine.play('win');
        gameState.extraTurn = true;
        const rect = token.el.getBoundingClientRect();
        Particles.create(rect.left, rect.top, '#ffd700', 30);
        if (gameState.tokens[color].every(t => t.pos === 57)) { showVictory(color); return; }
    }
    if (gameState.diceValue === 6) gameState.extraTurn = true;
    setTimeout(nextTurn, 400);
}

function nextTurn() {
    UI.diceBadge.classList.add('hidden');
    if (!gameState.extraTurn) gameState.currentTurn = (gameState.currentTurn + 1) % gameState.players.length;
    gameState.extraTurn = false;
    updateTurnUI();
}

function updateTokenPosition(color, index, jump = false) {
    const token = gameState.tokens[color][index];
    const el = token.el;
    let coords;

    if (token.pos === -1) {
        const slot = document.querySelector(`.base.${color} .token-slot:nth-child(${index + 1})`);
        const rect = slot.getBoundingClientRect();
        const boardRect = UI.board.getBoundingClientRect();
        coords = [(rect.top - boardRect.top) / (boardRect.height / 15), (rect.left - boardRect.left) / (boardRect.width / 15)];
    } else {
        coords = getCoords(color, token.pos);
    }

    el.style.top = `${coords[0] * (100 / 15)}%`;
    el.style.left = `${coords[1] * (100 / 15)}%`;
    if (jump) {
        el.style.transform = 'scale(1.3) translateY(-15px) rotate(10deg)';
        setTimeout(() => el.style.transform = 'scale(1) translateY(0) rotate(0deg)', 180);
    }
}

function getCoords(color, pos) {
    if (pos < 52) {
        return OUTER_PATH[(START_POS[color] + pos) % 52];
    }
    return HOME_PATHS[color][pos - 52];
}

function showVictory(color) {
    UI.winnerText.innerText = `${color.toUpperCase()} WINS!`;
    UI.victoryOverlay.classList.remove('hidden');
    SoundEngine.play('win');
    // Massive particle explosion
    for(let i=0; i<5; i++) {
        setTimeout(() => {
            Particles.create(window.innerWidth/2, window.innerHeight/2, `var(--${color})`, 50);
        }, i * 300);
    }
}

UI.btn2P.addEventListener('click', () => initGame(2));
UI.btn4P.addEventListener('click', () => initGame(4));
UI.rollBtn.addEventListener('click', rollDice);
UI.btnRestart.addEventListener('click', () => {
    UI.victoryOverlay.classList.add('hidden');
    UI.startMenu.classList.remove('hidden');
});

window.addEventListener('resize', () => {
    if (gameState.players.length > 0) {
        Object.keys(gameState.tokens).forEach(c => {
            gameState.tokens[c].forEach((_, i) => updateTokenPosition(c, i));
        });
    }
});

initBoard();
