/**
 * Shivansh OS v2.0 — Core Operating System Controller
 * Architecture: Living Wallpaper, Boot Experience, Window Manager & Interactive Subsystems
 */

import { ownerProfile } from './content/owner-profile.js';
import { projectsData } from './content/projects.js';
import { achievementsData } from './content/achievements.js';
import { journeyData } from './content/journey.js';

/* ========================================================
   GLOBAL STATE & CONSTANTS
======================================================== */
const OS_STATE = {
  theme: localStorage.getItem('shivansh-os-theme') || 'day',
  activeWindows: new Set(),
  minimizedWindows: new Set(),
  topZIndex: 1000,
  audioEnabled: localStorage.getItem('shivansh-os-audio') === 'true',
  companionStateIndex: 0,
  companionStates: ['idle', 'happy', 'excited', 'alert', 'sleeping', 'sad'],
  notes: JSON.parse(localStorage.getItem('shivansh-sticky-notes') || 'null') || [
    { id: 1, text: "Welcome to Shivansh OS! Explore projects, inspect case files, or leave a note here.", color: "#FFE66D" },
    { id: 2, text: "Spider-Sense AI demo is live: multi-modal vision with Google Gemini.", color: "#FFCAD4" },
    { id: 3, text: "Press Ctrl+K or / anywhere to launch the Command Palette.", color: "#7EE7E2" }
  ]
};

/* ========================================================
   1. BOOT SEQUENCE ENGINE
======================================================== */
function initBootloader() {
  const bootScreen = document.getElementById('bootScreen');
  const bootFill = document.getElementById('bootFill');
  const bootPercent = document.getElementById('bootPercent');
  const bootLog = document.getElementById('bootLog');
  const skipBtn = document.getElementById('skipBootBtn');

  // Check if session already saw boot
  const hasSeenBoot = sessionStorage.getItem('shivansh-os-boot-completed');
  if (hasSeenBoot) {
    bootScreen.classList.add('boot-hidden');
    return;
  }

  const stages = [
    { pct: 15, msg: "Initializing Shivansh OS v2.0 Kernel...", delay: 250 },
    { pct: 35, msg: "Mounting Living Pixel-Art Wallpaper Engine...", delay: 350 },
    { pct: 60, msg: "Connecting Project Vaults: Spider-Sense AI, SIH Proto...", delay: 400 },
    { pct: 85, msg: "Calibrating AI Companion & Window Manager...", delay: 300 },
    { pct: 100, msg: "System Ready. Welcome, Explorer.", delay: 300 }
  ];

  let currentStage = 0;

  function runStage() {
    if (currentStage >= stages.length) {
      setTimeout(finishBoot, 200);
      return;
    }
    const stage = stages[currentStage];
    bootFill.style.width = stage.pct + '%';
    bootPercent.textContent = stage.pct + '%';
    bootLog.innerHTML += `<div>> <span class="log-highlight">${stage.msg}</span></div>`;
    bootLog.scrollTop = bootLog.scrollHeight;
    playChirp(300 + currentStage * 60, 0.05);

    currentStage++;
    setTimeout(runStage, stage.delay);
  }

  function finishBoot() {
    sessionStorage.setItem('shivansh-os-boot-completed', 'true');
    bootScreen.classList.add('boot-hidden');
    playChirp(520, 0.12);
  }

  skipBtn.addEventListener('click', finishBoot);
  runStage();
}

/* ========================================================
   2. RETRO AUDIO SYNTHESIZER (Web Audio API)
======================================================== */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && typeof window.AudioContext !== 'undefined') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playChirp(freq = 440, duration = 0.08, type = 'sine') {
  if (!OS_STATE.audioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context error or not allowed before gesture
  }
}

function toggleAudio() {
  OS_STATE.audioEnabled = !OS_STATE.audioEnabled;
  localStorage.setItem('shivansh-os-audio', OS_STATE.audioEnabled);
  updateAudioButton();
  if (OS_STATE.audioEnabled) {
    playChirp(480, 0.1);
  }
}

