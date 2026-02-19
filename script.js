/* ==========================================================
   GLOBAL VARIABLES & SETUP
========================================================== */
const musicOverlay = document.getElementById("musicOverlay");
const bgm           = document.getElementById("bgm");
const usagi         = document.getElementById("usagi");

const chirps = [
    new Audio("chirper1.ogg"),
    new Audio("chirper2.ogg"),
    new Audio("chirper3.ogg")
];
chirps.forEach(c => { c.preload = "auto"; c.volume = 0.7; });

const songs = [
    { name: "iiSU",  src: "zinex.lol_files/iiSU.mp3"  },
    { name: "game",  src: "zinex.lol_files/game.mp3"  },
    { name: "Норм",  src: "zinex.lol_files/Норм.mp3"  }
];
let currentSongIndex = 0;
let isUserSeeking    = false;

/* ==========================================================
   DYNAMIC ISLAND ELEMENTS
========================================================== */
const diWrapper      = document.getElementById("di-wrapper");
const diPill         = document.getElementById("di-pill");
const diCompact      = document.getElementById("di-compact");
const diExpanded     = document.getElementById("di-expanded");
const diVinylCompact = document.getElementById("di-vinyl-compact");
const diVinylBig     = document.getElementById("di-vinyl-big");
const diTrackCompact = document.getElementById("di-track-compact");
const diTrackName    = document.getElementById("di-track-name");
const diEq           = document.getElementById("di-eq");
const diCurrent      = document.getElementById("di-current");
const diTotal        = document.getElementById("di-total");
const diProgress     = document.getElementById("di-progress");
const diPlayPause    = document.getElementById("di-playpause");
const diPrev         = document.getElementById("di-prev");
const diNext         = document.getElementById("di-next");
const diVolume       = document.getElementById("di-volume");
const diCloseBtn     = document.getElementById("di-close-btn");

let pillExpanded = false;

/* ==========================================================
   HELPER FUNCTIONS
========================================================== */
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function random(min, max) { return Math.random() * (max - min) + min; }

function updateSliderFill(slider) {
    const val = (slider.value - slider.min) / (slider.max - slider.min || 1) * 100;
    slider.style.background = `linear-gradient(to right, rgba(115,183,255,0.9) ${val}%, rgba(255,255,255,0.12) ${val}%)`;
}

