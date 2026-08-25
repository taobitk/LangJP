/**
 * Universal Lesson Learning Engine
 * Works dynamically with any window.CURRENT_LESSON data
 */

(function () {
  'use strict';

  // Ensure lesson data is loaded
  const lesson = window.CURRENT_LESSON || {
    id: 1,
    title: "Bài Học",
    subtitle: "Từ Vựng",
    items: []
  };

  // --- STATE ---
  const state = {
    lessonId: lesson.id,
    currentTab: 'flashcards', // 'flashcards', 'type-japanese', 'type-vietnamese'
    evalMode: 'zen',          // 'zen' or 'test'
    isShuffled: false,
    items: [...lesson.items],
    userAnswers: {},          // key: item.id -> value string
    revealedHints: new Set(), // Set of item ids currently showing hint
    soundEnabled: true,
    isSubmitted: false,
    timerSeconds: 0,
    timerInterval: null,
    isTimerRunning: false,
    masteredIds: new Set(JSON.parse(localStorage.getItem(`lesson_${lesson.id}_mastered`) || '[]')),
  };

  // --- AUDIO ENGINE ---
  let currentAudio = null;

  function initSound() {
    const savedSound = localStorage.getItem('hiragana_sound');
    state.soundEnabled = savedSound !== 'false';
    updateSoundUI();

    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        localStorage.setItem('hiragana_sound', state.soundEnabled ? 'true' : 'false');
        updateSoundUI();
      });
    }
  }

  function updateSoundUI() {
    const iconOn = document.getElementById('sound-icon-on');
    const iconOff = document.getElementById('sound-icon-off');
    if (iconOn && iconOff) {
      if (state.soundEnabled) {
        iconOn.classList.remove('hidden');
        iconOff.classList.add('hidden');
      } else {
        iconOn.classList.add('hidden');
        iconOff.classList.remove('hidden');
      }
    }
  }

  function speakJapanese(text) {
    if (!state.soundEnabled || !text) return;

    // Clean text for speech (remove notes in parentheses)
    const cleanText = text.replace(/\(.*?\)/g, '').replace(/[～~\[\]]/g, '').trim() || text;

    // 1. Web Speech API (Fast & Native Japanese Voice)
    if ('speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.85;
        
        const voices = window.speechSynthesis.getVoices();
        const jpVoice = voices.find(v => v.lang && (v.lang.includes('ja') || v.lang.includes('JP')));
        if (jpVoice) utterance.voice = jpVoice;

        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {}
    }

    // 2. Fallback Google TTS
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=ja&client=tw-ob`;
      currentAudio = new Audio(audioUrl);
      currentAudio.playbackRate = 0.9;
      currentAudio.play().catch(() => {});
    } catch (e) {}
  }

  // --- INITIALIZATION ---
  function init() {
    initTheme();
    initSound();
    bindEvents();
    renderContent();
    updateStats();
    if (window.lucide) lucide.createIcons();
  }

  // --- THEME ---
  function initTheme() {
    const savedTheme = localStorage.getItem('hiragana_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const btnTheme = document.getElementById('btn-theme-toggle');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('hiragana_theme', isDark ? 'dark' : 'light');
        if (window.lucide) lucide.createIcons();
      });
    }
  }

  // --- EVENT BINDING ---
  function bindEvents() {
    // Mode Tabs
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (state.currentTab === tab) return;

        state.currentTab = tab;
        document.querySelectorAll('[data-tab]').forEach(b => {
          b.classList.remove('bg-white', 'dark:bg-slate-700', 'text-indigo-600', 'dark:text-indigo-400', 'shadow-sm');
          b.classList.add('text-slate-600', 'dark:text-slate-400');
        });
        btn.classList.add('bg-white', 'dark:bg-slate-700', 'text-indigo-600', 'dark:text-indigo-400', 'shadow-sm');
        btn.classList.remove('text-slate-600', 'dark:text-slate-400');

        renderContent();
        updateStats();
        if (window.lucide) lucide.createIcons();
      });
    });

    // Evaluation Mode (Zen vs Test)
    const btnModeZen = document.getElementById('btn-mode-zen');
    const btnModeTest = document.getElementById('btn-mode-test');
    if (btnModeZen && btnModeTest) {
      btnModeZen.addEventListener('click', () => {
        setEvalMode('zen');
      });
      btnModeTest.addEventListener('click', () => {
        setEvalMode('test');
      });
    }

    // Shuffle Button
    const btnShuffle = document.getElementById('btn-toggle-shuffle');
    if (btnShuffle) {
      btnShuffle.addEventListener('click', () => {
        state.isShuffled = !state.isShuffled;
        if (state.isShuffled) {
          state.items = [...lesson.items].sort(() => Math.random() - 0.5);
          btnShuffle.classList.add('bg-indigo-50', 'dark:bg-indigo-950/60', 'border-indigo-300', 'dark:border-indigo-700', 'text-indigo-600', 'dark:text-indigo-400');
        } else {
          state.items = [...lesson.items];
          btnShuffle.classList.remove('bg-indigo-50', 'dark:bg-indigo-950/60', 'border-indigo-300', 'dark:border-indigo-700', 'text-indigo-600', 'dark:text-indigo-400');
        }
        renderContent();
        if (window.lucide) lucide.createIcons();
      });
    }

    // Reset Button
    const btnReset = document.getElementById('btn-reset-board');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        resetState();
        renderContent();
        updateStats();
        if (window.lucide) lucide.createIcons();
      });
    }

    // Submit Test Button
    const btnSubmit = document.getElementById('btn-submit-test');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        submitTest();
      });
    }

    // Modal Close
    const btnCloseModal = document.getElementById('btn-close-modal');
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', () => {
        document.getElementById('modal-results').classList.add('hidden');
      });
    }
  }

  function setEvalMode(mode) {
    state.evalMode = mode;
    const btnModeZen = document.getElementById('btn-mode-zen');
    const btnModeTest = document.getElementById('btn-mode-test');
    const timerBadge = document.getElementById('timer-badge');
    const btnSubmit = document.getElementById('btn-submit-test');

    if (mode === 'zen') {
      btnModeZen.classList.add('bg-white', 'dark:bg-slate-700', 'text-sakura-600', 'dark:text-sakura-400', 'shadow-sm');
      btnModeZen.classList.remove('text-slate-600', 'dark:text-slate-400');
      btnModeTest.classList.remove('bg-white', 'dark:bg-slate-700', 'text-sakura-600', 'dark:text-sakura-400', 'shadow-sm');
      btnModeTest.classList.add('text-slate-600', 'dark:text-slate-400');

      if (timerBadge) timerBadge.classList.add('hidden');
      if (btnSubmit) btnSubmit.classList.add('hidden');
      stopTimer();
    } else {
      btnModeTest.classList.add('bg-white', 'dark:bg-slate-700', 'text-sakura-600', 'dark:text-sakura-400', 'shadow-sm');
      btnModeTest.classList.remove('text-slate-600', 'dark:text-slate-400');
      btnModeZen.classList.remove('bg-white', 'dark:bg-slate-700', 'text-sakura-600', 'dark:text-sakura-400', 'shadow-sm');
      btnModeZen.classList.add('text-slate-600', 'dark:text-slate-400');

      if (timerBadge) timerBadge.classList.remove('hidden');
      if (btnSubmit) btnSubmit.classList.remove('hidden');
      resetTimer();
    }

    renderContent();
    updateStats();
    if (window.lucide) lucide.createIcons();
  }

  function resetState() {
    state.userAnswers = {};
    state.revealedHints.clear();
    state.isSubmitted = false;
    resetTimer();
  }

  // --- TIMER ---
  function startTimer() {
    if (state.isTimerRunning) return;
    state.isTimerRunning = true;
    state.timerInterval = setInterval(() => {
      state.timerSeconds++;
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimer() {
    state.isTimerRunning = false;
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function resetTimer() {
    stopTimer();
    state.timerSeconds = 0;
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    if (!display) return;
    const mins = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
    const secs = (state.timerSeconds % 60).toString().padStart(2, '0');
    display.textContent = `${mins}:${secs}`;
  }

  // --- RENDER CONTENT ---
  function renderContent() {
    const container = document.getElementById('main-container');
    container.innerHTML = '';

    if (state.currentTab === 'flashcards') {
      renderFlashcards(container);
    } else if (state.currentTab === 'type-japanese') {
      renderTypeJapanese(container);
    } else {
      renderTypeVietnamese(container);
    }
  }

  // 1. FLASHCARDS / VOCABULARY LIST
  function renderFlashcards(container) {
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4';

    state.items.forEach(item => {
      const isMastered = state.masteredIds.has(item.id);
      const card = document.createElement('div');
      card.className = `rounded-2xl p-4 transition-all border ${
        isMastered 
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' 
          : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md'
      } flex flex-col justify-between gap-3 group relative`;

      card.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">#${item.id}</span>
            <button class="btn-play-audio text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Nghe phát âm">
              <i data-lucide="volume-2" class="w-4 h-4"></i>
            </button>
          </div>
          <button class="btn-toggle-master text-xs px-2 py-0.5 rounded-full font-medium transition-all ${
            isMastered 
              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
          }" title="Đánh dấu đã thuộc">
            ${isMastered ? '✓ Đã thuộc' : '○ Chưa thuộc'}
          </button>
        </div>

        <div class="cursor-pointer py-1" title="Bấm để nghe phát âm">
          <div class="font-jp font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight">${item.japanese}</div>
          <div class="font-mono text-xs text-indigo-500 dark:text-indigo-400 font-semibold mt-1">${item.romaji}</div>
        </div>

        <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div class="text-sm font-semibold text-slate-700 dark:text-slate-200">${item.vietnamese}</div>
        </div>
      `;

      card.querySelector('.cursor-pointer').addEventListener('click', () => {
        speakJapanese(item.japanese);
      });
      card.querySelector('.btn-play-audio').addEventListener('click', (e) => {
        e.stopPropagation();
        speakJapanese(item.japanese);
      });

      card.querySelector('.btn-toggle-master').addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.masteredIds.has(item.id)) {
          state.masteredIds.delete(item.id);
        } else {
          state.masteredIds.add(item.id);
        }
        localStorage.setItem(`lesson_${state.lessonId}_mastered`, JSON.stringify(Array.from(state.masteredIds)));
        renderContent();
        updateStats();
        if (window.lucide) lucide.createIcons();
      });

      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // 2. TYPE JAPANESE (Nhìn Tiếng Việt ➔ Gõ Tiếng Nhật / Romaji)
  function renderTypeJapanese(container) {
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4';

    state.items.forEach(item => {
      const userAnswer = (state.userAnswers[item.id] || '').toLowerCase().trim();
      const isHintRevealed = state.revealedHints.has(item.id);
      const isCorrect = isAnswerCorrect(userAnswer, item);
      const hasAnswer = userAnswer.length > 0;

      let borderClass = isHintRevealed ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200/80 dark:border-slate-800';
      let bgClass = isHintRevealed ? 'bg-amber-50/30 dark:bg-amber-950/10' : 'bg-white dark:bg-slate-900/90';

      if (state.evalMode === 'zen' && hasAnswer) {
        borderClass = isCorrect ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/40 dark:bg-rose-950/20';
      } else if (state.isSubmitted) {
        borderClass = isCorrect ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/60 dark:bg-rose-950/30';
      }

      const card = document.createElement('div');
      card.className = `rounded-2xl p-3.5 sm:p-4 border ${borderClass} ${bgClass} shadow-sm transition-all flex flex-col justify-between gap-2.5 relative group`;

      const topArea = document.createElement('div');
      topArea.className = 'flex items-start justify-between gap-2 cursor-pointer';
      topArea.title = isHintRevealed ? 'Bấm để ẩn đáp án' : 'Bấm để xem đáp án';

      topArea.innerHTML = `
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400">#${item.id}</span>
          <div class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">${item.vietnamese}</div>
        </div>
        ${isHintRevealed ? `<span class="hint-tag text-[11px] font-bold font-jp bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 animate-pop shrink-0">💡 ${item.japanese}</span>` : `<span class="text-[10px] text-slate-400 hover:text-amber-500 shrink-0">💡 Xem</span>`}
      `;

      topArea.addEventListener('click', () => {
        if (state.revealedHints.has(item.id)) {
          state.revealedHints.delete(item.id);
        } else {
          state.revealedHints.add(item.id);
          speakJapanese(item.japanese);
        }
        renderContent();
        if (window.lucide) lucide.createIcons();
      });

      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.itemId = item.id;
      input.value = state.userAnswers[item.id] || '';
      input.placeholder = 'Gõ tiếng Nhật hoặc Romaji...';
      input.autocomplete = 'off';
      input.autocapitalize = 'off';
      input.spellcheck = false;
      input.className = 'w-full font-jp font-semibold text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

      input.addEventListener('input', (e) => {
        const val = e.target.value;
        state.userAnswers[item.id] = val;

        if (state.evalMode === 'test' && !state.isTimerRunning) {
          startTimer();
        }

        if (state.evalMode === 'zen') {
          if (isAnswerCorrect(val, item)) {
            speakJapanese(item.japanese);
            focusNextInput(item.id);
          }
        }
        updateStats();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          focusNextInput(item.id);
        }
      });

      card.appendChild(topArea);
      card.appendChild(input);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // 3. TYPE VIETNAMESE (Nhìn Tiếng Nhật ➔ Gõ Nghĩa Tiếng Việt)
  function renderTypeVietnamese(container) {
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4';

    state.items.forEach(item => {
      const userAnswer = (state.userAnswers[item.id] || '').toLowerCase().trim();
      const isHintRevealed = state.revealedHints.has(item.id);
      const isCorrect = isVietnameseCorrect(userAnswer, item);
      const hasAnswer = userAnswer.length > 0;

      let borderClass = isHintRevealed ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200/80 dark:border-slate-800';
      let bgClass = isHintRevealed ? 'bg-amber-50/30 dark:bg-amber-950/10' : 'bg-white dark:bg-slate-900/90';

      if (state.evalMode === 'zen' && hasAnswer) {
        borderClass = isCorrect ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/40 dark:bg-rose-950/20';
      } else if (state.isSubmitted) {
        borderClass = isCorrect ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/60 dark:bg-rose-950/30';
      }

      const card = document.createElement('div');
      card.className = `rounded-2xl p-3.5 sm:p-4 border ${borderClass} ${bgClass} shadow-sm transition-all flex flex-col justify-between gap-2.5 relative group`;

      const topArea = document.createElement('div');
      topArea.className = 'flex items-start justify-between gap-2 cursor-pointer';
      topArea.title = isHintRevealed ? 'Bấm để ẩn đáp án' : 'Bấm để xem đáp án';

      topArea.innerHTML = `
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400">#${item.id}</span>
          <div class="font-jp font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">${item.japanese}</div>
          <div class="font-mono text-[11px] text-indigo-500 font-semibold">${item.romaji}</div>
        </div>
        ${isHintRevealed ? `<span class="hint-tag text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 animate-pop shrink-0 max-w-[140px] truncate">💡 ${item.vietnamese}</span>` : `<span class="text-[10px] text-slate-400 hover:text-amber-500 shrink-0">💡 Xem</span>`}
      `;

      topArea.addEventListener('click', () => {
        if (state.revealedHints.has(item.id)) {
          state.revealedHints.delete(item.id);
        } else {
          state.revealedHints.add(item.id);
          speakJapanese(item.japanese);
        }
        renderContent();
        if (window.lucide) lucide.createIcons();
      });

      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.itemId = item.id;
      input.value = state.userAnswers[item.id] || '';
      input.placeholder = 'Gõ nghĩa tiếng Việt...';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.className = 'w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

      input.addEventListener('input', (e) => {
        const val = e.target.value;
        state.userAnswers[item.id] = val;

        if (state.evalMode === 'test' && !state.isTimerRunning) {
          startTimer();
        }

        if (state.evalMode === 'zen') {
          if (isVietnameseCorrect(val, item)) {
            speakJapanese(item.japanese);
            focusNextInput(item.id);
          }
        }
        updateStats();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          focusNextInput(item.id);
        }
      });

      card.appendChild(topArea);
      card.appendChild(input);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // --- SMART MATCHING HELPERS ---
  function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase().trim();
  }

  function isAnswerCorrect(inputVal, item) {
    if (!inputVal) return false;
    const clean = inputVal.toLowerCase().trim();
    const cleanNoAccents = removeAccents(clean);

    if (clean === item.romaji.toLowerCase().replace(/~/g, '').trim()) return true;
    if (clean === item.kana.trim() || clean === item.japanese.trim()) return true;
    if (item.hints && item.hints.some(h => cleanNoAccents.includes(removeAccents(h)))) return true;
    return false;
  }

  function isVietnameseCorrect(inputVal, item) {
    if (!inputVal) return false;
    const userClean = removeAccents(inputVal);
    const targetClean = removeAccents(item.vietnamese);

    if (targetClean.includes(userClean) && userClean.length >= 2) return true;
    if (item.hints && item.hints.some(h => userClean === removeAccents(h))) return true;
    return false;
  }

  function focusNextInput(currentId) {
    const inputs = Array.from(document.querySelectorAll('input[data-item-id]'));
    const currentIndex = inputs.findIndex(inp => parseInt(inp.dataset.itemId) === currentId);
    if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus();
    }
  }

  // --- STATS & TEST SUBMIT ---
  function updateStats() {
    const total = state.items.length;
    let completed = 0;
    let correct = 0;

    state.items.forEach(item => {
      const val = state.userAnswers[item.id];
      if (val && val.trim().length > 0) {
        completed++;
        const isOk = state.currentTab === 'type-vietnamese' 
          ? isVietnameseCorrect(val, item) 
          : isAnswerCorrect(val, item);
        if (isOk) correct++;
      }
    });

    const statProgress = document.getElementById('stat-progress-text');
    const statAccuracy = document.getElementById('stat-accuracy-text');
    const progressBar = document.getElementById('stat-progress-bar');

    if (state.currentTab === 'flashcards') {
      const masteredCount = state.masteredIds.size;
      if (statProgress) statProgress.textContent = `${masteredCount}/${total}`;
      if (statAccuracy) statAccuracy.textContent = `${Math.round((masteredCount / total) * 100)}% thuộc`;
      if (progressBar) progressBar.style.width = `${(masteredCount / total) * 100}%`;
    } else {
      if (statProgress) statProgress.textContent = `${completed}/${total}`;
      const accuracy = completed > 0 ? Math.round((correct / completed) * 100) : 0;
      if (statAccuracy) statAccuracy.textContent = `${accuracy}%`;
      if (progressBar) progressBar.style.width = `${(completed / total) * 100}%`;
    }
  }

  function submitTest() {
    stopTimer();
    state.isSubmitted = true;
    renderContent();

    const total = state.items.length;
    let correct = 0;
    const mistakes = [];

    state.items.forEach(item => {
      const val = state.userAnswers[item.id] || '';
      const isOk = state.currentTab === 'type-vietnamese' 
        ? isVietnameseCorrect(val, item) 
        : isAnswerCorrect(val, item);

      if (isOk) {
        correct++;
      } else {
        mistakes.push({
          item,
          userAnswer: val,
          correctAnswer: state.currentTab === 'type-vietnamese' ? item.vietnamese : `${item.japanese} (${item.romaji})`
        });
      }
    });

    const scorePct = Math.round((correct / total) * 100);
    document.getElementById('modal-score-badge').textContent = `${scorePct}%`;
    document.getElementById('modal-score-count').textContent = `${correct}/${total}`;
    document.getElementById('modal-time-count').textContent = document.getElementById('timer-display').textContent;

    const mistakesContainer = document.getElementById('modal-mistakes-list');
    mistakesContainer.innerHTML = '';

    if (mistakes.length === 0) {
      mistakesContainer.innerHTML = '<div class="text-center py-4 text-emerald-600 font-bold">🎉 Hoàn hảo! Bạn không sai từ nào!</div>';
    } else {
      mistakes.forEach(m => {
        const div = document.createElement('div');
        div.className = 'p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2';
        div.innerHTML = `
          <div>
            <div class="font-bold text-slate-800 dark:text-slate-100">${m.item.japanese} <span class="font-normal text-xs text-slate-500">(${m.item.romaji})</span></div>
            <div class="text-xs text-slate-600 dark:text-slate-400 font-medium">Nghĩa: ${m.item.vietnamese}</div>
          </div>
          <div class="text-right text-xs">
            <div class="text-rose-500 line-through">${m.userAnswer || '(Để trống)'}</div>
            <div class="text-emerald-600 font-bold">${m.correctAnswer}</div>
          </div>
        `;
        mistakesContainer.appendChild(div);
      });
    }

    document.getElementById('modal-results').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  // --- BOOTSTRAP ---
  document.addEventListener('DOMContentLoaded', init);
})();