function updateAudioButton() {
  const btn = document.getElementById('audioToggleBtn');
  if (btn) {
    btn.innerHTML = OS_STATE.audioEnabled ? '🔊 SFX ON' : '🔇 SFX OFF';
    btn.setAttribute('aria-pressed', OS_STATE.audioEnabled);
  }
}

/* ========================================================
   3. LIVING WALLPAPER PARTICLE ENGINE
======================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = 28;
  const particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * (height * 0.7),
    size: Math.floor(Math.random() * 3) + 2,
    speedX: (Math.random() - 0.5) * 0.35,
    speedY: (Math.random() - 0.5) * 0.25,
    alpha: Math.random() * 0.6 + 0.2,
    alphaSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1)
  }));

  function renderParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.alpha += p.alphaSpeed;

      if (p.alpha > 0.8 || p.alpha < 0.15) {
        p.alphaSpeed *= -1;
      }

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height * 0.7;
      if (p.y > height * 0.7) p.y = 0;

      // Draw crisp pixel particle
      ctx.fillStyle = OS_STATE.theme === 'day' 
        ? `rgba(255, 230, 210, ${p.alpha})`
        : OS_STATE.theme === 'night'
        ? `rgba(200, 179, 255, ${p.alpha})`
        : `rgba(126, 231, 226, ${p.alpha})`;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }

    requestAnimationFrame(renderParticles);
  }

  requestAnimationFrame(renderParticles);
}

/* ========================================================
   4. SYSTEM CLOCK & IST TIMEZONE
======================================================== */
function initClock() {
  const clockEl = document.getElementById('systemClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const timeStr = new Intl.DateTimeFormat('en-US', options).format(now);
    clockEl.textContent = `IST ${timeStr}`;
  }

  update();
  setInterval(update, 1000);
}

/* ========================================================
   5. HERO MORPHING DESCRIPTOR
======================================================== */
function initMorphingDescriptor() {
  const el = document.getElementById('heroMorphTag');
  if (!el) return;

  const descriptors = [
    "[ AI SYSTEMS OPERATOR ]",
    "[ CREATIVE WEB ARCHITECT ]",
    "[ HACKATHON COMPETITOR ]",
    "[ FULL-STACK ENGINEER ]",
    "[ AUTOMATION SPECIALIST ]"
  ];
  let index = 0;

  setInterval(() => {
    index = (index + 1) % descriptors.length;
    el.style.opacity = '0';
    el.style.transform = 'translateY(4px)';
    setTimeout(() => {
      el.textContent = descriptors[index];
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200);
  }, 3200);
}

/* ========================================================
   6. WINDOW MANAGER & APPLICATION SYSTEM
======================================================== */
function initWindowManager() {
  const windows = document.querySelectorAll('.os-window');

  windows.forEach((win) => {
    const winId = win.id;
    const titlebar = win.querySelector('.window-titlebar');
    const closeBtn = win.querySelector('.win-btn.close');
    const minBtn = win.querySelector('.win-btn.minimize');
    const maxBtn = win.querySelector('.win-btn.maximize');

    // Clicking anywhere on window brings it to foreground
    win.addEventListener('pointerdown', (e) => {
      // Don't interfere if interacting with form inputs
      focusWindow(winId);
    });

    // Close button - immediately closes window and stops propagation
    if (closeBtn) {
      ['pointerdown', 'mousedown'].forEach((evt) => {
        closeBtn.addEventListener(evt, (e) => e.stopPropagation());
      });
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeWindow(winId);
      });
    }

    // Minimize button
    if (minBtn) {
      ['pointerdown', 'mousedown'].forEach((evt) => {
        minBtn.addEventListener(evt, (e) => e.stopPropagation());
      });
      minBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        minimizeWindow(winId);
      });
    }

    // Maximize / Restore button
    if (maxBtn) {
      ['pointerdown', 'mousedown'].forEach((evt) => {
        maxBtn.addEventListener(evt, (e) => e.stopPropagation());
      });
      maxBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMaximize(winId);
      });
    }

    // Drag by titlebar
    if (titlebar) {
      makeDraggable(win, titlebar);
    }
  });

  // Dock items interaction (Single click opens, restores, or toggles minimize)
  document.querySelectorAll('.dock-item[data-open-app]').forEach((dockBtn) => {
    dockBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const appId = dockBtn.getAttribute('data-open-app');
      const winId = `win-${appId}`;
      const win = document.getElementById(winId);

      if (OS_STATE.activeWindows.has(winId) && !OS_STATE.minimizedWindows.has(winId) && win && win.classList.contains('is-focused')) {
        minimizeWindow(winId);
      } else {
        openWindow(winId);
      }
    });
  });

  // Hero action buttons and quick links
  document.querySelectorAll('[data-open-app]:not(.dock-item):not(.desktop-icon)').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const appId = trigger.getAttribute('data-open-app');
      openWindow(`win-${appId}`);
    });
  });

  // Global Escape key closes focused window or command palette
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const palette = document.getElementById('commandPalette');
      if (palette && palette.classList.contains('palette-open')) {
        closeCommandPalette();
        return;
      }
      // Close the currently focused window
      const focusedWin = document.querySelector('.os-window.is-focused');
      if (focusedWin && focusedWin.style.display !== 'none') {
        closeWindow(focusedWin.id);
      } else if (OS_STATE.activeWindows.size > 0) {
        const topWinId = Array.from(OS_STATE.activeWindows).pop();
        if (topWinId) closeWindow(topWinId);
      }
    }
  });
}

