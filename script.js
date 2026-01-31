const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const waveSelect = document.getElementById("waveType");
const keys = document.querySelectorAll(".key");

// Frequency Map (Hz)
const notes = {
  a: 261.63, // C4
  w: 277.18, // C#4
  s: 293.66, // D4
  e: 311.13, // D#4
  d: 329.63, // E4
  f: 349.23, // F4
  t: 369.99, // F#4
  g: 392.0, // G4
  y: 415.3, // G#4
  h: 440.0, // A4
  u: 466.16, // A#4
  j: 493.88, // B4
  k: 523.25, // C5
};

// Track active oscillators to stop them later
let activeOscillators = {};

function playNote(key) {
  if (!notes[key] || activeOscillators[key]) return; // Stop overlapping

  // 1. Create Oscillator (Sound Generator)
  const osc = audioCtx.createOscillator();
  osc.type = waveSelect.value;
  osc.frequency.setValueAtTime(notes[key], audioCtx.currentTime);

  // 2. Create Gain Node (Volume Control)
  const gainNode = audioCtx.createGain();

  // 3. Connect: Oscillator -> Gain -> Speakers
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // 4. Attack Envelope (Fade in very fast to avoid click)
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);

  osc.start();
  activeOscillators[key] = { osc, gainNode };

  // Visuals
  const keyDiv = document.querySelector(`.key[data-key="${key}"]`);
  if (keyDiv) keyDiv.classList.add("active");
}

function stopNote(key) {
  if (!activeOscillators[key]) return;

  const { osc, gainNode } = activeOscillators[key];

  // Release Envelope (Fade out fast)
  gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
  gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

  // Stop oscillator after fade out
  osc.stop(audioCtx.currentTime + 0.1);

  // Cleanup
  delete activeOscillators[key];

  // Visuals
  const keyDiv = document.querySelector(`.key[data-key="${key}"]`);
  if (keyDiv) keyDiv.classList.remove("active");
}

// Keyboard Listeners
document.addEventListener("keydown", (e) => {
  if (!e.repeat) playNote(e.key.toLowerCase());
});

document.addEventListener("keyup", (e) => {
  stopNote(e.key.toLowerCase());
});

// Mouse/Touch Listeners
keys.forEach((key) => {
  const k = key.dataset.key;
  key.addEventListener("mousedown", () => playNote(k));
  key.addEventListener("mouseup", () => stopNote(k));
  key.addEventListener("mouseleave", () => stopNote(k));
});
