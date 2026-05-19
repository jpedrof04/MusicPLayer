const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const playlist = document.getElementById('playlist');
const searchInput = document.getElementById('search');
const songCount = document.getElementById('songCount');
const volumeSlider = document.getElementById('volumeSlider');
const bassSlider = document.getElementById('bassSlider');
const trebleSlider = document.getElementById('trebleSlider');

audio.volume = 0.7;
volumeSlider.addEventListener('input', () => {
  audio.volume = parseFloat(volumeSlider.value);
});
bassSlider.addEventListener('input', () => {
  if (typeof bassFilter !== 'undefined' && bassFilter) bassFilter.gain.value = parseFloat(bassSlider.value);
});
trebleSlider.addEventListener('input', () => {
  if (typeof trebleFilter !== 'undefined' && trebleFilter) trebleFilter.gain.value = parseFloat(trebleSlider.value);
});

let songs = [];
let currentIndex = 0;
let isPlaying = false;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function renderPlaylist(filter = '') {
  const filtered = songs.filter(s =>
    s.name.toLowerCase().includes(filter.toLowerCase())
  );
  playlist.innerHTML = '';

  if (filtered.length === 0) {
    playlist.innerHTML = '<li class="playlist-empty">No songs found</li>';
    return;
  }

  filtered.forEach((song, i) => {
    const li = document.createElement('li');
    li.className = 'playlist-item';
    const realIndex = songs.indexOf(song);
    if (realIndex === currentIndex) li.classList.add('active');

    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = String(i + 1).padStart(2, '0');

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = song.name.replace(/\.[^.]+$/, '');

    const indicator = document.createElement('span');
    indicator.className = 'indicator';
    indicator.textContent = 'Now Playing';

    li.appendChild(num);
    li.appendChild(name);
    li.appendChild(indicator);

    li.addEventListener('click', () => {
      if (realIndex === currentIndex && isPlaying) return;
      currentIndex = realIndex;
      loadSong(currentIndex);
      play();
    });

    playlist.appendChild(li);
  });
}

function loadSong(index) {
  const song = songs[index];
  if (!song) return;
  title.textContent = song.name.replace(/\.[^.]+$/, '');
  artist.textContent = 'Unknown Artist';
  audio.src = song.url;
  progressFill.style.width = '0%';
  currentTimeEl.textContent = '0:00';
  durationEl.textContent = '0:00';
  renderPlaylist(searchInput.value);
}

function play() {
  initVisualizer();
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      isPlaying = true;
      updatePlayBtn();
    }).catch(() => {});
  }
}

function pause() {
  audio.pause();
  isPlaying = false;
  updatePlayBtn();
}

function togglePlay() {
  if (audio.src) {
    if (isPlaying) pause();
    else play();
  }
}

function prevTrack() {
  if (songs.length === 0) return;
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  if (isPlaying) play();
  else updatePlayBtn();
}

function nextTrack() {
  if (songs.length === 0) return;
  currentIndex = (currentIndex + 1) % songs.length;
  loadSong(currentIndex);
  if (isPlaying) play();
  else updatePlayBtn();
}

function updatePlayBtn() {
  const svg = playBtn.querySelector('svg');
  if (isPlaying) {
    svg.innerHTML = `
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/>
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>
    `;
    playBtn.title = 'Pause';
  } else {
    svg.innerHTML = `<polygon points="8,5 19,12 8,19" fill="currentColor"/>`;
    playBtn.title = 'Play';
  }
}