/* Open an application window */
function openWindow(winId) {
  const win = document.getElementById(winId);
  if (!win) return;

  // If already open and visible, bring to front and focus
  if (OS_STATE.activeWindows.has(winId) && !OS_STATE.minimizedWindows.has(winId) && win.style.display !== 'none') {
    focusWindow(winId);
    playChirp(460, 0.04);
    return;
  }

  // If minimized, restore it
  if (OS_STATE.minimizedWindows.has(winId)) {
    OS_STATE.minimizedWindows.delete(winId);
  }

  win.style.display = 'flex';
  win.removeAttribute('hidden');

  // Position centered on desktop with staggered cascade if first opened
  if (!win.dataset.positioned && window.innerWidth > 768 && !win.classList.contains('is-maximized')) {
    const winWidth = parseInt(win.style.width, 10) || 720;
    const winHeight = parseInt(win.style.height, 10) || 480;
    const centerLeft = Math.max(110, Math.round((window.innerWidth - winWidth) / 2));
    const centerTop = Math.max(68, Math.round((window.innerHeight - winHeight) / 2) - 30);
    const step = (OS_STATE.activeWindows.size % 5);
    const cascadeLeft = step * 32 - 40;
    const cascadeTop = step * 36 - 40;

    win.style.left = `${Math.max(110, centerLeft + cascadeLeft)}px`;
    win.style.top = `${Math.max(68, centerTop + cascadeTop)}px`;
    win.dataset.positioned = 'true';
  }

  OS_STATE.activeWindows.add(winId);
  focusWindow(winId);
  updateDockIndicators();
  playChirp(440, 0.06);
}

/* Close an application window immediately */
function closeWindow(winId) {
  const win = document.getElementById(winId);
  if (!win) return;

  win.style.display = 'none';
  win.setAttribute('hidden', 'true');
  win.classList.remove('is-focused');
  OS_STATE.activeWindows.delete(winId);
  OS_STATE.minimizedWindows.delete(winId);
  updateDockIndicators();
  playChirp(380, 0.05);

  // Focus the topmost remaining active window that is not minimized
  const remaining = Array.from(OS_STATE.activeWindows).filter((id) => !OS_STATE.minimizedWindows.has(id));
  if (remaining.length > 0) {
    focusWindow(remaining[remaining.length - 1]);
  }
}

