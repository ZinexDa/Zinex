/* ----------------------------------------------------------
   GLOBAL VARIABLES & SETUP
----------------------------------------------------------- */
const musicOverlay = document.getElementById("musicOverlay");
const bgm = document.getElementById("bgm");
const usagi = document.getElementById("usagi");

const chirps = [
    new Audio("chirper1.ogg"),
    new Audio("chirper2.ogg"), 
    new Audio("chirper3.ogg")
];
chirps.forEach(c => { c.preload = "auto"; c.volume = 0.7; });

// Player variables
const songs = [
    { name: "iiSU", src: "zinex.lol_files/iiSU.mp3" },
    { name: "game", src: "zinex.lol_files/game.mp3" },
    { name: "Норм", src: "zinex.lol_files/Норм.mp3" }
];
let currentSongIndex = 0;
let isUserSeeking = false;

/* ----------------------------------------------------------
   DYNAMIC ISLAND ELEMENTS
----------------------------------------------------------- */
const diWrapper       = document.getElementById("di-wrapper");
const diPill          = document.getElementById("di-pill");
const diCompact       = document.getElementById("di-compact");
const diExpanded      = document.getElementById("di-expanded");
const diVinylCompact  = document.getElementById("di-vinyl-compact");
const diVinylBig      = document.getElementById("di-vinyl-big");
const diTrackCompact  = document.getElementById("di-track-compact");
const diTrackName     = document.getElementById("di-track-name");
const diEq            = document.getElementById("di-eq");
const diCurrent       = document.getElementById("di-current");
const diTotal         = document.getElementById("di-total");
const diProgress      = document.getElementById("di-progress");
const diPlayPause     = document.getElementById("di-playpause");
const diPrev          = document.getElementById("di-prev");
const diNext          = document.getElementById("di-next");
const diVolume        = document.getElementById("di-volume");
const diCloseBtn      = document.getElementById("di-close-btn");

let pillExpanded = false;

/* ----------------------------------------------------------
   HELPER FUNCTIONS
----------------------------------------------------------- */
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function random(min, max) { return Math.random() * (max - min) + min; }

/* Update the visual fill % on a range slider via CSS gradient */
function updateSliderFill(slider) {
    const val = (slider.value - slider.min) / (slider.max - slider.min || 1) * 100;
    slider.style.background = `linear-gradient(to right, rgba(115,183,255,0.9) ${val}%, rgba(255,255,255,0.12) ${val}%)`;
}

/* ----------------------------------------------------------
   PLAYER LOGIC — FIXED
----------------------------------------------------------- */
function loadTrack(index, autoplay) {
    if (index < 0 || index >= songs.length) index = 0;
    currentSongIndex = index;
    const song = songs[index];

    bgm.src = song.src;
    bgm.load();

    diTrackCompact.textContent = song.name;
    diTrackName.textContent    = song.name;

    // Reset progress UI
    diProgress.value = 0;
    diProgress.max   = 0;
    diCurrent.textContent = "0:00";
    diTotal.textContent   = "0:00";
    updateSliderFill(diProgress);

    if (autoplay) {
        bgm.play().then(() => {
            setPlayingUI(true);
        }).catch(err => console.warn("Playback error:", err));
    }
}

function setPlayingUI(playing) {
    if (playing) {
        diPlayPause.textContent = "⏸";
        diVinylCompact.classList.add("rotating");
        diVinylBig.classList.add("rotating");
        diEq.classList.add("playing");
    } else {
        diPlayPause.textContent = "▶";
        diVinylCompact.classList.remove("rotating");
        diVinylBig.classList.remove("rotating");
        diEq.classList.remove("playing");
    }
}

function togglePlay() {
    if (bgm.paused) {
        bgm.play().catch(e => console.warn(e));
    } else {
        bgm.pause();
    }
}

function nextTrack() { loadTrack((currentSongIndex + 1) % songs.length, true); }
function prevTrack() {
    // If > 3s in, restart; else go to prev
    if (bgm.currentTime > 3) {
        bgm.currentTime = 0;
    } else {
        loadTrack((currentSongIndex - 1 + songs.length) % songs.length, true);
    }
}

/* Audio events */
bgm.addEventListener('play',  () => setPlayingUI(true));
bgm.addEventListener('pause', () => setPlayingUI(false));

bgm.addEventListener('timeupdate', () => {
    if (isUserSeeking) return;
    diProgress.value = bgm.currentTime;
    diCurrent.textContent = formatTime(bgm.currentTime);
    updateSliderFill(diProgress);
});