/* ==========================================================
   PLAYER LOGIC
========================================================== */
function loadTrack(index, autoplay) {
    if (index < 0 || index >= songs.length) index = 0;
    currentSongIndex = index;
    const song = songs[index];
    bgm.src = song.src;
    bgm.load();
    diTrackCompact.textContent = song.name;
    diTrackName.textContent    = song.name;
    diProgress.value = 0;
    diProgress.max   = 0;
    diCurrent.textContent = "0:00";
    diTotal.textContent   = "0:00";
    updateSliderFill(diProgress);
    if (autoplay) {
        bgm.play().then(() => setPlayingUI(true)).catch(err => console.warn("Playback error:", err));
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
    if (bgm.paused) bgm.play().catch(e => console.warn(e));
    else bgm.pause();
}

function nextTrack() { loadTrack((currentSongIndex + 1) % songs.length, true); }
function prevTrack() {
    if (bgm.currentTime > 3) bgm.currentTime = 0;
    else loadTrack((currentSongIndex - 1 + songs.length) % songs.length, true);
}

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
bgm.addEventListener('ended', () => nextTrack());

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
diVolume.addEventListener('input', () => {
    bgm.volume = parseFloat(diVolume.value);
    updateSliderFill(diVolume);
});
updateSliderFill(diVolume);

diPlayPause.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
diNext.addEventListener('click', (e) => { e.stopPropagation(); nextTrack(); });
diPrev.addEventListener('click', (e) => { e.stopPropagation(); prevTrack(); });

/* ==========================================================
   DYNAMIC ISLAND EXPAND / COLLAPSE
========================================================== */
function expandPill()   { pillExpanded = true;  diPill.classList.add("expanded"); }
function collapsePill() { pillExpanded = false; diPill.classList.remove("expanded"); }

diCompact.addEventListener('click', () => { if (!pillExpanded) expandPill(); });
diPill.addEventListener('click',    () => { if (!pillExpanded) expandPill(); });
diCloseBtn.addEventListener('click', (e) => { e.stopPropagation(); collapsePill(); });
document.addEventListener('click', (e) => {
    if (pillExpanded && !diPill.contains(e.target)) collapsePill();
});

/* ==========================================================
   START EXPERIENCE
========================================================== */
musicOverlay.addEventListener('click', function () {
    this.style.opacity = '0';
    this.style.pointerEvents = 'none';
    document.body.classList.add("music-started");
    diWrapper.classList.remove("hidden");
    diWrapper.classList.add("visible");
    loadTrack(currentSongIndex, true);
    bgm.volume = parseFloat(diVolume.value);
});

/* ==========================================================
   USAGI & LOGO INTERACTION
========================================================== */
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

/* ==========================================================
   SEASONAL EVENT DEFINITIONS
   All months are 0-indexed (Jan=0, Dec=11).

   Schedule:
     Birthday    : Jan 2  – Mar 9   → celebrates on Mar 9,  post-effect: fireworks
     Summer      : Mar 10 – Jun 1   → celebrates on Jun 1,  post-effect: fireworks
     Back2School : Jun 2  – Sep 1   → celebrates on Sep 1,  post-effect: rain
     Halloween   : Sep 2  – Oct 31  → celebrates on Oct 31, post-effect: thunderstorm
     New Year    : Nov 1  – Jan 1   → celebrates on Jan 1,  post-effect: fireworks
========================================================== */
const SEASONS = [
    {
        id: "birthday",
        label: "🎂 Birthday",
        startMonth: 0, startDay: 2,
        endMonth:   2, endDay:   9,
        celebrationText:   "🎂 HAPPY BIRTHDAY! 🎉",
        celebrationShadow: "0 0 20px #ff69b4, 0 0 40px #ff1493",
        clickEmojis: ["🎂","🎉","🎈","🎁","🥳","🍰","🎊","✨"],
        postEffect: "fireworks"
    },
    {
        id: "summer",
        label: "☀️ Summer",
        startMonth: 2, startDay: 10,
        endMonth:   5, endDay:   1,
        celebrationText:   "☀️ HAPPY JUNE 1ST! ☀️",
        celebrationShadow: "0 0 20px #ff00cc, 0 0 40px #00ffff",
        clickEmojis: ["☀️","🌤️","🌞","✨","🌻","🌊","🏖️","🍹"],
        postEffect: "fireworks"
    },
    {
        id: "backToSchool",
        label: "📚 Back to School",
        startMonth: 5, startDay: 2,
        endMonth:   8, endDay:   1,
        celebrationText:   "📚 BACK TO SCHOOL! 🏫",
        celebrationShadow: "0 0 20px #4fc3f7, 0 0 40px #0288d1",
        clickEmojis: ["📚","✏️","🎒","📐","📏","🏫","🖊️","📝"],
        postEffect: "rain"
    },
    {
        id: "halloween",
        label: "🎃 Halloween",
        startMonth: 8, startDay: 2,
        endMonth:   9, endDay:   31,
        celebrationText:   "🎃 HAPPY HALLOWEEN! 👻",
        celebrationShadow: "0 0 20px #ff6600, 0 0 40px #aa00ff",
        clickEmojis: ["🎃","👻","🕷️","🦇","💀","🕸️","🍬","⚡"],
        postEffect: "thunderstorm"
    },
    {
        id: "newYear",
        label: "🎆 New Year",
        startMonth: 10, startDay: 1,
        endMonth:    0, endDay:   1,   // Jan 1 wraps to next year
        celebrationText:   "🎆 HAPPY NEW YEAR! 🎆",
        celebrationShadow: "0 0 20px #ffd700, 0 0 40px #ff4500",
        clickEmojis: ["🎆","🎇","✨","🥂","🍾","🎊","🌟","🎉"],
        postEffect: "fireworks"
    }
];

/* ==========================================================
   SEASON DETECTION
========================================================== */
function getCurrentSeason(now) {
    const m = now.getMonth();
    const d = now.getDate();
    for (const s of SEASONS) {
        if (s.id === "newYear") {
            // Nov 1 – Dec 31 OR Jan 1
            if ((m === 10 && d >= 1) || m === 11 || (m === 0 && d === 1)) return s;
        } else {
            const afterStart = (m > s.startMonth) || (m === s.startMonth && d >= s.startDay);
            const beforeEnd  = (m < s.endMonth)   || (m === s.endMonth   && d <= s.endDay);
            if (afterStart && beforeEnd) return s;
        }
    }
    return null;
}

function isEventDay(season, now) {
    return now.getMonth() === season.endMonth && now.getDate() === season.endDay;
}

function msUntilEventEnd(season, now) {
    const y = now.getFullYear();
    let target = new Date(y, season.endMonth, season.endDay, 0, 0, 0, 0);
    if (season.id === "newYear" && now.getMonth() >= 10) {
        target = new Date(y + 1, 0, 1, 0, 0, 0, 0);
    }
    if (target <= now) target.setFullYear(target.getFullYear() + 1);
    return target - now;
}

/* ==========================================================
   DEBUG STATE (session-only — no persistence)
========================================================== */
let debugOverrideSeason = null;  // season id string or null
let debugForceExpired   = false;

/* ==========================================================
   BACKGROUND EFFECTS — FIREWORKS
========================================================== */
const fwCanvas = document.getElementById('fireworksCanvas');
const fwCtx    = fwCanvas.getContext('2d');
let fwWidth  = window.innerWidth;
let fwHeight = window.innerHeight;
let fireworks   = [];
let fwParticles = [];
let fireworksActive  = false;
let fireworksLoopId  = null;

window.addEventListener('resize', () => {
    fwWidth  = window.innerWidth;
    fwHeight = window.innerHeight;
    fwCanvas.width  = fwWidth;
    fwCanvas.height = fwHeight;
});
fwCanvas.width  = fwWidth;
fwCanvas.height = fwHeight;

class Firework {
    constructor(tx, ty) {
        this.x = fwWidth / 2 + random(-200, 200);
        this.y = fwHeight;
        this.tx = tx; this.ty = ty;
        this.distanceToTarget = Math.hypot(tx - this.x, ty - this.y);
        this.coordinates = Array.from({length: 3}, () => [this.x, this.y]);
        this.angle = Math.atan2(ty - this.y, tx - this.x);
        this.speed = 2; this.acceleration = 1.05;
        this.brightness = random(50, 70);
        this.hue = random(0, 360);
    }
    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.acceleration;
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        const dist = Math.hypot(this.x - this.tx + vx, this.y - this.ty + vy);
        if (dist < this.distanceToTarget && this.y > this.ty) {
            this.x += vx; this.y += vy;
        } else {
            createFwParticles(this.tx, this.ty, this.hue);
            fireworks.splice(index, 1);
        }
    }
    draw() {
        fwCtx.beginPath();
        fwCtx.moveTo(...this.coordinates[this.coordinates.length - 1]);
        fwCtx.lineTo(this.x, this.y);
        fwCtx.strokeStyle = `hsl(${this.hue},100%,${this.brightness}%)`;
        fwCtx.stroke();
    }
}