/* Minimize an application window */
function minimizeWindow(winId) {
  const win = document.getElementById(winId);
  if (!win) return;

  win.style.display = 'none';
  win.classList.remove('is-focused');
  OS_STATE.minimizedWindows.add(winId);
  updateDockIndicators();
  playChirp(340, 0.05);

  const remaining = Array.from(OS_STATE.activeWindows).filter((id) => !OS_STATE.minimizedWindows.has(id));
  if (remaining.length > 0) {
    focusWindow(remaining[remaining.length - 1]);
  }
}

/* Maximize / Restore an application window */
function toggleMaximize(winId) {
  const win = document.getElementById(winId);
  if (!win) return;

  const maxBtn = win.querySelector('.win-btn.maximize');

  if (win.classList.contains('is-maximized')) {
    win.classList.remove('is-maximized');
    win.style.top = win.dataset.prevTop || '74px';
    win.style.left = win.dataset.prevLeft || '120px';
    win.style.width = win.dataset.prevWidth || '720px';
    win.style.height = win.dataset.prevHeight || '480px';
    if (maxBtn) {
      maxBtn.textContent = '□';
      maxBtn.title = 'Maximize';
    }
  } else {
    win.dataset.prevTop = win.style.top;
    win.dataset.prevLeft = win.style.left;
    win.dataset.prevWidth = win.style.width;
    win.dataset.prevHeight = win.style.height;

    win.classList.add('is-maximized');
    if (maxBtn) {
      maxBtn.textContent = '❐';
      maxBtn.title = 'Restore';
    }
  }
  focusWindow(winId);
  playChirp(460, 0.05);
}

/* Bring a window to foreground with correct z-index */
function focusWindow(winId) {
  const win = document.getElementById(winId);
  if (!win) return;

  OS_STATE.topZIndex += 2;
  win.style.zIndex = OS_STATE.topZIndex;

  document.querySelectorAll('.os-window').forEach((w) => w.classList.remove('is-focused'));
  win.classList.add('is-focused');

  // Maintain focus ordering in active set
  OS_STATE.activeWindows.delete(winId);
  OS_STATE.activeWindows.add(winId);
}

/* Update dock indicator dots */
function updateDockIndicators() {
  document.querySelectorAll('.dock-item[data-open-app]').forEach((dockBtn) => {
    const appId = dockBtn.getAttribute('data-open-app');
    const winId = `win-${appId}`;
    if (OS_STATE.activeWindows.has(winId)) {
      dockBtn.classList.add('has-open-window');
      if (OS_STATE.minimizedWindows.has(winId)) {
        dockBtn.style.opacity = '0.65';
      } else {
        dockBtn.style.opacity = '1';
      }
    } else {
      dockBtn.classList.remove('has-open-window');
      dockBtn.style.opacity = '1';
    }
  });
}