bgm.addEventListener('loadedmetadata', () => {
    diProgress.max = bgm.duration;
    diTotal.textContent = formatTime(bgm.duration);
    updateSliderFill(diProgress);
});

bgm.addEventListener('ended', () => {
    nextTrack();
});

/* Progress slider — seeking fix */
diProgress.addEventListener('mousedown', () => { isUserSeeking = true; });
diProgress.addEventListener('touchstart', () => { isUserSeeking = true; }, { passive: true });

diProgress.addEventListener('input', () => {
    diCurrent.textContent = formatTime(parseFloat(diProgress.value));
    updateSliderFill(diProgress);
});

diProgress.addEventListener('change', () => {
    bgm.currentTime = parseFloat(diProgress.value);
    isUserSeeking = false;
    if (bgm.paused) bgm.play().catch(() => {});
});

diProgress.addEventListener('mouseup', () => {
    bgm.currentTime = parseFloat(diProgress.value);
    isUserSeeking = false;
    if (bgm.paused) bgm.play().catch(() => {});
});

/* Volume slider */
diVolume.addEventListener('input', () => {
    bgm.volume = parseFloat(diVolume.value);
    updateSliderFill(diVolume);
});
updateSliderFill(diVolume);

/* Button wiring */
diPlayPause.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
diNext.addEventListener('click', (e) => { e.stopPropagation(); nextTrack(); });
diPrev.addEventListener('click', (e) => { e.stopPropagation(); prevTrack(); });

/* ----------------------------------------------------------
   DYNAMIC ISLAND EXPAND / COLLAPSE
----------------------------------------------------------- */
function expandPill() {
    pillExpanded = true;
    diPill.classList.add("expanded");
}

function collapsePill() {
    pillExpanded = false;
    diPill.classList.remove("expanded");
}

diCompact.addEventListener('click', (e) => {
    if (!pillExpanded) expandPill();
});

diPill.addEventListener('click', (e) => {
    if (!pillExpanded) expandPill();
});

diCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    collapsePill();
});

/* Collapse on outside click */
document.addEventListener('click', (e) => {
    if (pillExpanded && !diPill.contains(e.target)) {
        collapsePill();
    }
});

/* ----------------------------------------------------------
   START EXPERIENCE (music overlay click)
----------------------------------------------------------- */
musicOverlay.addEventListener('click', function () {
    this.style.opacity = '0';
    this.style.pointerEvents = 'none';
    document.body.classList.add("music-started");

    // Show Dynamic Island
    diWrapper.classList.remove("hidden");
    diWrapper.classList.add("visible");

    loadTrack(currentSongIndex, true);
    bgm.volume = parseFloat(diVolume.value);
});

/* ----------------------------------------------------------
   USAGI & INTERACTION
----------------------------------------------------------- */
const logo = document.querySelector(".interactive-logo");
if (usagi && logo) {
    logo.addEventListener("click", function () {
        if (!document.body.classList.contains('music-started')) return;
        
        usagi.classList.remove("slide-down");
        usagi.classList.add("slide-up");

        const chirp = chirps[Math.floor(Math.random() * chirps.length)];
        chirp.currentTime = 0;
        chirp.play().catch(() => {});

        setTimeout(() => {
            usagi.classList.remove("slide-up");
            usagi.classList.add("slide-down");
        }, 4000);
    });
}

function spawnSunEmoji() {
    const el = document.createElement("div");
    const sunEmojis = ["☀️","🌤️","🌞","✨","🌻"];
    el.textContent = sunEmojis[Math.floor(Math.random() * sunEmojis.length)];
    el.style.position = "fixed";
    el.style.fontSize = (40 + Math.random() * 30) + "px";
    el.style.left = (Math.random() * (window.innerWidth - 80)) + "px";
    el.style.top = "-80px";
    el.style.zIndex = 20000;
    el.style.opacity = "1";
    el.style.pointerEvents = "none";
    el.style.transition = "transform 2.2s ease-in, opacity 1s ease-in 1.5s";
    document.body.appendChild(el);

    requestAnimationFrame(() => {
        el.style.transform = `translateY(${window.innerHeight + 200}px) rotate(${Math.random()*60 - 30}deg)`;
        el.style.opacity = "0";
    });

    setTimeout(() => { el.remove(); }, 2500);
}

