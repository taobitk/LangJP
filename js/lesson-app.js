/**
 * Universal Lesson Learning Engine with In-place DOM Hint Toggle & Built-in Japanese Auto-IME
 */

(function () {
  'use strict';

  const lesson = window.CURRENT_LESSON || {
    id: 1,
    title: "Bài Học",
    subtitle: "Từ Vựng",
    items: []
  };

  // --- STATE ---
  const state = {
    lessonId: lesson.id,
    currentTab: 'flashcards',    // Default: 'flashcards', 'type-japanese', 'type-vietnamese'
    evalMode: 'zen',             // 'zen' or 'test'
    isShuffled: false,
    autoImeEnabled: true,        // Auto convert Romaji -> Kana
    items: [...lesson.items],
    userAnswers: {},             // key: item.id -> { kana: string, kanji: string, vietnamese: string }
    revealedHints: new Set(),
    soundEnabled: true,
    isSubmitted: false,
    timerSeconds: 0,
    timerInterval: null,
    isTimerRunning: false,
    masteredIds: new Set(JSON.parse(localStorage.getItem(`lesson_${lesson.id}_mastered`) || '[]')),
  };

  // Helper to ensure item answer object
  function getAnswer(itemId) {
    if (!state.userAnswers[itemId] || typeof state.userAnswers[itemId] !== 'object') {
      state.userAnswers[itemId] = { kana: '', kanji: '', vietnamese: '' };
    }
    return state.userAnswers[itemId];
  }

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
    const cleanText = text.replace(/\(.*?\)/g, '').replace(/[～~\[\]]/g, '').trim() || text;

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
    syncActiveTabUI(state.currentTab);
    bindEvents();
    renderContent();
    updateStats();
    if (window.lucide) lucide.createIcons();
  }

  function syncActiveTabUI(activeTab) {
    document.querySelectorAll('[data-tab]').forEach(btn => {
      if (btn.dataset.tab === activeTab) {
        btn.className = 'flex-1 min-w-[100px] text-xs sm:text-sm font-bold px-3 py-2 rounded-lg bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0';
      } else {
        btn.className = 'flex-1 min-w-[100px] text-xs sm:text-sm font-bold px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-1.5 shrink-0';
      }
    });
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
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (state.currentTab === tab) return;

        state.currentTab = tab;
        syncActiveTabUI(tab);
        renderContent();
        updateStats();
        if (window.lucide) lucide.createIcons();
      });
    });

    const btnModeZen = document.getElementById('btn-mode-zen');
    const btnModeTest = document.getElementById('btn-mode-test');
    if (btnModeZen && btnModeTest) {
      btnModeZen.addEventListener('click', () => setEvalMode('zen'));
      btnModeTest.addEventListener('click', () => setEvalMode('test'));
    }

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

    const btnReset = document.getElementById('btn-reset-board');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        resetState();
        renderContent();
        updateStats();
        if (window.lucide) lucide.createIcons();
      });
    }

    const btnSubmit = document.getElementById('btn-submit-test');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => submitTest());
    }

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
    if (!container) return;
    container.innerHTML = '';

    if (state.currentTab === 'flashcards') {
      renderFlashcards(container);
    } else if (state.currentTab === 'type-japanese') {
      renderTypeJapaneseDual(container);
    } else {
      renderTypeVietnamese(container);
    }
  }

  // 1. FLASHCARDS
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
          }">
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

      card.querySelector('.cursor-pointer').addEventListener('click', () => speakJapanese(item.japanese));
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

  // 2. GÕ TIẾNG NHẬT (DUAL INPUT: KANA QWERTY AUTO-IME + KANJI AUTO CONVERTER)
  function renderTypeJapaneseDual(container) {
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4';

    state.items.forEach(item => {
      const answer = getAnswer(item.id);
      const hasKanji = item.kanji && item.kanji !== item.kana && !item.kanji.startsWith('～');
      const isHintRevealed = state.revealedHints.has(item.id);

      const isKanaOk = isKanaInputCorrect(answer.kana, item);
      const isKanjiOk = !hasKanji || isKanjiInputCorrect(answer.kanji, item);
      const isCompleteOk = isKanaOk && isKanjiOk;
      const hasInput = (answer.kana && answer.kana.length > 0) || (answer.kanji && answer.kanji.length > 0);

      let borderClass = isHintRevealed ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200/80 dark:border-slate-800';
      let bgClass = isHintRevealed ? 'bg-amber-50/30 dark:bg-amber-950/10' : 'bg-white dark:bg-slate-900/90';

      if (state.evalMode === 'zen' && hasInput) {
        borderClass = isCompleteOk ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-slate-300 dark:border-slate-700';
      } else if (state.isSubmitted) {
        borderClass = isCompleteOk ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/60 dark:bg-rose-950/30';
      }

      const card = document.createElement('div');
      card.id = `card-item-${item.id}`;
      card.className = `rounded-2xl p-3.5 sm:p-4 border ${borderClass} ${bgClass} shadow-sm transition-all flex flex-col justify-between gap-3 relative group`;

      // Header: Vietnamese meaning + Hint Toggle
      const topArea = document.createElement('div');
      topArea.className = 'flex items-start justify-between gap-2 cursor-pointer';
      topArea.title = isHintRevealed ? 'Bấm để ẩn đáp án' : 'Bấm để xem đáp án';

      topArea.innerHTML = `
        <div>
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-mono font-bold text-slate-400">#${item.id}</span>
            ${hasKanji ? '<span class="text-[9px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold px-1.5 py-0.2 rounded font-jp">Kanji</span>' : '<span class="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-1.5 py-0.2 rounded">Kana</span>'}
          </div>
          <div class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug mt-0.5">${item.vietnamese}</div>
        </div>
        <div class="hint-badge-wrapper shrink-0">
          ${isHintRevealed 
            ? `<span class="hint-tag text-[11px] font-bold font-jp bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 animate-pop block max-w-[150px] text-right truncate">💡 ${item.japanese}</span>` 
            : `<span class="text-[10px] text-slate-400 hover:text-amber-500">💡 Xem</span>`
          }
        </div>
      `;

      // In-place DOM Hint Toggle (Never destroys grid on click)
      topArea.addEventListener('click', () => {
        const isRevealed = state.revealedHints.has(item.id);
        const badgeWrapper = card.querySelector('.hint-badge-wrapper');
        if (isRevealed) {
          state.revealedHints.delete(item.id);
          if (badgeWrapper) badgeWrapper.innerHTML = `<span class="text-[10px] text-slate-400 hover:text-amber-500">💡 Xem</span>`;
          card.classList.remove('border-amber-400', 'ring-2', 'ring-amber-400/20', 'bg-amber-50/30', 'dark:bg-amber-950/10');
        } else {
          state.revealedHints.add(item.id);
          if (badgeWrapper) badgeWrapper.innerHTML = `<span class="hint-tag text-[11px] font-bold font-jp bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 animate-pop block max-w-[150px] text-right truncate">💡 ${item.japanese}</span>`;
          card.classList.add('border-amber-400', 'ring-2', 'ring-amber-400/20', 'bg-amber-50/30', 'dark:bg-amber-950/10');
          speakJapanese(item.japanese);
        }
      });

      // Inputs Container (Kana + Kanji)
      const inputsBox = document.createElement('div');
      inputsBox.className = 'space-y-2';

      // 1. Kana Input (With Real-time QWERTY Auto-IME)
      const kanaRow = document.createElement('div');
      kanaRow.className = 'space-y-1';
      kanaRow.innerHTML = `
        <div class="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          <span>1. Cách đọc (Gõ phím thường ➔ Tự ra Kana)</span>
          <span class="kana-status-tag ${isKanaOk ? 'text-emerald-500 font-bold' : 'hidden'}">✓ Đúng</span>
        </div>
      `;

      const inputKana = document.createElement('input');
      inputKana.type = 'text';
      inputKana.dataset.itemId = item.id;
      inputKana.dataset.type = 'kana';
      inputKana.value = answer.kana || '';
      inputKana.placeholder = `vd: ${item.romaji.replace(/~/g, '')}...`;
      inputKana.autocomplete = 'off';
      inputKana.autocapitalize = 'off';
      inputKana.spellcheck = false;
      inputKana.className = `w-full font-jp font-bold text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border ${isKanaOk ? 'border-emerald-400 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'} rounded-xl py-1.5 px-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`;

      // Real-time Auto-IME Conversion for Kana
      inputKana.addEventListener('input', (e) => {
        if (state.autoImeEnabled && window.JapaneseIME) {
          const isKatakanaWord = /[\u30A0-\u30FF]/.test(item.kana || item.japanese);
          let converted = window.JapaneseIME.toHiragana(inputKana.value);
          if (isKatakanaWord) {
            converted = window.JapaneseIME.toKatakana(converted);
          }
          inputKana.value = converted;
        }
        answer.kana = inputKana.value.trim();

        if (state.evalMode === 'test' && !state.isTimerRunning) startTimer();

        const okKana = isKanaInputCorrect(answer.kana, item);
        const statusTag = card.querySelector('.kana-status-tag');
        if (okKana) {
          inputKana.classList.remove('border-slate-200', 'dark:border-slate-700', 'text-slate-900', 'dark:text-white');
          inputKana.classList.add('border-emerald-400', 'text-emerald-700', 'dark:text-emerald-300');
          if (statusTag) statusTag.classList.remove('hidden');

          if (!hasKanji) {
            card.classList.remove('border-slate-200/80', 'dark:border-slate-800');
            card.classList.add('border-emerald-500', 'ring-2', 'ring-emerald-500/20', 'bg-emerald-50/40', 'dark:bg-emerald-950/20');
            speakJapanese(item.japanese);
            focusNextInput(item.id, 'kana');
          } else {
            if (!answer.kanji) {
              answer.kanji = item.kanji;
              if (inputKanji) {
                inputKanji.value = item.kanji;
                inputKanji.classList.add('border-emerald-400', 'text-emerald-700', 'dark:text-emerald-300');
              }
            }
            card.classList.remove('border-slate-200/80', 'dark:border-slate-800');
            card.classList.add('border-emerald-500', 'ring-2', 'ring-emerald-500/20', 'bg-emerald-50/40', 'dark:bg-emerald-950/20');
            speakJapanese(item.japanese);
            if (inputKanji) inputKanji.focus();
          }
        } else {
          if (statusTag) statusTag.classList.add('hidden');
        }
        updateStats();
      });

      inputKana.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          if (hasKanji && inputKanji) {
            inputKanji.focus();
          } else {
            focusNextInput(item.id, 'kana');
          }
        }
      });

      kanaRow.appendChild(inputKana);
      inputsBox.appendChild(kanaRow);

      // 2. Kanji Input (If word has Kanji)
      let inputKanji = null;
      if (hasKanji) {
        const kanjiRow = document.createElement('div');
        kanjiRow.className = 'space-y-1 animate-fade-in';
        kanjiRow.innerHTML = `
          <div class="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            <span>2. Chữ Hán Kanji (Tự chuyển đổi)</span>
            <span class="kanji-status-tag ${isKanjiOk ? 'text-emerald-500 font-bold' : 'hidden'}">✓ Đúng</span>
          </div>
        `;

        inputKanji = document.createElement('input');
        inputKanji.type = 'text';
        inputKanji.dataset.itemId = item.id;
        inputKanji.dataset.type = 'kanji';
        inputKanji.value = answer.kanji || '';
        inputKanji.placeholder = `Chuyển đổi: ${item.kanji}`;
        inputKanji.autocomplete = 'off';
        inputKanji.spellcheck = false;
        inputKanji.className = `w-full font-jp font-bold text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border ${isKanjiOk ? 'border-emerald-400 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'} rounded-xl py-1.5 px-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`;

        inputKanji.addEventListener('input', (e) => {
          answer.kanji = e.target.value.trim();
          const ok = isKanjiInputCorrect(answer.kanji, item);
          const statusTag = card.querySelector('.kanji-status-tag');
          if (ok && isKanaInputCorrect(answer.kana, item)) {
            inputKanji.classList.add('border-emerald-400', 'text-emerald-700', 'dark:text-emerald-300');
            if (statusTag) statusTag.classList.remove('hidden');
            speakJapanese(item.japanese);
            focusNextInput(item.id, 'kanji');
          } else {
            if (statusTag) statusTag.classList.add('hidden');
          }
          updateStats();
        });

        inputKanji.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            focusNextInput(item.id, 'kanji');
          }
        });

        // Quick Convert Button for Kanji
        const convertBtn = document.createElement('button');
        convertBtn.type = 'button';
        convertBtn.className = 'text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 mt-0.5';
        convertBtn.innerHTML = `<span>✨ Bấm để chuyển sang "${item.kanji}"</span>`;
        convertBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          answer.kanji = item.kanji;
          inputKanji.value = item.kanji;
          inputKanji.classList.add('border-emerald-400', 'text-emerald-700', 'dark:text-emerald-300');
          const statusTag = card.querySelector('.kanji-status-tag');
          if (statusTag) statusTag.classList.remove('hidden');
          if (isKanaInputCorrect(answer.kana, item)) {
            speakJapanese(item.japanese);
            focusNextInput(item.id, 'kanji');
          }
          updateStats();
        });

        kanjiRow.appendChild(inputKanji);
        kanjiRow.appendChild(convertBtn);
        inputsBox.appendChild(kanjiRow);
      }

      card.appendChild(topArea);
      card.appendChild(inputsBox);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // 3. TYPE VIETNAMESE
  function renderTypeVietnamese(container) {
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4';

    state.items.forEach(item => {
      const answer = getAnswer(item.id);
      const userAnswer = (answer.vietnamese || '').toLowerCase().trim();
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
      card.id = `card-vn-item-${item.id}`;
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
        <div class="hint-badge-wrapper shrink-0">
          ${isHintRevealed 
            ? `<span class="hint-tag text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 animate-pop block max-w-[140px] truncate">💡 ${item.vietnamese}</span>` 
            : `<span class="text-[10px] text-slate-400 hover:text-amber-500">💡 Xem</span>`
          }
        </div>
      `;

      // In-place DOM Hint Toggle (Never wipes grid)
      topArea.addEventListener('click', () => {
        const isRevealed = state.revealedHints.has(item.id);
        const badgeWrapper = card.querySelector('.hint-badge-wrapper');
        if (isRevealed) {
          state.revealedHints.delete(item.id);
          if (badgeWrapper) badgeWrapper.innerHTML = `<span class="text-[10px] text-slate-400 hover:text-amber-500">💡 Xem</span>`;
          card.classList.remove('border-amber-400', 'ring-2', 'ring-amber-400/20', 'bg-amber-50/30', 'dark:bg-amber-950/10');
        } else {
          state.revealedHints.add(item.id);
          if (badgeWrapper) badgeWrapper.innerHTML = `<span class="hint-tag text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 animate-pop block max-w-[140px] truncate">💡 ${item.vietnamese}</span>`;
          card.classList.add('border-amber-400', 'ring-2', 'ring-amber-400/20', 'bg-amber-50/30', 'dark:bg-amber-950/10');
          speakJapanese(item.japanese);
        }
      });

      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.itemId = item.id;
      input.value = answer.vietnamese || '';
      input.placeholder = 'Gõ nghĩa tiếng Việt...';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.className = 'w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

      input.addEventListener('input', (e) => {
        const val = e.target.value;
        answer.vietnamese = val;

        if (state.evalMode === 'test' && !state.isTimerRunning) startTimer();

        if (state.evalMode === 'zen') {
          if (isVietnameseCorrect(val, item)) {
            input.classList.remove('border-slate-200', 'dark:border-slate-700', 'text-slate-900', 'dark:text-white');
            input.classList.add('border-emerald-400', 'text-emerald-700', 'dark:text-emerald-300');
            card.classList.remove('border-slate-200/80', 'dark:border-slate-800');
            card.classList.add('border-emerald-500', 'ring-2', 'ring-emerald-500/20', 'bg-emerald-50/40', 'dark:bg-emerald-950/20');
            speakJapanese(item.japanese);
            focusNextInput(item.id, 'vietnamese');
          }
        }
        updateStats();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          focusNextInput(item.id, 'vietnamese');
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
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase().trim();
  }

  function cleanVietnamesePhrase(str) {
    return removeAccents(str)
      .replace(/[\(\)\[\]\{\}\.,;\/\-–~_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getVietnameseValidOptions(item) {
    const raw = item.vietnamese || '';
    const options = new Set();

    const phrases = raw.split(/[,;\/\(\)]+/).map(s => cleanVietnamesePhrase(s)).filter(s => s.length > 0);
    phrases.forEach(p => options.add(p));

    const fullClean = cleanVietnamesePhrase(raw);
    if (fullClean) options.add(fullClean);

    if (item.hints) {
      item.hints.forEach(h => {
        const cleanH = cleanVietnamesePhrase(h);
        if (cleanH) options.add(cleanH);
      });
    }

    return Array.from(options);
  }

  function isVietnameseCorrect(inputVal, item) {
    if (!inputVal) return false;
    const userClean = cleanVietnamesePhrase(inputVal);
    if (!userClean) return false;

    const validOptions = getVietnameseValidOptions(item);
    return validOptions.some(opt => opt === userClean);
  }

  function isKanaInputCorrect(inputVal, item) {
    if (!inputVal) return false;
    const clean = inputVal.toLowerCase().trim();
    const cleanRomaji = item.romaji.toLowerCase().replace(/[~～\[\]]/g, '').trim();
    const cleanKana = item.kana.replace(/[~～\[\]]/g, '').trim();

    if (clean === cleanRomaji || clean === cleanKana) return true;
    if (window.JapaneseIME && window.JapaneseIME.toHiragana(clean) === cleanKana) return true;
    if (item.hints && item.hints.some(h => clean === h.toLowerCase().trim())) return true;
    return false;
  }

  function isKanjiInputCorrect(inputVal, item) {
    if (!inputVal) return false;
    const clean = inputVal.trim();
    const targetKanji = item.kanji.replace(/[~～\[\]\(\)]/g, '').trim();
    return clean === targetKanji || clean === item.kanji.trim() || clean === item.japanese.trim();
  }

  function focusNextInput(currentId, type = 'kana') {
    const inputs = Array.from(document.querySelectorAll(`input[data-item-id]`));
    const currentInput = inputs.find(inp => parseInt(inp.dataset.itemId) === currentId && inp.dataset.type === type) || inputs.find(inp => parseInt(inp.dataset.itemId) === currentId);
    const currentIndex = inputs.indexOf(currentInput);
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
      const val = getAnswer(item.id);
      if (state.currentTab === 'type-japanese') {
        const kana = val.kana || '';
        const kanji = val.kanji || '';
        const hasKanji = item.kanji && item.kanji !== item.kana && !item.kanji.startsWith('～');
        if (kana.length > 0) {
          completed++;
          const isOk = isKanaInputCorrect(kana, item) && (!hasKanji || isKanjiInputCorrect(kanji, item));
          if (isOk) correct++;
        }
      } else if (state.currentTab === 'type-vietnamese') {
        const vn = val.vietnamese || '';
        if (vn.length > 0) {
          completed++;
          if (isVietnameseCorrect(vn, item)) correct++;
        }
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
      const val = getAnswer(item.id);
      let isOk = false;
      let userDisplay = '';

      if (state.currentTab === 'type-japanese') {
        const kana = val.kana || '';
        const kanji = val.kanji || '';
        const hasKanji = item.kanji && item.kanji !== item.kana && !item.kanji.startsWith('～');
        isOk = isKanaInputCorrect(kana, item) && (!hasKanji || isKanjiInputCorrect(kanji, item));
        userDisplay = hasKanji ? `${kana} / ${kanji || '(Trống)'}` : kana;
      } else {
        const vn = val.vietnamese || '';
        isOk = isVietnameseCorrect(vn, item);
        userDisplay = vn;
      }

      if (isOk) {
        correct++;
      } else {
        mistakes.push({
          item,
          userAnswer: userDisplay,
          correctAnswer: state.currentTab === 'type-vietnamese' ? item.vietnamese : item.japanese
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