/* Make a window draggable by its titlebar safely without blocking button clicks */
function makeDraggable(element, handle) {
  let isDragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;

  handle.addEventListener('pointerdown', (e) => {
    // CRITICAL: If clicking on close, minimize, maximize, or any button, DO NOT DRAG!
    if (e.target.closest('.window-controls') || e.target.closest('button')) {
      return;
    }
    if (window.innerWidth <= 720 || element.classList.contains('is-maximized')) return;

    isDragging = true;
    try {
      handle.setPointerCapture(e.pointerId);
    } catch (_) {}

    const rect = element.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = rect.left;
    initialTop = rect.top;

    focusWindow(element.id);
  });

  handle.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;

    // Bounds checking
    newLeft = Math.max(10, Math.min(window.innerWidth - 120, newLeft));
    newTop = Math.max(54, Math.min(window.innerHeight - 80, newTop));

    element.style.left = `${newLeft}px`;
    element.style.top = `${newTop}px`;
    element.style.transform = 'none';
  });

  function stopDrag(e) {
    if (isDragging) {
      isDragging = false;
      try {
        handle.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  }

  handle.addEventListener('pointerup', stopDrag);
  handle.addEventListener('pointercancel', stopDrag);
}

/* ========================================================
   6B. DESKTOP APPLICATION ICONS (Left-Side Windows Style)
======================================================== */
function initDesktopIcons() {
  const icons = document.querySelectorAll('.desktop-icon');

  icons.forEach((icon) => {
    const appId = icon.getAttribute('data-app');
    const winId = `win-${appId}`;
    let lastClickTime = 0;

    // Click handler: selects icon, and rapid double-click opens application
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      selectDesktopIcon(icon);

      const now = Date.now();
      const isDoubleClick = (now - lastClickTime) < 450 || e.detail >= 2;
      lastClickTime = now;

      // Open on double-click on desktop, or single tap on mobile / touch devices
      if (isDoubleClick || window.innerWidth <= 720 || ('ontouchstart' in window && navigator.maxTouchPoints > 0)) {
        openWindow(winId);
      }
    });

    // Native dblclick event listener as secondary guarantee
    icon.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      openWindow(winId);
    });

    // Keyboard support: Enter or Space opens application
    icon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openWindow(winId);
      }
    });
  });

  // Clicking anywhere on the desktop deselects icons
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.desktop-icon')) {
      deselectAllDesktopIcons();
    }
  });
}

function selectDesktopIcon(iconEl) {
  deselectAllDesktopIcons();
  iconEl.classList.add('is-selected');
  playChirp(520, 0.03);
}

function deselectAllDesktopIcons() {
  document.querySelectorAll('.desktop-icon.is-selected').forEach((el) => {
    el.classList.remove('is-selected');
  });
}

/* ========================================================
   7. DRAGGABLE AI COMPANION (Layer 5700)
======================================================== */
function initCompanion() {
  const companion = document.getElementById('aiCompanion');
  const sprite = document.getElementById('companionSprite');
  const resetBtn = document.getElementById('companionResetBtn');
  const moodBtn = document.getElementById('companionMoodBtn');
  const bubble = document.getElementById('companionBubble');
  const bubbleClose = document.getElementById('companionBubbleClose');

  if (!companion || !sprite) return;

  // Restore position if stored
  const savedPos = JSON.parse(localStorage.getItem('shivansh-companion-pos') || 'null');
  if (savedPos && window.innerWidth > 720) {
    companion.style.left = `${Math.min(window.innerWidth - 90, Math.max(10, savedPos.left))}px`;
    companion.style.top = `${Math.min(window.innerHeight - 100, Math.max(60, savedPos.top))}px`;
    companion.style.bottom = 'auto';
  }

  // Pointer dragging
  let isDragging = false;
  let startX = 0, startY = 0;
  let initLeft = 0, initTop = 0;

  companion.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    if (window.innerWidth <= 720) {
      cycleCompanionState();
      return;
    }
    isDragging = true;
    companion.setPointerCapture(e.pointerId);

    const rect = companion.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    initLeft = rect.left;
    initTop = rect.top;

    sprite.src = 'assets/companion/companion-dragging.svg';
    playChirp(520, 0.05);
  });

  companion.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newLeft = Math.max(12, Math.min(window.innerWidth - 80, initLeft + dx));
    let newTop = Math.max(60, Math.min(window.innerHeight - 90, initTop + dy));

    companion.style.left = `${newLeft}px`;
    companion.style.top = `${newTop}px`;
    companion.style.bottom = 'auto';
  });

  companion.addEventListener('pointerup', (e) => {
    if (isDragging) {
      isDragging = false;
      try { companion.releasePointerCapture(e.pointerId); } catch (_) {}
      
      // Save position
      const rect = companion.getBoundingClientRect();
      localStorage.setItem('shivansh-companion-pos', JSON.stringify({ left: rect.left, top: rect.top }));

      // Return to happy/idle state
      sprite.src = `assets/companion/companion-${OS_STATE.companionStates[OS_STATE.companionStateIndex]}.svg`;
      playChirp(460, 0.06);
    }
  });

  function cycleCompanionState() {
    OS_STATE.companionStateIndex = (OS_STATE.companionStateIndex + 1) % OS_STATE.companionStates.length;
    const stateName = OS_STATE.companionStates[OS_STATE.companionStateIndex];
    sprite.src = `assets/companion/companion-${stateName}.svg`;
    playChirp(480 + OS_STATE.companionStateIndex * 30, 0.08);
  }

  if (moodBtn) moodBtn.addEventListener('click', cycleCompanionState);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('shivansh-companion-pos');
      companion.style.left = '28px';
      companion.style.bottom = '82px';
      companion.style.top = 'auto';
      sprite.src = 'assets/companion/companion-idle.svg';
      playChirp(400, 0.06);
    });
  }

  if (bubbleClose && bubble) {
    bubbleClose.addEventListener('click', () => {
      bubble.style.display = 'none';
    });
  }
}