const cdWrapper = document.getElementById("countdown");
if (cdWrapper) {
    cdWrapper.addEventListener("click", (e) => {
        if (!document.body.classList.contains('music-started')) return;
        e.stopPropagation();
        const burst = 6 + Math.floor(Math.random() * 5);
        for (let i = 0; i < burst; i++) {
            setTimeout(spawnSunEmoji, i * 120);
        }
    });
}

/* ----------------------------------------------------------
   NOTE PARTICLES — anchored to active vinyl disc
----------------------------------------------------------- */
function spawnNote() {
    if (bgm.paused) return;

    const notesContainer = document.getElementById("di-notes-container");
    if (!notesContainer) return;

    // Pick which vinyl is currently visible
    const activeVinyl = pillExpanded
        ? document.getElementById("di-vinyl-big")
        : document.getElementById("di-vinyl-compact");
    if (!activeVinyl) return;

    // Get positions relative to the pill (notes container parent)
    const pillRect  = diPill.getBoundingClientRect();
    const vinylRect = activeVinyl.getBoundingClientRect();

    // Center of the vinyl in pill-local coords
    const originX = (vinylRect.left - pillRect.left) + vinylRect.width  / 2;
    const originY = (vinylRect.top  - pillRect.top)  + vinylRect.height / 2;

    const note = document.createElement("div");
    note.className = "note-particle";

    const icons = ["♪", "♫", "♬", "♩", "𝄢"];
    note.textContent = icons[Math.floor(Math.random() * icons.length)];

    // Fly upward and outward from the disc
    const angleDeg = -20 - Math.random() * 140;
    const angleRad = angleDeg * (Math.PI / 180);
    const distance = 40 + Math.random() * 50;

    const tx = Math.cos(angleRad) * distance;
    const ty = Math.sin(angleRad) * distance;
    const rStart   = (Math.random() * 40  - 20)  + "deg";
    const rEnd     = (Math.random() * 180 - 90)  + "deg";
    const duration = (1.2 + Math.random() * 0.8) + "s";

    note.style.left = originX + "px";
    note.style.top  = originY + "px";
    note.style.setProperty('--tx',       `${tx}px`);
    note.style.setProperty('--ty',       `${ty}px`);
    note.style.setProperty('--rStart',   rStart);
    note.style.setProperty('--rEnd',     rEnd);
    note.style.setProperty('--duration', duration);

    notesContainer.appendChild(note);
    setTimeout(() => { note.remove(); }, parseFloat(duration) * 1000 + 100);
}
setInterval(spawnNote, 380);

// Blossoms Background
function spawnBlossom() {
    const blossom = document.createElement("div");
    blossom.className = "blossom";
    const emojis = ["🌸","🌷","🌼","🌺","🦋","🐝","🌿","🌱"];
    blossom.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    blossom.style.left = (Math.random() * window.innerWidth) + "px";
    blossom.style.top = "-50px";
    const duration = 4 + Math.random() * 5; 
    blossom.style.animation = `blossomFall ${duration}s linear forwards`;
    document.body.appendChild(blossom);
    setTimeout(() => { blossom.remove(); }, duration * 1000);
}
setInterval(() => {
    if (document.body.classList.contains('music-started')) {
        spawnBlossom();
    }
}, 1000);

// 3D Tilt
function init3DTilt() {
    const panel = document.querySelector('.info-panel');
    const container = document.querySelector('.tilt-container');
    if (!panel || !container) return;
    
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
        panel.style.transform = `rotateY(${mouseX * 15}deg) rotateX(${-mouseY * 15}deg) translateZ(10px)`;
    });
    container.addEventListener('mouseleave', () => {
        panel.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0px)';
    });
}
document.addEventListener('DOMContentLoaded', init3DTilt);

// Visualizer
const canvas = document.getElementById('canvasVisualizer');
const ctx = canvas.getContext('2d');
let rotation = 0;
const barCount = 64;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function animateVisualizer() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const logoEl = document.querySelector('.interactive-logo');
  
  if (logoEl) {
      const rect = logoEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radius = rect.width / 2 + 10; 

      rotation += 0.005;

      for (let i = 0; i < barCount; i++) {
        const angle = (i * Math.PI * 2) / barCount + rotation;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Mock frequency data based on time
        const height = 20 + Math.sin(Date.now()/300 + i * 0.5) * 50;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#4a90e2';
        ctx.fillStyle = '#73b7ff';
        ctx.fillRect(-3, 0, 6, height);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(-1, 0, 2, height * 0.8);
        ctx.restore();
      }
  }
  requestAnimationFrame(animateVisualizer);
}
document.addEventListener('DOMContentLoaded', animateVisualizer);