function updateProgress() {
  if (audio.duration) {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${percent}%`;
  }
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

function setProgress(e) {
  const rect = progressBar.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  if (audio.duration) {
    audio.currentTime = x * audio.duration;
  }
}

async function loadSongs() {
  try {
    const res = await fetch('/api/songs');
    if (!res.ok) throw new Error('Failed to fetch songs');
    songs = await res.json();
    songCount.textContent = `${songs.length} song${songs.length !== 1 ? 's' : ''}`;
    renderPlaylist();
    if (songs.length > 0) {
      currentIndex = 0;
      loadSong(currentIndex);
    }
  } catch (err) {
    title.textContent = 'Could not load songs';
    artist.textContent = 'Make sure the server is running';
    songCount.textContent = '0 songs';
    playlist.innerHTML = '<li class="playlist-empty">Failed to load songs</li>';
  }
}

// Audio events
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener('ended', nextTrack);

// UI events
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
progressBar.addEventListener('click', setProgress);
searchInput.addEventListener('input', () => renderPlaylist(searchInput.value));

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
  if (e.code === 'ArrowLeft') prevTrack();
  if (e.code === 'ArrowRight') nextTrack();
});

// ── Temas ──
const themeBtns = document.querySelectorAll('.theme-btn');
const root = document.documentElement;

const themes = {
  red: {
    '--bg': '#050508', '--surface': 'rgba(18,5,8,0.55)', '--card': 'rgba(30,5,10,0.45)',
    '--border': 'rgba(255,30,30,0.15)', '--red': '#ff2040', '--red-bright': '#ff4060',
    '--orange': '#ff5020', '--pink': '#ff2070',
    '--grad': 'linear-gradient(135deg, #ff2040, #ff5020)',
    '--text': '#f0e0e0', '--muted': '#906060'
  },
  blue: {
    '--bg': '#040810', '--surface': 'rgba(5,10,25,0.55)', '--card': 'rgba(5,10,35,0.45)',
    '--border': 'rgba(30,100,255,0.15)', '--red': '#2060ff', '--red-bright': '#4080ff',
    '--orange': '#2090ff', '--pink': '#2060ff',
    '--grad': 'linear-gradient(135deg, #2060ff, #2090ff)',
    '--text': '#e0e8f0', '--muted': '#6080a0'
  },
  purple: {
    '--bg': '#0a0510', '--surface': 'rgba(20,5,30,0.55)', '--card': 'rgba(25,5,35,0.45)',
    '--border': 'rgba(180,30,255,0.15)', '--red': '#b020ff', '--red-bright': '#c040ff',
    '--orange': '#d050ff', '--pink': '#e020ff',
    '--grad': 'linear-gradient(135deg, #b020ff, #d050ff)',
    '--text': '#f0e0f0', '--muted': '#9060a0'
  },
  mix: {
    '--bg': '#050508', '--surface': 'rgba(18,5,12,0.55)', '--card': 'rgba(25,5,15,0.45)',
    '--border': 'rgba(255,60,100,0.15)', '--red': '#ff2040', '--red-bright': '#4080ff',
    '--orange': '#b020ff', '--pink': '#ff2070',
    '--grad': 'linear-gradient(135deg, #ff2040, #b020ff, #2080ff)',
    '--text': '#f0e0e0', '--muted': '#806080'
  }
};

themeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    themeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const theme = themes[btn.dataset.theme];
    for (const [key, value] of Object.entries(theme)) {
      root.style.setProperty(key, value);
    }
  });
});

// ── Visualizer (ondas sonoras estilo DJ) ──
const visCanvas = document.getElementById('visualizer');
const vctx = visCanvas.getContext('2d');
const glowOverlay = document.getElementById('glowOverlay');
const playerEl = document.getElementById('player');
const flashOverlay = document.getElementById('flashOverlay');
let audioCtx = null;
let analyser = null;
let sourceNode = null;
let bassFilter = null;
let trebleFilter = null;
let visReady = false;
let animId = null;

function initVisualizer() {
  if (visReady) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    sourceNode = audioCtx.createMediaElementSource(audio);
    sourceNode.connect(analyser);

    bassFilter = audioCtx.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 250;
    bassFilter.gain.value = 0;

    trebleFilter = audioCtx.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 4000;
    trebleFilter.gain.value = 0;

    analyser.connect(bassFilter);
    bassFilter.connect(trebleFilter);
    trebleFilter.connect(audioCtx.destination);

    bassSlider.value = '0';
    trebleSlider.value = '0';

    visReady = true;
    resizeCanvas();
    startVisLoop();
  } catch (e) {
    // Visualizador não disponível
  }
}

function resizeCanvas() {
  const rect = visCanvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  visCanvas.width = rect.width * dpr;
  visCanvas.height = rect.height * dpr;
  vctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function startVisLoop() {
  const bufferLength = analyser.frequencyBinCount;
  const freqData = new Uint8Array(bufferLength);
  const waveData = new Uint8Array(bufferLength);

  let prevAvg = 0;
  let flashTimeout = null;
  let pillarFlash = 0;
  let rings = [];
  let particles = [];

  function draw() {
    animId = requestAnimationFrame(draw);
    const w = visCanvas.width / (window.devicePixelRatio || 1);
    const h = visCanvas.height / (window.devicePixelRatio || 1);

    analyser.getByteFrequencyData(freqData);
    analyser.getByteTimeDomainData(waveData);

    vctx.clearRect(0, 0, w, h);

    // ── Volume médio para brilho reativo ──
    const avg = freqData.reduce((a, b) => a + b, 0) / freqData.length;
    const intensity = Math.min(avg / 255, 1);
    const glowVal = intensity * 0.5;
    glowOverlay.style.opacity = glowVal;
    playerEl.style.boxShadow = `
      0 0 ${40 + intensity * 60}px rgba(255, 20, 20, ${0.06 + intensity * 0.12}),
      inset 0 1px 0 rgba(255, 60, 60, ${0.05 + intensity * 0.1})
    `;

    // ── Layout dos pilares ──
    const barCount = Math.min(bufferLength, 14);
    const pillarW = (w / barCount) * 0.95;
    const totalWidth = pillarW * barCount;
    const startX = (w - totalWidth) / 2;
    const spacing = 2;

    // ── Detecção de beat e show de luzes ──
    const energyThreshold = 0.08;
    const isHighEnergy = intensity > energyThreshold;
    const beatDelta = intensity - prevAvg;
    prevAvg = intensity;

    if (isHighEnergy && beatDelta > 0.01) {
      pillarFlash = 1.0;

      const ringCount = Math.floor(1 + intensity * 2);
      for (let ri = 0; ri < ringCount; ri++) {
        rings.push({ x: w / 2, y: h / 2, radius: 20 + ri * 15, opacity: 0.5 + intensity * 0.3, maxRadius: w * 0.8 });
      }

      const particleCount = Math.floor(8 + intensity * 12);
      for (let pi = 0; pi < particleCount; pi++) {
        particles.push({
          x: 20 + Math.random() * (w - 40),
          y: h * (0.6 + Math.random() * 0.35),
          vx: (Math.random() - 0.5) * 5,
          vy: -(Math.random() * 6 + 3) * (0.5 + intensity),
          life: 20 + Math.random() * 25,
          maxLife: 45,
          size: 1.5 + Math.random() * 3.5,
          hue: Math.random() > 0.3 ? 350 : 30
        });
      }

      if (flashTimeout) clearTimeout(flashTimeout);
      flashOverlay.style.opacity = '0.8';
      playerEl.classList.add('border-flash');
      flashTimeout = setTimeout(() => {
        flashOverlay.style.opacity = '0';
        playerEl.classList.remove('border-flash');
      }, 120);
    }

    pillarFlash *= 0.88;
    if (pillarFlash < 0.01) pillarFlash = 0;

    // ── Fundo escuro ──
    vctx.fillStyle = '#080508';
    vctx.fillRect(0, 0, w, h);

    // ── Anéis expansivos (pulso do beat) ──
    for (let r = rings.length - 1; r >= 0; r--) {
      const ring = rings[r];
      ring.radius += 4;
      ring.opacity -= 0.012;
      if (ring.opacity <= 0 || ring.radius > ring.maxRadius) { rings.splice(r, 1); continue; }
      vctx.beginPath();
      vctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      vctx.strokeStyle = `hsla(0, 100%, 60%, ${ring.opacity})`;
      vctx.lineWidth = 2;
      vctx.shadowColor = `hsla(0, 100%, 50%, ${ring.opacity * 0.8})`;
      vctx.shadowBlur = 25;
      vctx.stroke();
    }
    vctx.shadowBlur = 0;

    // ── Raios de luz (flash) ──
    if (pillarFlash > 0.1) {
      for (let i = 0; i < barCount; i += 2) {
        const binIdx = Math.floor(i * bufferLength / barCount);
        const rayVal = freqData[binIdx] / 255 * pillarFlash;
        if (rayVal < 0.08) continue;
        const px = startX + i * pillarW + pillarW / 2;
        const grad = vctx.createLinearGradient(px, h * 0.4, px, 0);
        grad.addColorStop(0, `hsla(0, 100%, 80%, 0)`);
        grad.addColorStop(1, `hsla(0, 100%, 95%, ${rayVal * 0.5})`);
        vctx.shadowColor = `hsla(0, 100%, 50%, ${rayVal * 0.6})`;
        vctx.shadowBlur = 60;
        vctx.fillStyle = grad;
        vctx.fillRect(px - 2, 0, 4, h * 0.4);
      }
      vctx.shadowBlur = 0;
    }

    // ── Pilares de frequência ──
    vctx.globalAlpha = 0.3 + pillarFlash * 0.5;

    for (let i = 0; i < barCount; i++) {
      const binIndex = Math.floor(i * bufferLength / barCount);
      const val = freqData[binIndex] / 255;
      const isRight = i >= barCount - 3;
      const emphasis = isRight ? 3.0 : 1.0;
      const volBoost = 0.3 + audio.volume * 0.9;
      const boostVal = Math.pow(Math.min(val * emphasis, 1), 0.4);
      const pillarH = boostVal * (h * 0.75) * volBoost;
      const bottomY = h;
      const topY = bottomY - pillarH;
      const px = startX + i * pillarW;
      const pw = pillarW - spacing;

      if (pw <= 0) continue;

      const fw = pillarFlash;
      const hue = isRight ? 40 : 350;
      const sat = 100;
      const extraLight = isRight ? 25 : 0;
      const lightBoost = fw * 65 + extraLight;

      vctx.shadowColor = `hsla(0, 100%, 50%, ${(val + fw) * 0.4})`;
      vctx.shadowBlur = val * 25 + fw * 50;

      const grad = vctx.createLinearGradient(px, 0, px + pw, 0);
      const edgeLight = Math.min(50 + boostVal * 35 + lightBoost, 95);
      const midLight = Math.min(70 + boostVal * 25 + lightBoost, 98);
      grad.addColorStop(0, `hsl(${hue}, ${sat}%, ${edgeLight}%)`);
      grad.addColorStop(0.25, `hsl(${hue}, ${sat}%, ${midLight}%)`);
      grad.addColorStop(0.75, `hsl(${hue}, ${sat}%, ${midLight}%)`);
      grad.addColorStop(1, `hsl(${hue}, ${sat}%, ${edgeLight}%)`);
      vctx.fillStyle = grad;

      const r = Math.min(pw / 3, 6);
      vctx.beginPath();
      vctx.moveTo(px + r, topY);
      vctx.lineTo(px + pw - r, topY);
      vctx.quadraticCurveTo(px + pw, topY, px + pw, topY + r);
      vctx.lineTo(px + pw, bottomY);
      vctx.lineTo(px, bottomY);
      vctx.lineTo(px, topY + r);
      vctx.quadraticCurveTo(px, topY, px + r, topY);
      vctx.closePath();
      vctx.fill();

      if (val > 0.04) {
        const capH = Math.min(14, pillarH * 0.08);
        vctx.shadowBlur = 0;
        const capGrad = vctx.createLinearGradient(px, 0, px + pw, 0);
        capGrad.addColorStop(0, `hsl(${hue}, ${sat}%, ${Math.min(60 + boostVal * 35 + lightBoost, 98)}%)`);
        capGrad.addColorStop(0.5, `hsl(${hue}, ${sat}%, ${Math.min(80 + boostVal * 18 + lightBoost, 99)}%)`);
        capGrad.addColorStop(1, `hsl(${hue}, ${sat}%, ${Math.min(55 + boostVal * 35 + lightBoost, 98)}%)`);
        vctx.fillStyle = capGrad;
        vctx.beginPath();
        vctx.moveTo(px + r, topY);
        vctx.lineTo(px + pw - r, topY);
        vctx.quadraticCurveTo(px + pw, topY, px + pw, topY + r);
        vctx.lineTo(px + pw, topY + capH);
        vctx.lineTo(px, topY + capH);
        vctx.lineTo(px, topY + r);
        vctx.quadraticCurveTo(px, topY, px + r, topY);
        vctx.closePath();
        vctx.fill();
      }
    }

    vctx.globalAlpha = 1;
    vctx.shadowBlur = 0;

    // ── Partículas (spray do beat) ──
    for (let p = particles.length - 1; p >= 0; p--) {
      const pt = particles[p];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.18;
      pt.life--;
      if (pt.life <= 0) { particles.splice(p, 1); continue; }
      const alpha = pt.life / pt.maxLife;
      vctx.beginPath();
      vctx.arc(pt.x, pt.y, pt.size * alpha, 0, Math.PI * 2);
      vctx.fillStyle = `hsla(${pt.hue}, 100%, 80%, ${alpha})`;
      vctx.shadowColor = `hsla(0, 100%, 50%, ${alpha * 0.7})`;
      vctx.shadowBlur = 20;
      vctx.fill();
    }
    vctx.shadowBlur = 0;
  }

  draw();
}

window.addEventListener('resize', () => {
  if (visReady) resizeCanvas();
});

loadSongs();