/* ========================================================
   8. INTERACTIVE WHITEBOARD & STICKY NOTES
======================================================== */
function initWhiteboard() {
  const grid = document.getElementById('stickyGrid');
  const input = document.getElementById('stickyInput');
  const addBtn = document.getElementById('addStickyBtn');
  const clearBtn = document.getElementById('clearStickyBtn');

  function renderNotes() {
    if (!grid) return;
    grid.innerHTML = '';

    OS_STATE.notes.forEach((note) => {
      const noteEl = document.createElement('div');
      noteEl.className = 'sticky-note';
      noteEl.style.backgroundColor = note.color;
      noteEl.innerHTML = `
        <button class="sticky-delete-btn" aria-label="Delete note" data-note-id="${note.id}">×</button>
        <div contenteditable="true" class="sticky-text" data-note-id="${note.id}">${escapeHtml(note.text)}</div>
      `;
      grid.appendChild(noteEl);
    });

    // Wire up delete and editable listeners
    grid.querySelectorAll('.sticky-delete-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-note-id'), 10);
        OS_STATE.notes = OS_STATE.notes.filter((n) => n.id !== id);
        saveNotes();
        renderNotes();
        playChirp(340, 0.05);
      });
    });

    grid.querySelectorAll('.sticky-text').forEach((txt) => {
      txt.addEventListener('blur', () => {
        const id = parseInt(txt.getAttribute('data-note-id'), 10);
        const note = OS_STATE.notes.find((n) => n.id === id);
        if (note) {
          note.text = txt.innerText;
          saveNotes();
        }
      });
    });
  }

  function addNote() {
    if (!input || !input.value.trim()) return;
    const colors = ['#FFE66D', '#FFCAD4', '#7EE7E2', '#D8B4E2', '#FEC89A'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];
    const newNote = {
      id: Date.now(),
      text: input.value.trim(),
      color: chosenColor
    };
    OS_STATE.notes.push(newNote);
    saveNotes();
    input.value = '';
    renderNotes();
    playChirp(520, 0.08);
  }

  function saveNotes() {
    localStorage.setItem('shivansh-sticky-notes', JSON.stringify(OS_STATE.notes));
  }

  if (addBtn) addBtn.addEventListener('click', addNote);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addNote();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      OS_STATE.notes = [];
      saveNotes();
      renderNotes();
    });
  }

  renderNotes();
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ========================================================
   9. COMMAND PALETTE (Ctrl+K / Search)