/* ----------------------------------------------------------
   FIREWORKS ENGINE
----------------------------------------------------------- */
const fwCanvas = document.getElementById('fireworksCanvas');
const fwCtx = fwCanvas.getContext('2d');
let fwWidth = window.innerWidth;
let fwHeight = window.innerHeight;
let fireworks = [];
let particles = [];
let fireworksActive = false;

window.addEventListener('resize', () => {
    fwWidth = window.innerWidth;
    fwHeight = window.innerHeight;
    fwCanvas.width = fwWidth;
    fwCanvas.height = fwHeight;
});
fwCanvas.width = fwWidth;
fwCanvas.height = fwHeight;

class Firework {
    constructor(tx, ty) {
        this.x = fwWidth / 2 + random(-200, 200); 
        this.y = fwHeight;
        this.tx = tx; 
        this.ty = ty; 
        this.distanceToTarget = Math.sqrt(Math.pow(tx - this.x, 2) + Math.pow(ty - this.y, 2));
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while(this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(ty - this.y, tx - this.x);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = random(50, 70);
        this.hue = random(0, 360); 
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.acceleration;
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        this.distanceTraveled = Math.sqrt(Math.pow(this.x - this.tx + vx, 2) + Math.pow(this.y - this.ty + vy, 2)); 
        
        if (this.distanceTraveled < this.distanceToTarget && this.y > this.ty) {
             this.x += vx;
             this.y += vy;
        } else {
             createParticles(this.tx, this.ty, this.hue);
             fireworks.splice(index, 1);
        }
    }

    draw() {
        fwCtx.beginPath();
        fwCtx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        fwCtx.lineTo(this.x, this.y);
        fwCtx.strokeStyle = 'hsl(' + this.hue + ', 100%, ' + this.brightness + '%)';
        fwCtx.stroke();
    }
}

class Particle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while(this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 10);
        this.friction = 0.95;
        this.gravity = 1;
        this.hue = random(hue - 20, hue + 20);
        this.brightness = random(50, 80);
        this.alpha = 1;
        this.decay = random(0.015, 0.03);
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }

    draw() {
        fwCtx.beginPath();
        fwCtx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        fwCtx.lineTo(this.x, this.y);
        fwCtx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
        fwCtx.stroke();
    }
}

function createParticles(x, y, hue) {
    let particleCount = 30;
    while(particleCount--) {
        particles.push(new Particle(x, y, hue));
    }
}

function loopFireworks() {
    if (!fireworksActive) return;

    requestAnimationFrame(loopFireworks);
    
    fwCtx.globalCompositeOperation = 'destination-out';
    fwCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    fwCtx.fillRect(0, 0, fwWidth, fwHeight);
    fwCtx.globalCompositeOperation = 'lighter';

    let i = fireworks.length;
    while(i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }

    let j = particles.length;
    while(j--) {
        particles[j].draw();
        particles[j].update(j);
    }

    if (Math.random() < 0.05) { 
        fireworks.push(new Firework(random(0, fwWidth), random(0, fwHeight / 2)));
    }
}

function startFireworks() {
    if (!fireworksActive) {
        fireworksActive = true;
        loopFireworks();
    }
}

/* ----------------------------------------------------------
   COUNTDOWN & LOGIC
----------------------------------------------------------- */
function updateNewYearCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Check if today is June 1st
    const isJune1 = (now.getMonth() === 5 && now.getDate() === 1);

    const cdEl = document.getElementById("countdown");
    if (!cdEl) return;

    if (isJune1) {
        cdEl.textContent = "🌸 HAPPY JUNE 1ST! 🌸";
        cdEl.style.textShadow = "0 0 20px #ff00cc, 0 0 40px #00ffff"; 
        startFireworks();
        return;
    }

    let june1 = new Date(currentYear, 5, 1);
    if (now >= june1) {
        june1 = new Date(currentYear + 1, 5, 1);
    }
    const timeLeft = june1 - now;

    if (timeLeft <= 0) {
        cdEl.textContent = "🌸 HAPPY JUNE 1ST! 🌸";
        cdEl.style.textShadow = "0 0 20px #ff00cc, 0 0 40px #00ffff"; 
        startFireworks();
        return;
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    cdEl.textContent = `${days}д ${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

setInterval(updateNewYearCountdown, 1000);
updateNewYearCountdown();