class FwParticle {
    constructor(x, y, hue) {
        this.x = x; this.y = y;
        this.coordinates = Array.from({length: 5}, () => [x, y]);
        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 10);
        this.friction = 0.95; this.gravity = 1;
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
        if (this.alpha <= this.decay) fwParticles.splice(index, 1);
    }
    draw() {
        fwCtx.beginPath();
        fwCtx.moveTo(...this.coordinates[this.coordinates.length - 1]);
        fwCtx.lineTo(this.x, this.y);
        fwCtx.strokeStyle = `hsla(${this.hue},100%,${this.brightness}%,${this.alpha})`;
        fwCtx.stroke();
    }
}

function createFwParticles(x, y, hue) {
    for (let i = 0; i < 30; i++) fwParticles.push(new FwParticle(x, y, hue));
}

function loopFireworks() {
    if (!fireworksActive) return;
    fireworksLoopId = requestAnimationFrame(loopFireworks);
    fwCtx.globalCompositeOperation = 'destination-out';
    fwCtx.fillStyle = 'rgba(0,0,0,0.5)';
    fwCtx.fillRect(0, 0, fwWidth, fwHeight);
    fwCtx.globalCompositeOperation = 'lighter';
    let i = fireworks.length;   while (i--) { fireworks[i].draw();   fireworks[i].update(i); }
    let j = fwParticles.length; while (j--) { fwParticles[j].draw(); fwParticles[j].update(j); }
    if (Math.random() < 0.05) fireworks.push(new Firework(random(0, fwWidth), random(0, fwHeight / 2)));
}

function startFireworks() {
    if (fireworksActive) return;
    fireworksActive = true;
    loopFireworks();
}

function stopFireworks() {
    fireworksActive = false;
    if (fireworksLoopId) { cancelAnimationFrame(fireworksLoopId); fireworksLoopId = null; }
    fwCtx.clearRect(0, 0, fwWidth, fwHeight);
    fireworks = []; fwParticles = [];
}

/* ==========================================================
   BACKGROUND EFFECTS — RAIN
========================================================== */
let rainActive    = false;
let rainContainer = null;
let rainInterval  = null;

function ensureRainStyle() {
    if (document.getElementById("rain-keyframes")) return;
    const st = document.createElement("style");
    st.id = "rain-keyframes";
    st.textContent = `
        @keyframes rainFall {
            0%   { transform: translateY(0) skewX(-10deg); opacity: 1; }
            100% { transform: translateY(110vh) skewX(-10deg); opacity: 0.4; }
        }`;
    document.head.appendChild(st);
}

function makeRaindrop(heavy) {
    const drop = document.createElement("div");
    const h = heavy ? (8 + Math.random() * 16) : (10 + Math.random() * 20);
    const spd = heavy ? (0.4 + Math.random() * 0.4) : (0.6 + Math.random() * 0.6);
    const color = heavy
        ? "linear-gradient(transparent, rgba(100,140,255,0.9))"
        : "linear-gradient(transparent, rgba(120,180,255,0.7))";
    drop.style.cssText = `
        position:fixed; pointer-events:none; z-index:1;
        width:2px; height:${h}px; background:${color};
        left:${Math.random()*100}vw; top:-30px; border-radius:2px;
        animation:rainFall ${spd}s linear forwards;`;
    return drop;
}

function startRain() {
    if (rainActive) return;
    rainActive = true;
    ensureRainStyle();
    rainContainer = document.createElement("div");
    rainContainer.id = "rain-container";
    document.body.appendChild(rainContainer);
    rainInterval = setInterval(() => {
        if (!rainActive) return;
        const drop = makeRaindrop(false);
        rainContainer.appendChild(drop);
        setTimeout(() => drop.remove(), 1400);
    }, 40);
}

function stopRain() {
    rainActive = false;
    if (rainInterval) { clearInterval(rainInterval); rainInterval = null; }
    if (rainContainer) { rainContainer.remove(); rainContainer = null; }
}

/* ==========================================================
   BACKGROUND EFFECTS — THUNDERSTORM
========================================================== */
let stormActive            = false;
let stormContainer         = null;
let stormIntervalRain      = null;
let stormIntervalLightning = null;

function ensureStormStyle() {
    if (document.getElementById("storm-keyframes")) return;
    const st = document.createElement("style");
    st.id = "storm-keyframes";
    st.textContent = `
        @keyframes rainFall {
            0%   { transform: translateY(0) skewX(-10deg); opacity: 1; }
            100% { transform: translateY(110vh) skewX(-10deg); opacity: 0.4; }
        }
        @keyframes lightningFlash {
            0%   { opacity: 1; }
            100% { opacity: 0; }
        }`;
    document.head.appendChild(st);
}