======================================================== */
function initCommandPalette() {
  const palette = document.getElementById('commandPalette');
  const input = document.getElementById('paletteInput');
  const results = document.getElementById('paletteResults');
  const triggerBtn = document.getElementById('commandPaletteBtn');

  if (!palette || !input || !results) return;

  const commands = [
    { label: "Open Projects (Main Drive)", tag: "Application", action: () => openWindow('win-projects') },
    { label: "Open Spider-Sense AI Case", tag: "Project Demo", action: () => openWindow('win-projects') },
    { label: "Open AI Financial Guide", tag: "Project Demo", action: () => openWindow('win-projects') },
    { label: "Open SIH Prototype", tag: "Hackathon Solution", action: () => openWindow('win-projects') },
    { label: "Open Systems Loop", tag: "Application", action: () => openWindow('win-systems') },
    { label: "Open Achievements & Hackathons", tag: "Application", action: () => openWindow('win-achievements') },
    { label: "Open Journey Milestones", tag: "Application", action: () => openWindow('win-journey') },
    { label: "Open Founder.txt", tag: "Notes", action: () => openWindow('win-founder') },
    { label: "Open Interactive Whiteboard", tag: "Application", action: () => openWindow('win-whiteboard') },
    { label: "Open Terminal Diagnostics", tag: "System Tool", action: () => openWindow('win-terminal') },
    { label: "Open Contact & Brief Form", tag: "Conversion", action: () => openWindow('win-contact') },
    { label: "Switch to Day Mode (Sunset)", tag: "Theme", action: () => setTheme('day') },
    { label: "Switch to Night Mode (Cosmos)", tag: "Theme", action: () => setTheme('night') },
    { label: "Switch to Dark Mode (Workstation)", tag: "Theme", action: () => setTheme('dark') }
  ];

  let selectedIdx = 0;
  let currentFiltered = [...commands];

  function openPalette() {
    palette.classList.add('palette-open');
    input.value = '';
    renderFiltered('');
    input.focus();
    playChirp(480, 0.05);
  }

  function closePalette() {
    palette.classList.remove('palette-open');
  }

  function renderFiltered(query) {
    const q = query.toLowerCase().trim();
    currentFiltered = commands.filter((cmd) => cmd.label.toLowerCase().includes(q) || cmd.tag.toLowerCase().includes(q));
    selectedIdx = 0;
    results.innerHTML = '';

    if (currentFiltered.length === 0) {
      results.innerHTML = '<div style="padding:12px;font-size:12px;color:gray;">No commands found.</div>';
      return;
    }

    currentFiltered.forEach((cmd, i) => {
      const item = document.createElement('div');
      item.className = `palette-item ${i === selectedIdx ? 'is-selected' : ''}`;
      item.innerHTML = `<span>${cmd.label}</span><span class="palette-item-tag">${cmd.tag}</span>`;
      item.addEventListener('click', () => {
        cmd.action();
        closePalette();
      });
      results.appendChild(item);
    });
  }

  input.addEventListener('input', (e) => renderFiltered(e.target.value));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = (selectedIdx + 1) % currentFiltered.length;
      updateSelected();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = (selectedIdx - 1 + currentFiltered.length) % currentFiltered.length;
      updateSelected();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentFiltered[selectedIdx]) {
        currentFiltered[selectedIdx].action();
        closePalette();
      }
    }
  });

  function updateSelected() {
    const items = results.querySelectorAll('.palette-item');
    items.forEach((item, idx) => {
      item.classList.toggle('is-selected', idx === selectedIdx);
      if (idx === selectedIdx) item.scrollIntoView({ block: 'nearest' });
    });
  }

  palette.addEventListener('click', (e) => {
    if (e.target === palette) closePalette();
  });

  if (triggerBtn) triggerBtn.addEventListener('click', openPalette);

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.classList.contains('palette-open') ? closePalette() : openPalette();
    } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      openPalette();
    }
  });
}

function closeCommandPalette() {
  const palette = document.getElementById('commandPalette');
  if (palette) palette.classList.remove('palette-open');
}

