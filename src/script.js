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
  audio.load();
  progressFill.style.width = '0%';
  currentTimeEl.textContent = '0:00';
  durationEl.textContent = '0:00';
  renderPlaylist(searchInput.value);
}

function play() {
  audio.play().then(() => {
    isPlaying = true;
    updatePlayBtn();
  }).catch(() => {});
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

loadSongs();