function flashLightning() {
    const flash = document.createElement("div");
    flash.style.cssText = `
        position:fixed; inset:0; z-index:2; pointer-events:none;
        background:rgba(180,160,255,0.15);
        animation:lightningFlash 0.15s ease-out forwards;`;
    document.body.appendChild(flash);
    const bolt = document.createElement("div");
    bolt.style.cssText = `
        position:fixed; left:${15 + Math.random()*70}vw; top:0;
        z-index:3; pointer-events:none;
        font-size:${60 + Math.random()*80}px; opacity:0.9;
        animation:lightningFlash 0.25s ease-out forwards;`;
    bolt.textContent = "⚡";
    document.body.appendChild(bolt);
    setTimeout(() => { flash.remove(); bolt.remove(); }, 350);
}

function startThunderstorm() {
    if (stormActive) return;
    stormActive = true;
    ensureStormStyle();
    stormContainer = document.createElement("div");
    stormContainer.id = "storm-container";
    document.body.appendChild(stormContainer);
    stormIntervalRain = setInterval(() => {
        if (!stormActive) return;
        const drop = makeRaindrop(true);
        stormContainer.appendChild(drop);
        setTimeout(() => drop.remove(), 1100);
    }, 20);
    stormIntervalLightning = setInterval(() => {
        if (!stormActive) return;
        if (Math.random() < 0.35) flashLightning();
    }, 2000);
}

function stopThunderstorm() {
    stormActive = false;
    if (stormIntervalRain)      { clearInterval(stormIntervalRain);      stormIntervalRain = null; }
    if (stormIntervalLightning) { clearInterval(stormIntervalLightning); stormIntervalLightning = null; }
    if (stormContainer) { stormContainer.remove(); stormContainer = null; }
}

/* Unified helpers */
function stopAllEffects() {
    stopFireworks();
    stopRain();
    stopThunderstorm();
}

function triggerEffect(name) {
    stopAllEffects();
    if (name === "fireworks")    startFireworks();
    if (name === "rain")         startRain();
    if (name === "thunderstorm") startThunderstorm();
}

/* ==========================================================
   EMOJI BURST (click on countdown)
========================================================== */
let currentClickEmojis = ["✨","🌸","⭐","💫"];

function spawnClickEmoji() {
    const el = document.createElement("div");
    el.textContent = currentClickEmojis[Math.floor(Math.random() * currentClickEmojis.length)];
    el.style.cssText = `
        position:fixed; font-size:${40 + Math.random()*30}px;
        left:${Math.random()*(window.innerWidth - 80)}px; top:-80px;
        z-index:20000; opacity:1; pointer-events:none;
        transition:transform 2.2s ease-in, opacity 1s ease-in 1.5s;`;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
        el.style.transform = `translateY(${window.innerHeight + 200}px) rotate(${Math.random()*60-30}deg)`;
        el.style.opacity = "0";
    });
    setTimeout(() => el.remove(), 2500);
}

function burstEmojis(count) {
    count = count || 8;
    for (let i = 0; i < count; i++) setTimeout(spawnClickEmoji, i * 110);
}

const cdWrapper = document.getElementById("countdown");
if (cdWrapper) {
    cdWrapper.addEventListener("click", (e) => {
        if (!document.body.classList.contains('music-started')) return;
        e.stopPropagation();
        burstEmojis(6 + Math.floor(Math.random() * 5));
    });
}

/* ==========================================================
   COUNTDOWN ENGINE
========================================================== */
let currentActiveSeason = null;
let postEffectTimer     = null;

function resolveNow() {
    let now = new Date();
    if (debugForceExpired && currentActiveSeason) {
        // Simulate event just ended: midnight of end day + 1 minute
        const s = currentActiveSeason;
        const y = now.getFullYear();
        now = (s.id === "newYear" && now.getMonth() >= 10)
            ? new Date(y + 1, 0, 1, 0, 1, 0)
            : new Date(y, s.endMonth, s.endDay, 0, 1, 0);
    }
    return now;
}