/* ========================================================
   10. THEME CONTROLLER
======================================================== */
function initTheme() {
  const themeBtn = document.getElementById('themeToggleBtn');
  setTheme(OS_STATE.theme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const cycle = { day: 'night', night: 'dark', dark: 'day' };
      setTheme(cycle[OS_STATE.theme] || 'day');
      playChirp(520, 0.06);
    });
  }
}

function setTheme(theme) {
  OS_STATE.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('shivansh-os-theme', theme);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    const labels = {
      day: '☀️ DAY',
      night: '🌙 NIGHT',
      dark: '⚡ DARK'
    };
    themeBtn.innerHTML = labels[theme] || '☀️ DAY';
  }
}

/* ========================================================
   11. DATA POPULATION FOR APPS
======================================================== */
function populateAppData() {
  // Populate Projects
  const projectGrid = document.getElementById('projectListGrid');
  if (projectGrid) {
    projectGrid.innerHTML = projectsData.map((p) => `
      <div class="project-card" style="border-top: 3px solid ${p.accentColor}">
        <span class="project-badge" style="background:${p.accentColor};color:#FFF">${p.badge}</span>
        <h3 class="project-title">${p.name}</h3>
        <p class="project-summary">${p.summary}</p>
        <div style="font-size:12px;color:gray;line-height:1.4">
          <strong>Problem:</strong> ${p.problem}<br>
          <strong>Outcome:</strong> ${p.outcome}
        </div>
        <div class="project-stack">
          ${p.stack.map((s) => `<span class="stack-pill">${s}</span>`).join('')}
        </div>
        <div class="project-links">
          ${p.demoUrl ? `<a href="${p.demoUrl}" target="_blank" rel="noopener noreferrer" class="project-link-btn primary">Live Demo ↗</a>` : ''}
          ${p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="project-link-btn">GitHub Repo ↗</a>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Populate Achievements
  const achieveGrid = document.getElementById('achieveListGrid');
  if (achieveGrid) {
    achieveGrid.innerHTML = achievementsData.map((a) => `
      <div class="project-card" style="border-left: 4px solid var(--accent)">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:20px">${a.icon}</span>
          <span class="project-badge" style="background:var(--soft);color:inherit">${a.badge}</span>
        </div>
        <h4 style="margin:4px 0 2px;font-size:15px">${a.title}</h4>
        <div style="font-size:11px;font-family:'DM Mono',monospace;color:gray;margin-bottom:6px">${a.issuer} // ${a.year}</div>
        <p style="font-size:13px;line-height:1.5;margin:0">${a.description}</p>
      </div>
    `).join('');
  }

  // Populate Journey
  const journeyWrap = document.getElementById('journeyTimelineWrap');
  if (journeyWrap) {
    journeyWrap.innerHTML = journeyData.map((j) => `
      <div class="loop-step">
        <span class="project-badge" style="background:var(--ink);color:var(--paper)">${j.year}</span>
        <h4>${j.title}</h4>
        <div style="font-family:'DM Mono',monospace;font-size:11px;color:var(--accent);margin-bottom:4px">${j.tagline}</div>
        <p style="font-size:13px;line-height:1.5;margin:0 0 8px">${j.description}</p>
        <div class="project-stack">
          ${j.skillsGained.map((s) => `<span class="stack-pill">${s}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  // Populate Founder.txt
  const founderContent = document.getElementById('founderTxtContent');
  if (founderContent) {
    founderContent.textContent = ownerProfile.founderNote.content;
  }
}

/* ========================================================
   INITIALIZATION ON DOM READY
======================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initClock();
  initMorphingDescriptor();
  initParticleCanvas();
  initBootloader();
  initWindowManager();
  initDesktopIcons();
  initCompanion();
  initWhiteboard();
  initCommandPalette();
  populateAppData();

  const audioBtn = document.getElementById('audioToggleBtn');
  if (audioBtn) {
    audioBtn.addEventListener('click', toggleAudio);
    updateAudioButton();
  }
});