function updateCountdown() {
    const now    = resolveNow();
    const season = debugOverrideSeason
        ? (SEASONS.find(s => s.id === debugOverrideSeason) || getCurrentSeason(now))
        : getCurrentSeason(now);
    const cdEl   = document.getElementById("countdown");
    if (!cdEl) return;

    if (!season) { cdEl.textContent = "✨"; return; }

    currentActiveSeason = season;
    currentClickEmojis  = season.clickEmojis;

    // Celebration day (or debug force-expire)
    if (isEventDay(season, now) || debugForceExpired) {
        cdEl.textContent      = season.celebrationText;
        cdEl.style.textShadow = season.celebrationShadow;
        triggerEffect(season.postEffect);
        if (postEffectTimer) clearTimeout(postEffectTimer);
        postEffectTimer = setTimeout(stopAllEffects, 86400000); // auto-stop after 24 h
        return;
    }

    // Normal countdown display
    cdEl.style.textShadow = "0 0 20px #ff00cc, 0 0 40px #ff0066";
    const ms   = msUntilEventEnd(season, now);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hrs  = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((ms % (1000 * 60)) / 1000);
    cdEl.textContent = `${days}д ${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* ==========================================================
   NOTE PARTICLES
========================================================== */
function spawnNote() {
    if (bgm.paused) return;
    const notesContainer = document.getElementById("di-notes-container");
    if (!notesContainer) return;
    const activeVinyl = pillExpanded
        ? document.getElementById("di-vinyl-big")
        : document.getElementById("di-vinyl-compact");
    if (!activeVinyl) return;
    const pillRect  = diPill.getBoundingClientRect();
    const vinylRect = activeVinyl.getBoundingClientRect();
    const originX = (vinylRect.left - pillRect.left) + vinylRect.width  / 2;
    const originY = (vinylRect.top  - pillRect.top)  + vinylRect.height / 2;
    const note = document.createElement("div");
    note.className = "note-particle";
    const icons = ["♪","♫","♬","♩","𝄢"];
    note.textContent = icons[Math.floor(Math.random() * icons.length)];
    const angleDeg  = -20 - Math.random() * 140;
    const angleRad  = angleDeg * (Math.PI / 180);
    const distance  = 40 + Math.random() * 50;
    const tx       = Math.cos(angleRad) * distance;
    const ty       = Math.sin(angleRad) * distance;
    const rStart   = (Math.random() * 40  - 20) + "deg";
    const rEnd     = (Math.random() * 180 - 90) + "deg";
    const duration = (1.2 + Math.random() * 0.8) + "s";
    note.style.left = originX + "px";
    note.style.top  = originY + "px";
    note.style.setProperty('--tx',       `${tx}px`);
    note.style.setProperty('--ty',       `${ty}px`);
    note.style.setProperty('--rStart',   rStart);
    note.style.setProperty('--rEnd',     rEnd);
    note.style.setProperty('--duration', duration);
    notesContainer.appendChild(note);
    setTimeout(() => note.remove(), parseFloat(duration) * 1000 + 100);
}
setInterval(spawnNote, 380);

/* ==========================================================
   BLOSSOMS
========================================================== */
function spawnBlossom() {
    const blossom = document.createElement("div");
    blossom.className = "blossom";
    const emojis = ["🌸","🌷","🌼","🌺","🦋","🐝","🌿","🌱"];
    blossom.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    blossom.style.left = (Math.random() * window.innerWidth) + "px";
    blossom.style.top  = "-50px";
    const duration = 4 + Math.random() * 5;
    blossom.style.animation = `blossomFall ${duration}s linear forwards`;
    document.body.appendChild(blossom);
    setTimeout(() => blossom.remove(), duration * 1000);
}
setInterval(() => {
    if (document.body.classList.contains('music-started')) spawnBlossom();
}, 1000);

/* ==========================================================
   3D TILT
========================================================== */
function init3DTilt() {
    const panel     = document.querySelector('.info-panel');
    const container = document.querySelector('.tilt-container');
    if (!panel || !container) return;
    container.addEventListener('mousemove', (e) => {
        const rect   = container.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width  - 0.5;
        const mouseY = (e.clientY - rect.top)  / rect.height - 0.5;
        panel.style.transform = `rotateY(${mouseX*15}deg) rotateX(${-mouseY*15}deg) translateZ(10px)`;
    });
    container.addEventListener('mouseleave', () => {
        panel.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0px)';
    });
}
document.addEventListener('DOMContentLoaded', init3DTilt);

/* ==========================================================
   VISUALIZER
========================================================== */
const canvas   = document.getElementById('canvasVisualizer');
const ctx      = canvas.getContext('2d');
let rotation   = 0;
const barCount = 64;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function animateVisualizer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const logoEl = document.querySelector('.interactive-logo');
    if (logoEl) {
        const rect    = logoEl.getBoundingClientRect();
        const centerX = rect.left + rect.width  / 2;
        const centerY = rect.top  + rect.height / 2;
        const radius  = rect.width / 2 + 10;
        rotation += 0.005;
        for (let i = 0; i < barCount; i++) {
            const angle  = (i * Math.PI * 2) / barCount + rotation;
            const x      = centerX + Math.cos(angle) * radius;
            const y      = centerY + Math.sin(angle) * radius;
            const height = 20 + Math.sin(Date.now()/300 + i * 0.5) * 50;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.shadowBlur  = 30;
            ctx.shadowColor = '#4a90e2';
            ctx.fillStyle   = '#73b7ff';
            ctx.fillRect(-3, 0, 6, height);
            ctx.fillStyle   = '#ffffff';
            ctx.globalAlpha = 0.6;
            ctx.fillRect(-1, 0, 2, height * 0.8);
            ctx.restore();
        }
    }
    requestAnimationFrame(animateVisualizer);
}
document.addEventListener('DOMContentLoaded', animateVisualizer);

/* ==========================================================
   ██████╗ ███████╗██████╗ ██╗   ██╗ ██████╗
   ██╔══██╗██╔════╝██╔══██╗██║   ██║██╔════╝
   ██║  ██║█████╗  ██████╔╝██║   ██║██║  ███╗
   ██║  ██║██╔══╝  ██╔══██╗██║   ██║██║   ██║
   ██████╔╝███████╗██████╔╝╚██████╔╝╚██████╔╝
   ╚═════╝ ╚══════╝╚═════╝  ╚═════╝  ╚═════╝
========================================================== */
const DEBUG_CODE       = "kuitmeiqkmo";
const DEBUG_UNLOCK_KEY = "zinex_debug_unlocked";  // localStorage key
let   debugKeyBuffer   = "";
let   debugBtnVisible  = false;

/* ---- Secret keyboard activation ---- */
document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
    debugKeyBuffer += e.key.toLowerCase();
    if (debugKeyBuffer.length > DEBUG_CODE.length) {
        debugKeyBuffer = debugKeyBuffer.slice(-DEBUG_CODE.length);
    }
    if (debugKeyBuffer === DEBUG_CODE) {
        unlockDebugButton();   // show the persistent button
        toggleDebugMenu();     // also open menu immediately
        debugKeyBuffer = "";
    }
});

/* ---- Persistent debug button ---- */
function unlockDebugButton() {
    if (debugBtnVisible) return;
    debugBtnVisible = true;
    try { localStorage.setItem(DEBUG_UNLOCK_KEY, "1"); } catch(e) {}
    createDebugButton();
}

function hideDebugButton() {
    debugBtnVisible = false;
    try { localStorage.removeItem(DEBUG_UNLOCK_KEY); } catch(e) {}
    document.getElementById("dbg-fab")?.remove();
}

function createDebugButton() {
    if (document.getElementById("dbg-fab")) return;
    const fab = document.createElement("button");
    fab.id = "dbg-fab";
    fab.textContent = "debug";
    fab.title = "Open Debug Menu";
    fab.style.cssText = `
        position:fixed; bottom:18px; left:18px; z-index:9999996;
        background:rgba(6,6,14,0.85);
        border:1px solid rgba(115,183,255,0.35);
        color:rgba(115,183,255,0.75);
        font-family:'ContinuumMedium', monospace;
        font-size:11px; letter-spacing:1.5px; text-transform:lowercase;
        padding:6px 13px; border-radius:20px; cursor:pointer;
        backdrop-filter:blur(6px);
        box-shadow:0 2px 12px rgba(0,0,0,0.5), 0 0 0 0 rgba(115,183,255,0);
        transition:all 0.2s ease;
        opacity:0.55;
    `;
    fab.addEventListener("mouseenter", () => {
        fab.style.opacity = "1";
        fab.style.borderColor = "rgba(115,183,255,0.7)";
        fab.style.color = "#73b7ff";
        fab.style.boxShadow = "0 4px 20px rgba(0,0,0,0.6), 0 0 10px rgba(115,183,255,0.2)";
    });
    fab.addEventListener("mouseleave", () => {
        fab.style.opacity = "0.55";
        fab.style.borderColor = "rgba(115,183,255,0.35)";
        fab.style.color = "rgba(115,183,255,0.75)";
        fab.style.boxShadow = "0 2px 12px rgba(0,0,0,0.5)";
    });
    fab.addEventListener("click", () => toggleDebugMenu());
    document.body.appendChild(fab);
}

/* ---- Restore button on page load if previously unlocked ---- */
(function restoreDebugButton() {
    try {
        if (localStorage.getItem(DEBUG_UNLOCK_KEY) === "1") {
            debugBtnVisible = true;
            // Wait for DOM before injecting
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", createDebugButton);
            } else {
                createDebugButton();
            }
        }
    } catch(e) {}
})();

/* ---------- Build & inject menu DOM (only once) ---------- */
function buildDebugMenu() {
    if (document.getElementById("debug-menu")) return;

    /* Styles */
    const style = document.createElement("style");
    style.textContent = `
        #debug-overlay {
            position:fixed; inset:0; z-index:9999997;
            background:rgba(0,0,0,0.55); display:none;
            backdrop-filter:blur(3px);
        }
        #debug-overlay.open { display:block; }

        #debug-menu {
            position:fixed; top:50%; left:50%;
            transform:translate(-50%,-50%) scale(0.94);
            z-index:9999998;
            background:rgba(6,6,14,0.97);
            border:1px solid rgba(115,183,255,0.35);
            border-radius:18px;
            padding:26px 30px 22px;
            width:min(500px, 93vw);
            max-height:88vh; overflow-y:auto;
            box-shadow:0 0 80px rgba(115,183,255,0.15), 0 24px 70px rgba(0,0,0,0.85);
            font-family:'ContinuumMedium', monospace;
            color:#fff;
            opacity:0; pointer-events:none;
            transition:opacity 0.22s ease, transform 0.22s ease;
        }
        #debug-menu.open {
            opacity:1; pointer-events:all;
            transform:translate(-50%,-50%) scale(1);
        }

        #debug-menu h2 {
            margin:0 0 3px; font-size:17px; letter-spacing:2px;
            color:#73b7ff; text-transform:uppercase;
        }
        .dbg-sub {
            font-size:10.5px; color:rgba(255,255,255,0.28);
            margin-bottom:22px; letter-spacing:0.8px;
        }
        .dbg-sub code {
            background:rgba(115,183,255,0.12);
            border:1px solid rgba(115,183,255,0.2);
            border-radius:4px; padding:1px 5px;
            font-size:10px; color:rgba(115,183,255,0.8);
        }
        .dbg-badge {
            display:inline-block; font-size:8.5px;
            padding:2px 7px; border-radius:20px;
            background:rgba(255,150,0,0.15);
            border:1px solid rgba(255,150,0,0.35);
            color:rgba(255,165,0,0.9);
            letter-spacing:1px; text-transform:uppercase;
            margin-left:7px; vertical-align:middle;
        }

        .dbg-section {
            margin-bottom:20px; padding-bottom:18px;
            border-bottom:1px solid rgba(255,255,255,0.07);
        }
        .dbg-section:last-child { border-bottom:none; margin-bottom:0; }

        .dbg-lbl {
            font-size:9.5px; color:rgba(115,183,255,0.65);
            text-transform:uppercase; letter-spacing:1.5px;
            margin-bottom:9px;
        }
        .dbg-row {
            display:flex; flex-wrap:wrap; gap:8px; align-items:center;
        }

        .dbtn {
            background:rgba(115,183,255,0.08);
            border:1px solid rgba(115,183,255,0.28);
            color:#e8e8ff; border-radius:9px;
            padding:7px 15px; font-size:11.5px;
            font-family:'ContinuumMedium', monospace;
            cursor:pointer; transition:all 0.18s;
            white-space:nowrap;
        }
        .dbtn:hover {
            background:rgba(115,183,255,0.22);
            border-color:rgba(115,183,255,0.55);
            transform:translateY(-1px);
        }
        .dbtn.active {
            background:rgba(115,183,255,0.3);
            border-color:#73b7ff;
            box-shadow:0 0 12px rgba(115,183,255,0.3);
            color:#fff;
        }
        .dbtn.red {
            border-color:rgba(255,90,90,0.4);
            background:rgba(255,60,60,0.08);
        }
        .dbtn.red:hover {
            background:rgba(255,60,60,0.22);
            border-color:rgba(255,90,90,0.7);
        }
        .dbtn.green {
            border-color:rgba(80,255,140,0.35);
            background:rgba(50,200,90,0.08);
        }
        .dbtn.green:hover {
            background:rgba(50,200,90,0.2);
            border-color:rgba(80,255,140,0.6);
        }

        .dbg-select {
            background:rgba(115,183,255,0.07);
            border:1px solid rgba(115,183,255,0.28);
            color:#e8e8ff; border-radius:9px;
            padding:7px 12px; font-size:11.5px;
            font-family:'ContinuumMedium', monospace;
            cursor:pointer; flex:1; min-width:170px;
        }
        .dbg-select option { background:#0a0a1a; color:#e8e8ff; }

        .dbg-status {
            font-size:10.5px; color:rgba(255,255,255,0.38);
            margin-top:9px; padding:7px 11px;
            background:rgba(255,255,255,0.03);
            border-radius:7px;
            border-left:2px solid rgba(115,183,255,0.35);
            line-height:1.5;
        }
        .dbg-status.warn { border-left-color:rgba(255,165,0,0.6); color:rgba(255,180,50,0.7); }
        .dbg-status.ok   { border-left-color:rgba(80,220,120,0.6); color:rgba(80,220,120,0.7); }

        #dbg-close {
            position:absolute; top:15px; right:17px;
            background:rgba(255,255,255,0.06); border:none;
            color:rgba(255,255,255,0.45); width:28px; height:28px;
            border-radius:50%; cursor:pointer; font-size:15px;
            display:flex; align-items:center; justify-content:center;
            transition:all 0.2s;
        }
        #dbg-close:hover { background:rgba(255,70,70,0.18); color:#fff; }
    `;
    document.head.appendChild(style);

    /* Overlay */
    const overlay = document.createElement("div");
    overlay.id = "debug-overlay";
    overlay.addEventListener("click", closeDebugMenu);
    document.body.appendChild(overlay);

    /* Panel */
    const menu = document.createElement("div");
    menu.id = "debug-menu";
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-modal", "true");

    menu.innerHTML = `
        <button id="dbg-close" title="Close">✕</button>
        <h2>🛠 Debug Menu <span class="dbg-badge">dev only</span></h2>
        <div class="dbg-sub">Type <code>kuitmeiqkmo</code> to toggle &nbsp;·&nbsp; All settings reset on page refresh</div>

        <!-- ① Season Override -->
        <div class="dbg-section">
            <div class="dbg-lbl">📅 Season Override</div>
            <div class="dbg-row">
                <select class="dbg-select" id="dbg-sel">
                    <option value="">— Use real system date —</option>
                    ${SEASONS.map(s => `<option value="${s.id}">${s.label}</option>`).join("")}
                </select>
                <button class="dbtn green" id="dbg-apply">Apply</button>
                <button class="dbtn red"   id="dbg-clear-season">Clear</button>
            </div>
            <div class="dbg-status" id="dbg-season-st">Using real system date — no override active.</div>
        </div>

        <!-- ② Force Expire -->
        <div class="dbg-section">
            <div class="dbg-lbl">⏩ Time Fast-Forward</div>
            <div class="dbg-row">
                <button class="dbtn red"   id="dbg-expire">💥 Force Expire Timer</button>
                <button class="dbtn green" id="dbg-unexpire">↩ Restore Normal Time</button>
            </div>
            <div class="dbg-status" id="dbg-expire-st">Timer running at real speed.</div>
        </div>

        <!-- ③ Background Effects -->
        <div class="dbg-section">
            <div class="dbg-lbl">🎆 Background Effects</div>
            <div class="dbg-row">
                <button class="dbtn" id="dbg-fw">🎆 Fireworks</button>
                <button class="dbtn" id="dbg-rain">🌧 Rain</button>
                <button class="dbtn" id="dbg-storm">⛈ Thunderstorm</button>
                <button class="dbtn red" id="dbg-stop-fx">✕ Stop All</button>
            </div>
            <div class="dbg-status" id="dbg-fx-st">No background effect active.</div>
        </div>

        <!-- ④ Emoji Burst -->
        <div class="dbg-section">
            <div class="dbg-lbl">✨ Emoji Burst Preview</div>
            <div class="dbg-row" id="dbg-emoji-row">
                ${SEASONS.map(s => `
                    <button class="dbtn"
                        data-emojis='${JSON.stringify(s.clickEmojis)}'
                        title="${s.label}">
                        ${s.clickEmojis.slice(0,3).join("")}
                    </button>`).join("")}
            </div>
        </div>

        <!-- ⑤ Button visibility -->
        <div class="dbg-section">
            <div class="dbg-lbl">👁 Debug Button Visibility</div>
            <div class="dbg-row">
                <button class="dbtn red" id="dbg-hide-btn">Hide debug button</button>
                <span style="font-size:10px;color:rgba(255,255,255,0.25);line-height:1.4;max-width:200px">
                    Re-type the secret code to bring it back.
                </span>
            </div>
        </div>
    `;
    document.body.appendChild(menu);

    /* ---- Wire controls ---- */
    document.getElementById("dbg-close").addEventListener("click", closeDebugMenu);

    // Season apply / clear
    document.getElementById("dbg-apply").addEventListener("click", () => {
        debugOverrideSeason = document.getElementById("dbg-sel").value || null;
        debugForceExpired   = false;
        updateCountdown();
        syncDebugUI();
    });
    document.getElementById("dbg-clear-season").addEventListener("click", () => {
        debugOverrideSeason = null;
        debugForceExpired   = false;
        document.getElementById("dbg-sel").value = "";
        updateCountdown();
        syncDebugUI();
    });

    // Force expire
    document.getElementById("dbg-expire").addEventListener("click", () => {
        debugForceExpired = true;
        updateCountdown();
        syncDebugUI();
    });
    document.getElementById("dbg-unexpire").addEventListener("click", () => {
        debugForceExpired = false;
        stopAllEffects();
        updateCountdown();
        syncDebugUI();
    });

    // Effect buttons
    document.getElementById("dbg-fw").addEventListener("click",      () => { triggerEffect("fireworks");    syncDebugUI(); });
    document.getElementById("dbg-rain").addEventListener("click",    () => { triggerEffect("rain");         syncDebugUI(); });
    document.getElementById("dbg-storm").addEventListener("click",   () => { triggerEffect("thunderstorm"); syncDebugUI(); });
    document.getElementById("dbg-stop-fx").addEventListener("click", () => { stopAllEffects();              syncDebugUI(); });

    // Hide debug button
    document.getElementById("dbg-hide-btn").addEventListener("click", () => {
        closeDebugMenu();
        hideDebugButton();
    });

    // Emoji burst preview buttons
    document.getElementById("dbg-emoji-row").querySelectorAll("[data-emojis]").forEach(btn => {
        btn.addEventListener("click", () => {
            const saved = currentClickEmojis;
            currentClickEmojis = JSON.parse(btn.dataset.emojis);
            burstEmojis(12);
            setTimeout(() => { currentClickEmojis = saved; }, 400);
        });
    });
}

/* ---------- Sync UI state to reflect reality ---------- */
function syncDebugUI() {
    const seasonSt  = document.getElementById("dbg-season-st");
    const expireSt  = document.getElementById("dbg-expire-st");
    const fxSt      = document.getElementById("dbg-fx-st");
    const sel       = document.getElementById("dbg-sel");

    if (seasonSt) {
        if (debugOverrideSeason) {
            const s = SEASONS.find(x => x.id === debugOverrideSeason);
            seasonSt.textContent = `Override active → ${s ? s.label : debugOverrideSeason}`;
            seasonSt.className   = "dbg-status warn";
        } else {
            seasonSt.textContent = "Using real system date — no override active.";
            seasonSt.className   = "dbg-status";
        }
        if (sel) sel.value = debugOverrideSeason || "";
    }

    if (expireSt) {
        expireSt.textContent = debugForceExpired
            ? "⚠️ Timer force-expired — post-event effect should be visible."
            : "Timer running at real speed.";
        expireSt.className = debugForceExpired ? "dbg-status warn" : "dbg-status";
    }

    // FX status + active highlight
    ["dbg-fw","dbg-rain","dbg-storm"].forEach(id => {
        document.getElementById(id)?.classList.remove("active");
    });
    let activeName = "None";
    if (fireworksActive)  { document.getElementById("dbg-fw")?.classList.add("active");    activeName = "Fireworks"; }
    if (rainActive)       { document.getElementById("dbg-rain")?.classList.add("active");  activeName = "Rain"; }
    if (stormActive)      { document.getElementById("dbg-storm")?.classList.add("active"); activeName = "Thunderstorm"; }
    if (fxSt) {
        fxSt.textContent = `Active effect: ${activeName}`;
        fxSt.className   = activeName !== "None" ? "dbg-status ok" : "dbg-status";
    }
}

/* ---------- Open / close ---------- */
function openDebugMenu() {
    buildDebugMenu();
    document.getElementById("debug-menu").classList.add("open");
    document.getElementById("debug-overlay").classList.add("open");
    syncDebugUI();
}

function closeDebugMenu() {
    document.getElementById("debug-menu")?.classList.remove("open");
    document.getElementById("debug-overlay")?.classList.remove("open");
}

function toggleDebugMenu() {
    if (document.getElementById("debug-menu")?.classList.contains("open")) closeDebugMenu();
    else openDebugMenu();
}