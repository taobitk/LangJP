/**
 * Kana Syllabary Matrix Application Logic (Hiragana & Katakana)
 * Manages Scope Filtering, Matrix Rendering, Keyboard Navigation, Auto-Advance, and Evaluation
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    kanaType: 'hiragana',     // 'hiragana' or 'katakana'
    selectedCategory: 'all',  // 'all', 'basic', 'dakuten', 'yoon'
    selectedRows: new Set(),  // Set of selected row ids (e.g. 'a', 'ka', 'sa'...)
    currentTab: 'fill-romaji', // 'study', 'fill-romaji', 'fill-hiragana'
    evalMode: 'zen',          // 'zen' (instant check) or 'test' (check on submit)
    isShuffled: false,        // Shuffled random order mode
    shuffledItems: null,      // Cached shuffled items
    revealedHints: new Set(), // Set of cellKeys currently revealing answer
    soundEnabled: true,       // Audio pronunciation enabled
    userAnswers: {},          // key: `${rowId}_${colIndex}` -> value: string
    activeSlotKey: null,      // For Mode 3: currently selected slot
    isSubmitted: false,       // In test mode, whether answers have been checked
    timerSeconds: 0,
    timerInterval: null,
    isTimerRunning: false,
    startTime: null,
  };

  // Helper to get active Kana dataset
  function getCurrentData() {
    return state.kanaType === 'katakana' ? window.KATAKANA_DATA : window.HIRAGANA_DATA;
  }

  // --- INITIALIZATION ---
  function init() {
    // Load saved kana type
    const savedType = localStorage.getItem('langjp_kana_type');
    if (savedType === 'katakana') {
      state.kanaType = 'katakana';
    }

    // Default selection: All rows in Basic
    const data = getCurrentData();
    if (data && data.basic) {
      data.basic.rows.forEach(r => state.selectedRows.add(r.id));
    }

    initTheme();
    initSound();
    initKanaAudioMap();
    renderKanaTypeSwitcherUI();
    renderFilterCategories();
    bindKanaSwitcher();
    bindHeaderEvents();
    bindModeTabs();
    bindFilterButtons();
    bindActionButtons();
    bindModalButtons();

    // Initial Render
    refreshAll();
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

  // --- AUDIO ENGINE ---
  let currentAudio = null;
  const KANA_AUDIO_MAP = {};

  function initKanaAudioMap() {
    // Base Hiragana Audio Map
    const baseMap = {
      "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
      "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
      "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
      "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
      "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
      "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
      "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
      "や": "ya", "ゆ": "yu", "よ": "yo",
      "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
      "わ": "wa", "を": "wo", "ん": "n",
      "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
      "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
      "だ": "da", "ぢ": "dji", "づ": "dzu", "で": "de", "ど": "do",
      "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
      "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
      "きゃ": "kya", "きゅ": "kyu", "きょ": "kyo",
      "しゃ": "sha", "しゅ": "shu", "しょ": "sho",
      "ちゃ": "cha", "ちゅ": "chu", "ちょ": "cho",
      "にゃ": "nya", "にゅ": "nyu", "にょ": "nyo",
      "ひゃ": "hya", "ひゅ": "hyu", "ひょ": "hyo",
      "みゃ": "mya", "みゅ": "myu", "みょ": "myo",
      "りゃ": "rya", "りゅ": "ryu", "りょ": "ryo",
      "ぎゃ": "gya", "ぎゅ": "gyu", "ぎょ": "gyo",
      "じゃ": "ja", "じゅ": "ju", "じょ": "jo",
      "びゃ": "bya", "びゅ": "byu", "びょ": "byo",
      "ぴゃ": "pya", "ぴゅ": "pyu", "ぴょ": "pyo"
    };

    Object.assign(KANA_AUDIO_MAP, baseMap);

    // Populate all Katakana sounds automatically from KATAKANA_DATA
    if (window.KATAKANA_DATA) {
      Object.values(window.KATAKANA_DATA).forEach(cat => {
        cat.rows.forEach(r => {
          r.items.forEach(it => {
            if (it.kana) {
              const audioFile = it.romaji.toLowerCase().replace(/[^a-z]/g, '');
              KANA_AUDIO_MAP[it.kana] = baseMap[window.JapaneseIME ? window.JapaneseIME.toHiragana(it.kana) : ''] || audioFile;
            }
          });
        });
      });
    }
  }

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

  function speakKana(kanaOrItem) {
    if (!state.soundEnabled) return;
    const kana = typeof kanaOrItem === 'object' ? kanaOrItem.kana : kanaOrItem;
    if (!kana) return;

    const file = KANA_AUDIO_MAP[kana];
    if (file) {
      try {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
        currentAudio = new Audio(`./audio/${file}.mp3`);
        currentAudio.playbackRate = 1.0;
        const playPromise = currentAudio.play();
        if (playPromise) {
          playPromise.catch(() => {
            fallbackSpeechSynthesis(kana);
          });
        }
        return;
      } catch (e) {
        fallbackSpeechSynthesis(kana);
      }
    } else {
      fallbackSpeechSynthesis(kana);
    }
  }

  function fallbackSpeechSynthesis(text) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch (err) { }
  }

  // --- KANA TYPE SWITCHER (HIRAGANA vs KATAKANA) ---
  function bindKanaSwitcher() {
    const btnHira = document.getElementById('btn-kana-hiragana');
    const btnKata = document.getElementById('btn-kana-katakana');

    if (btnHira) {
      btnHira.addEventListener('click', () => switchKanaType('hiragana'));
    }
    if (btnKata) {
      btnKata.addEventListener('click', () => switchKanaType('katakana'));
    }
  }

  function switchKanaType(type) {
    if (state.kanaType === type) return;
    state.kanaType = type;
    localStorage.setItem('langjp_kana_type', type);

    // Reset selected rows to all Basic rows of current dataset
    state.selectedRows.clear();
    const data = getCurrentData();
    if (data && data.basic) {
      data.basic.rows.forEach(r => state.selectedRows.add(r.id));
    }

    renderKanaTypeSwitcherUI();
    resetBoardState();
    refreshAll();
  }

  function renderKanaTypeSwitcherUI() {
    const isHira = state.kanaType === 'hiragana';
    const btnHira = document.getElementById('btn-kana-hiragana');
    const btnKata = document.getElementById('btn-kana-katakana');

    if (btnHira && btnKata) {
      if (isHira) {
        btnHira.className = 'py-2 sm:py-2.5 px-3 rounded-xl text-center flex items-center justify-center gap-2 sm:gap-3 transition-all border-2 border-sakura-500 bg-sakura-50/70 dark:bg-sakura-950/30 text-sakura-700 dark:text-sakura-300 font-bold shadow-sm';
        btnKata.className = 'py-2 sm:py-2.5 px-3 rounded-xl text-center flex items-center justify-center gap-2 sm:gap-3 transition-all border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold';
      } else {
        btnKata.className = 'py-2 sm:py-2.5 px-3 rounded-xl text-center flex items-center justify-center gap-2 sm:gap-3 transition-all border-2 border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm';
        btnHira.className = 'py-2 sm:py-2.5 px-3 rounded-xl text-center flex items-center justify-center gap-2 sm:gap-3 transition-all border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold';
      }
    }
  }

  // --- FILTER UI ---
  function renderFilterCategories() {
    const container = document.getElementById('filter-categories-container');
    if (!container) return;
    container.innerHTML = '';

    const data = getCurrentData();
    if (!data) return;

    Object.values(data).forEach(cat => {
      const catBox = document.createElement('div');
      catBox.className = 'space-y-2';

      const catHeader = document.createElement('div');
      catHeader.className = 'flex items-center justify-between';

      const allRowsInCatSelected = cat.rows.every(r => state.selectedRows.has(r.id));
      const someRowsSelected = cat.rows.some(r => state.selectedRows.has(r.id));

      const accentColor = state.kanaType === 'katakana' ? 'indigo' : 'sakura';

      catHeader.innerHTML = `
        <div class="flex items-center gap-2">
          <button data-cat-toggle="${cat.id}" class="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-sakura-600 dark:hover:text-sakura-400 flex items-center gap-1.5 transition-colors">
            <span class="w-2 h-2 rounded-full ${allRowsInCatSelected ? 'bg-sakura-500' : (someRowsSelected ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-600')}"></span>
            <span>${cat.name}</span>
          </button>
          <span class="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">(${cat.description})</span>
        </div>
        <button data-cat-select-all="${cat.id}" class="text-[11px] font-semibold text-slate-500 hover:text-sakura-600 dark:text-slate-400 dark:hover:text-sakura-400">
          ${allRowsInCatSelected ? 'Bỏ chọn nhóm' : 'Chọn cả nhóm'}
        </button>
      `;

      // Rows Pills
      const pillsContainer = document.createElement('div');
      pillsContainer.className = 'flex flex-wrap gap-1.5';

      cat.rows.forEach(row => {
        const isSelected = state.selectedRows.has(row.id);
        const pill = document.createElement('button');
        pill.dataset.rowId = row.id;
        pill.className = `text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${isSelected
          ? 'bg-sakura-500 text-white shadow-sm shadow-sakura-500/20'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`;

        const previewKana = row.items.filter(i => i.kana).map(i => i.kana).slice(0, 2).join('');
        pill.innerHTML = `
          <span>${row.name}</span>
          <span class="text-[10px] opacity-75 font-jp">(${previewKana}...)</span>
        `;

        pill.addEventListener('click', () => {
          if (state.selectedRows.has(row.id)) {
            if (state.selectedRows.size > 1) {
              state.selectedRows.delete(row.id);
            }
          } else {
            state.selectedRows.add(row.id);
          }
          refreshAll();
        });

        pillsContainer.appendChild(pill);
      });

      catBox.appendChild(catHeader);
      catBox.appendChild(pillsContainer);
      container.appendChild(catBox);

      // Event listener for category header buttons
      catHeader.querySelector(`[data-cat-toggle="${cat.id}"]`).addEventListener('click', () => {
        toggleCategoryRows(cat);
      });
      catHeader.querySelector(`[data-cat-select-all="${cat.id}"]`).addEventListener('click', () => {
        toggleCategoryRows(cat);
      });
    });
  }

  function toggleCategoryRows(cat) {
    const allSelected = cat.rows.every(r => state.selectedRows.has(r.id));
    if (allSelected) {
      const countRemaining = Array.from(state.selectedRows).filter(id => !cat.rows.some(r => r.id === id)).length;
      if (countRemaining > 0) {
        cat.rows.forEach(r => state.selectedRows.delete(r.id));
      }
    } else {
      cat.rows.forEach(r => state.selectedRows.add(r.id));
    }
    refreshAll();
  }

  function bindFilterButtons() {
    document.getElementById('btn-select-all').addEventListener('click', () => {
      const data = getCurrentData();
      Object.values(data).forEach(cat => {
        cat.rows.forEach(r => state.selectedRows.add(r.id));
      });
      refreshAll();
    });

    document.getElementById('btn-select-basic').addEventListener('click', () => {
      state.selectedRows.clear();
      const data = getCurrentData();
      data.basic.rows.forEach(r => state.selectedRows.add(r.id));
      refreshAll();
    });

    document.getElementById('btn-select-none').addEventListener('click', () => {
      state.selectedRows.clear();
      const data = getCurrentData();
      state.selectedRows.add(data.basic.rows[0].id);
      refreshAll();
    });
  }

  // --- MODE TABS & HEADER ---
  function bindModeTabs() {
    const tabs = document.querySelectorAll('.mode-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        if (state.currentTab === tabId) return;

        state.currentTab = tabId;

        // Update tab styling
        tabs.forEach(t => {
          const isCurrent = t.dataset.tab === tabId;
          if (isCurrent) {
            t.className = 'mode-tab-btn py-2 sm:py-3 px-2 sm:px-3 rounded-xl text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 transition-all border border-sakura-500 bg-sakura-50/50 dark:bg-sakura-950/20 dark:border-sakura-600 shadow-sm';
            t.querySelector('.font-bold').classList.add('text-sakura-700', 'dark:text-sakura-300');
          } else {
            t.className = 'mode-tab-btn py-2 sm:py-3 px-2 sm:px-3 rounded-xl text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 transition-all border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50';
            t.querySelector('.font-bold').classList.remove('text-sakura-700', 'dark:text-sakura-300');
          }
        });

        // Show/hide Character Palette in Mode 3
        const paletteSection = document.getElementById('character-palette-section');
        if (state.currentTab === 'fill-hiragana') {
          paletteSection.classList.remove('hidden');
        } else {
          paletteSection.classList.add('hidden');
        }

        resetBoardState();
        renderMatrix();
        if (state.currentTab === 'fill-hiragana') {
          renderPalette();
        }
        updateStats();
        if (window.lucide) lucide.createIcons();
      });
    });
  }

  function bindHeaderEvents() {
    const btnZen = document.getElementById('btn-mode-zen');
    const btnTest = document.getElementById('btn-mode-test');
    const timerBadge = document.getElementById('timer-badge');
    const btnSubmit = document.getElementById('btn-submit-test');

    btnZen.addEventListener('click', () => {
      if (state.evalMode === 'zen') return;
      state.evalMode = 'zen';
      btnZen.className = 'px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white';
      btnTest.className = 'px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
      timerBadge.classList.add('hidden');
      timerBadge.classList.remove('flex');
      btnSubmit.classList.add('hidden');
      stopTimer();
      resetBoardState();
      renderMatrix();
      if (state.currentTab === 'fill-hiragana') renderPalette();
      updateStats();
      if (window.lucide) lucide.createIcons();
    });

    btnTest.addEventListener('click', () => {
      if (state.evalMode === 'test') return;
      state.evalMode = 'test';
      btnTest.className = 'px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white';
      btnZen.className = 'px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
      if (state.currentTab !== 'study') {
        timerBadge.classList.remove('hidden');
        timerBadge.classList.add('flex');
        btnSubmit.classList.remove('hidden');
        startTimer();
      }
      resetBoardState();
      renderMatrix();
      if (state.currentTab === 'fill-hiragana') renderPalette();
      updateStats();
      if (window.lucide) lucide.createIcons();
    });
  }

  function bindActionButtons() {
    const btnShuffleBoard = document.getElementById('btn-toggle-shuffle');
    const shuffleBtnText = document.getElementById('shuffle-btn-text');

    if (btnShuffleBoard) {
      btnShuffleBoard.addEventListener('click', () => {
        state.isShuffled = !state.isShuffled;
        state.shuffledItems = null;

        if (state.isShuffled) {
          btnShuffleBoard.className = 'text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-indigo-600 text-white border border-indigo-600 shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all';
          if (shuffleBtnText) shuffleBtnText.textContent = 'Đang trộn ngẫu nhiên 🎲';
        } else {
          btnShuffleBoard.className = 'text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm transition-all';
          if (shuffleBtnText) shuffleBtnText.textContent = 'Trộn ngẫu nhiên';
        }

        resetBoardState();
        if (state.evalMode === 'test' && state.currentTab !== 'study') {
          startTimer();
        }
        renderMatrix();
        if (state.currentTab === 'fill-hiragana') renderPalette();
        updateStats();
        if (window.lucide) lucide.createIcons();
      });
    }

    document.getElementById('btn-reset-board').addEventListener('click', () => {
      resetBoardState();
      if (state.isShuffled) {
        state.shuffledItems = null;
      }
      if (state.evalMode === 'test' && state.currentTab !== 'study') {
        startTimer();
      }
      renderMatrix();
      if (state.currentTab === 'fill-hiragana') renderPalette();
      updateStats();
      if (window.lucide) lucide.createIcons();
    });

    document.getElementById('btn-submit-test').addEventListener('click', () => {
      evaluateAllAnswers(true);
    });

    document.getElementById('btn-shuffle-palette').addEventListener('click', () => {
      renderPalette(true);
    });
  }

  function bindModalButtons() {
    document.getElementById('btn-modal-close').addEventListener('click', () => {
      document.getElementById('results-modal').classList.add('hidden');
      document.getElementById('results-modal').classList.remove('flex');
    });

    document.getElementById('btn-modal-retry').addEventListener('click', () => {
      document.getElementById('results-modal').classList.add('hidden');
      document.getElementById('results-modal').classList.remove('flex');
      resetBoardState();
      if (state.isShuffled) {
        state.shuffledItems = null;
      }
      if (state.evalMode === 'test' && state.currentTab !== 'study') {
        startTimer();
      }
      renderMatrix();
      if (state.currentTab === 'fill-hiragana') renderPalette();
      updateStats();
      if (window.lucide) lucide.createIcons();
    });
  }

  // --- TIMER LOGIC ---
  function startTimer() {
    stopTimer();
    state.timerSeconds = 0;
    state.isTimerRunning = true;
    updateTimerDisplay();
    state.timerInterval = setInterval(() => {
      state.timerSeconds++;
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    state.isTimerRunning = false;
  }

  function updateTimerDisplay() {
    const mins = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
    const secs = (state.timerSeconds % 60).toString().padStart(2, '0');
    const el = document.getElementById('timer-display');
    if (el) el.textContent = `${mins}:${secs}`;
  }

  // --- MATRIX DATA HELPERS ---
  function getSelectedRowsData() {
    const rows = [];
    const data = getCurrentData();
    if (!data) return rows;

    Object.values(data).forEach(cat => {
      cat.rows.forEach(r => {
        if (state.selectedRows.has(r.id)) {
          rows.push({
            ...r,
            categoryName: cat.name,
            categoryId: cat.id
          });
        }
      });
    });
    return rows;
  }

  function getAllValidItems() {
    const items = [];
    getSelectedRowsData().forEach(row => {
      row.items.forEach((item, colIdx) => {
        if (item.kana) {
          items.push({
            ...item,
            rowId: row.id,
            colIdx: colIdx,
            key: `${row.id}_${colIdx}`,
            rowName: row.name
          });
        }
      });
    });
    return items;
  }

  function resetBoardState() {
    state.userAnswers = {};
    state.activeSlotKey = null;
    state.revealedHints.clear();
    state.isSubmitted = false;
  }

  function refreshAll() {
    state.shuffledItems = null;
    state.revealedHints.clear();
    renderFilterCategories();
    renderMatrix();
    if (state.currentTab === 'fill-hiragana') {
      renderPalette();
    }
    updateStats();
    if (window.lucide) lucide.createIcons();
  }

  // --- RENDER MATRIX BOARD ---
  function renderMatrix() {
    const container = document.getElementById('matrix-board-container');
    container.innerHTML = '';

    const validItems = getAllValidItems();

    // --- CHẾ ĐỘ TRỘN NGẪU NHIÊN (SHUFFLE MODE) ---
    if (state.isShuffled) {
      if (!state.shuffledItems || state.shuffledItems.length !== validItems.length) {
        state.shuffledItems = [...validItems].sort(() => Math.random() - 0.5);
      }

      const groupSection = document.createElement('section');
      groupSection.className = 'space-y-3 animate-fade-in';

      const header = document.createElement('div');
      header.className = 'flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-1.5';
      header.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
          <h3 class="font-bold text-sm text-slate-800 dark:text-slate-200">Ma Trận Xáo Trộn Ngẫu Nhiên (${state.shuffledItems.length} chữ)</h3>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">💡 Bấm vào chữ để xem/ẩn đáp án</span>
          <span class="text-[11px] text-indigo-500 font-semibold font-mono hidden sm:inline">Random Mode</span>
        </div>
      `;
      groupSection.appendChild(header);

      const rowsList = document.createElement('div');
      rowsList.className = 'space-y-2.5';

      const chunkSize = 5;
      for (let i = 0; i < state.shuffledItems.length; i += chunkSize) {
        const chunk = state.shuffledItems.slice(i, i + chunkSize);
        const rowIdx = Math.floor(i / chunkSize);

        const rowEl = document.createElement('div');
        rowEl.className = 'bg-white dark:bg-slate-900/90 rounded-2xl p-2 sm:p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-row items-center gap-2 sm:gap-4';

        const labelCol = document.createElement('div');
        labelCol.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800';
        labelCol.textContent = `#${rowIdx + 1}`;
        labelCol.title = `Hàng ngẫu nhiên số ${rowIdx + 1}`;
        rowEl.appendChild(labelCol);

        const cellsGrid = document.createElement('div');
        cellsGrid.className = `grid gap-1.5 sm:gap-3 flex-1 w-full`;
        cellsGrid.style.display = 'grid';
        cellsGrid.style.gridTemplateColumns = `repeat(5, minmax(0, 1fr))`;

        chunk.forEach(item => {
          const cellKey = item.key;
          let cellEl;
          if (state.currentTab === 'study') {
            cellEl = createStudyCell(item);
          } else if (state.currentTab === 'fill-romaji') {
            cellEl = createRomajiFillCell(item, cellKey);
          } else {
            cellEl = createHiraganaFillCell(item, cellKey);
          }
          cellsGrid.appendChild(cellEl);
        });

        if (chunk.length < 5) {
          for (let fill = 0; fill < 5 - chunk.length; fill++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'h-16 sm:h-24 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-center opacity-30';
            emptyCell.innerHTML = '<span class="text-xs text-slate-400 font-mono">-</span>';
            cellsGrid.appendChild(emptyCell);
          }
        }

        rowEl.appendChild(cellsGrid);
        rowsList.appendChild(rowEl);
      }

      groupSection.appendChild(rowsList);
      container.appendChild(groupSection);

      if (state.currentTab === 'fill-hiragana' && !state.activeSlotKey) {
        const firstItem = state.shuffledItems.find(i => !state.userAnswers[i.key]);
        if (firstItem) {
          state.activeSlotKey = firstItem.key;
          highlightActiveSlot();
        }
      }
      return;
    }

    // --- CHẾ ĐỘ THƯỜNG (THEO NHÓM BẢNG CHỮ CÁI) ---
    const selectedRows = getSelectedRowsData();

    const categoriesMap = new Map();
    selectedRows.forEach(row => {
      if (!categoriesMap.has(row.categoryId)) {
        categoriesMap.set(row.categoryId, {
          name: row.categoryName,
          rows: []
        });
      }
      categoriesMap.get(row.categoryId).rows.push(row);
    });

    categoriesMap.forEach((catGroup, catId) => {
      const groupSection = document.createElement('section');
      groupSection.className = 'space-y-3 animate-fade-in';

      const header = document.createElement('div');
      header.className = 'flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-1.5';
      header.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-sakura-500"></div>
          <h3 class="font-bold text-sm text-slate-800 dark:text-slate-200">${catGroup.name}</h3>
        </div>
        <span class="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">💡 Bấm vào chữ để xem/ẩn đáp án</span>
      `;
      groupSection.appendChild(header);

      const rowsList = document.createElement('div');
      rowsList.className = 'space-y-2.5';

      catGroup.rows.forEach((row, rowIdx) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'bg-white dark:bg-slate-900/90 rounded-2xl p-2 sm:p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-row items-center gap-2 sm:gap-4';

        if (state.currentTab === 'study') {
          const labelCol = document.createElement('div');
          labelCol.className = 'w-16 sm:w-36 shrink-0 flex flex-col items-start justify-center';
          labelCol.innerHTML = `
            <span class="font-bold text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 leading-tight">${row.name.split(' ')[1] || row.name}</span>
            <span class="text-[9px] text-slate-400 uppercase tracking-wider font-mono hidden sm:inline">Row: ${row.id}</span>
          `;
          rowEl.appendChild(labelCol);
        } else {
          const labelCol = document.createElement('div');
          labelCol.className = 'w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] sm:text-xs font-mono font-bold flex items-center justify-center shrink-0';
          labelCol.textContent = `#${rowIdx + 1}`;
          labelCol.title = `Hàng số ${rowIdx + 1}`;
          rowEl.appendChild(labelCol);
        }

        const isYoon = catId === 'yoon';
        const colsCount = isYoon ? 3 : 5;

        const cellsGrid = document.createElement('div');
        cellsGrid.className = `grid gap-1.5 sm:gap-3 flex-1 w-full`;
        cellsGrid.style.display = 'grid';
        cellsGrid.style.gridTemplateColumns = `repeat(${colsCount}, minmax(0, 1fr))`;

        row.items.forEach((item, colIdx) => {
          const cellKey = `${row.id}_${colIdx}`;

          if (!item.kana) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'h-16 sm:h-24 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-center opacity-40';
            emptyCell.innerHTML = '<span class="text-xs text-slate-400 font-mono">-</span>';
            cellsGrid.appendChild(emptyCell);
            return;
          }

          let cellEl;
          if (state.currentTab === 'study') {
            cellEl = createStudyCell(item);
          } else if (state.currentTab === 'fill-romaji') {
            cellEl = createRomajiFillCell(item, cellKey);
          } else {
            cellEl = createHiraganaFillCell(item, cellKey);
          }

          cellsGrid.appendChild(cellEl);
        });

        rowEl.appendChild(cellsGrid);
        rowsList.appendChild(rowEl);
      });

      groupSection.appendChild(rowsList);
      container.appendChild(groupSection);
    });

    if (state.currentTab === 'fill-hiragana' && !state.activeSlotKey) {
      const firstItem = getAllValidItems().find(i => !state.userAnswers[i.key]);
      if (firstItem) {
        state.activeSlotKey = firstItem.key;
        highlightActiveSlot();
      }
    }
  }

  // --- CELL BUILDERS ---

  // 1. Mode: Study Card
  function createStudyCell(item) {
    const card = document.createElement('div');
    card.className = 'h-16 sm:h-24 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-sakura-400 dark:hover:border-sakura-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-0.5 sm:gap-1 group cursor-pointer relative';
    card.title = `Bấm để nghe phát âm "${item.kana}" (${item.romaji})`;
    card.innerHTML = `
      <span class="font-jp font-bold text-lg sm:text-3xl text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform">${item.kana}</span>
      <span class="font-mono text-[10px] sm:text-xs font-semibold text-sakura-600 dark:text-sakura-400 bg-sakura-50 dark:bg-sakura-950/60 px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-md border border-sakura-100 dark:border-sakura-900">${item.romaji}</span>
    `;

    card.addEventListener('click', () => {
      speakKana(item.kana);
    });

    return card;
  }

  // 2. Mode: Kana to Romaji Fill
  function createRomajiFillCell(item, cellKey) {
    const card = document.createElement('div');
    const userAnswer = (state.userAnswers[cellKey] || '').toLowerCase().trim();
    const isCorrect = item.alternatives.includes(userAnswer);
    const hasAnswer = userAnswer.length > 0;
    const isHintRevealed = state.revealedHints.has(cellKey);

    let borderClass = isHintRevealed ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200 dark:border-slate-700';
    let bgClass = isHintRevealed ? 'bg-amber-50/30 dark:bg-amber-950/10' : 'bg-slate-50/70 dark:bg-slate-800/40';

    if (state.evalMode === 'zen' && hasAnswer) {
      if (isCorrect) {
        borderClass = 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20';
      } else {
        borderClass = 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/40 dark:bg-rose-950/20';
      }
    } else if (state.isSubmitted) {
      if (isCorrect) {
        borderClass = 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20';
      } else {
        borderClass = 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/60 dark:bg-rose-950/30';
      }
    }

    card.className = `h-16 sm:h-24 rounded-xl border ${borderClass} ${bgClass} transition-all flex flex-col items-center justify-between p-1 sm:p-2 group focus-within:ring-2 focus-within:ring-sakura-500 focus-within:border-sakura-500 relative`;

    const topArea = document.createElement('div');
    topArea.className = 'w-full flex items-center justify-center gap-1 cursor-pointer select-none hover:scale-105 transition-transform';
    topArea.title = isHintRevealed ? 'Bấm để ẩn đáp án' : 'Bấm để xem đáp án & nghe phát âm';

    const kanaSpan = document.createElement('span');
    kanaSpan.className = 'font-jp font-bold text-base sm:text-2xl text-slate-800 dark:text-slate-100 leading-none';
    kanaSpan.textContent = item.kana;
    topArea.appendChild(kanaSpan);

    if (isHintRevealed) {
      const hintTag = document.createElement('span');
      hintTag.className = 'hint-tag text-[9px] sm:text-[11px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-700 animate-pop';
      hintTag.textContent = `💡${item.romaji}`;
      topArea.appendChild(hintTag);
    }

    topArea.addEventListener('click', (e) => {
      e.stopPropagation();
      speakKana(item.kana);

      const isRevealed = state.revealedHints.has(cellKey);
      if (isRevealed) {
        state.revealedHints.delete(cellKey);
        card.classList.remove('border-amber-400', 'ring-2', 'ring-amber-400/20', 'bg-amber-50/30', 'dark:bg-amber-950/10');
        topArea.title = 'Bấm để xem đáp án & nghe phát âm';
        const existingHint = topArea.querySelector('.hint-tag');
        if (existingHint) existingHint.remove();
      } else {
        state.revealedHints.add(cellKey);
        card.classList.add('border-amber-400', 'ring-2', 'ring-amber-400/20', 'bg-amber-50/30', 'dark:bg-amber-950/10');
        topArea.title = 'Bấm để ẩn đáp án';
        if (!topArea.querySelector('.hint-tag')) {
          const hintTag = document.createElement('span');
          hintTag.className = 'hint-tag text-[9px] sm:text-[11px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-700 animate-pop';
          hintTag.textContent = `💡${item.romaji}`;
          topArea.appendChild(hintTag);
        }
      }
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.dataset.cellKey = cellKey;
    input.value = state.userAnswers[cellKey] || '';
    input.placeholder = '?';
    input.autocomplete = 'off';
    input.autocapitalize = 'off';
    input.inputMode = 'text';
    input.enterKeyHint = 'next';
    input.spellcheck = false;
    input.className = 'w-full text-center font-mono font-bold text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md sm:rounded-lg py-0.5 sm:py-1 px-0.5 text-slate-900 dark:text-white focus:outline-none focus:border-sakura-500';

    input.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase().trim();
      state.userAnswers[cellKey] = val;

      if (state.evalMode === 'test' && !state.isTimerRunning && state.currentTab !== 'study') {
        startTimer();
      }

      const nowCorrect = item.alternatives.includes(val);
      if (state.evalMode === 'zen') {
        if (nowCorrect) {
          card.className = `h-16 sm:h-24 rounded-xl border border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 transition-all flex flex-col items-center justify-between p-1 sm:p-2 animate-pop relative`;
          speakKana(item.kana);
          focusNextInput(cellKey);
        } else {
          card.className = `h-16 sm:h-24 rounded-xl border ${val.length > 0 ? 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/40 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40'} transition-all flex flex-col items-center justify-between p-1 sm:p-2 relative`;
        }
      }

      updateStats();
      checkAllCompletedZen();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        focusNextInput(cellKey);
      } else if (e.key === 'ArrowRight') {
        focusNextInput(cellKey);
      } else if (e.key === 'ArrowLeft') {
        focusPrevInput(cellKey);
      } else if (e.key === 'Backspace' && input.value === '') {
        focusPrevInput(cellKey);
      }
    });

    card.appendChild(topArea);
    card.appendChild(input);

    return card;
  }

  // 3. Mode: Romaji to Kana Fill
  function createHiraganaFillCell(item, cellKey) {
    const card = document.createElement('div');
    const placedKana = state.userAnswers[cellKey];
    const isCorrect = placedKana === item.kana;
    const isSlotActive = state.activeSlotKey === cellKey;
    const isHintRevealed = state.revealedHints.has(cellKey);

    let borderClass = isSlotActive ? 'border-indigo-500 ring-2 ring-indigo-500/30' : (isHintRevealed ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200 dark:border-slate-700');
    let bgClass = isSlotActive ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : (isHintRevealed ? 'bg-amber-50/30 dark:bg-amber-950/10' : 'bg-slate-50/70 dark:bg-slate-800/40');

    if (placedKana) {
      if (state.evalMode === 'zen') {
        if (isCorrect) {
          borderClass = 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20';
        } else {
          borderClass = 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/40 dark:bg-rose-950/20';
        }
      } else if (state.isSubmitted) {
        if (isCorrect) {
          borderClass = 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20';
        } else {
          borderClass = 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/60 dark:bg-rose-950/30';
        }
      }
    }

    card.className = `h-16 sm:h-24 rounded-xl border ${borderClass} ${bgClass} transition-all flex flex-col items-center justify-between p-1 sm:p-2 cursor-pointer hover:border-indigo-400 relative group`;
    card.dataset.slotKey = cellKey;

    const romajiTag = document.createElement('button');
    romajiTag.className = `font-mono text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded transition-all flex items-center gap-1 ${isHintRevealed
      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
      : 'bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
      }`;
    romajiTag.title = isHintRevealed ? 'Bấm để ẩn đáp án' : 'Bấm để xem đáp án & nghe phát âm';
    romajiTag.innerHTML = `
      <span>${item.romaji}</span>
      ${isHintRevealed ? `<span class="hint-tag font-jp text-[11px] text-amber-600 dark:text-amber-400 font-black animate-pop">💡${item.kana}</span>` : ''}
    `;

    romajiTag.addEventListener('click', (e) => {
      e.stopPropagation();
      speakKana(item.kana);

      const isRevealed = state.revealedHints.has(cellKey);
      if (isRevealed) {
        state.revealedHints.delete(cellKey);
        card.classList.remove('border-amber-400', 'ring-2', 'ring-amber-400/20', 'bg-amber-50/30', 'dark:bg-amber-950/10');
        romajiTag.className = 'font-mono text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded transition-all flex items-center gap-1 bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600';
        romajiTag.title = 'Bấm để xem đáp án & nghe phát âm';
        const existingHint = romajiTag.querySelector('.hint-tag');
        if (existingHint) existingHint.remove();
      } else {
        state.revealedHints.add(cellKey);
        card.classList.add('border-amber-400', 'ring-2', 'ring-amber-400/20', 'bg-amber-50/30', 'dark:bg-amber-950/10');
        romajiTag.className = 'font-mono text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded transition-all flex items-center gap-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700';
        romajiTag.title = 'Bấm để ẩn đáp án';
        if (!romajiTag.querySelector('.hint-tag')) {
          const hintTag = document.createElement('span');
          hintTag.className = 'hint-tag font-jp text-[11px] text-amber-600 dark:text-amber-400 font-black animate-pop';
          hintTag.textContent = `💡${item.kana}`;
          romajiTag.appendChild(hintTag);
        }
      }
    });

    const slotBody = document.createElement('div');
    slotBody.className = 'flex-1 flex items-center justify-center w-full';

    if (placedKana) {
      const kanaSpan = document.createElement('span');
      kanaSpan.className = 'font-jp font-bold text-lg sm:text-3xl text-indigo-700 dark:text-indigo-300 animate-pop';
      kanaSpan.textContent = placedKana;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center text-[10px] opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity';
      removeBtn.innerHTML = '×';
      removeBtn.title = 'Bỏ chữ này ra';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        delete state.userAnswers[cellKey];
        state.activeSlotKey = cellKey;
        renderMatrix();
        renderPalette();
        updateStats();
      });

      slotBody.appendChild(kanaSpan);
      card.appendChild(romajiTag);
      card.appendChild(slotBody);
      card.appendChild(removeBtn);
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = 'text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium';
      placeholder.textContent = isSlotActive ? '👈 Chọn' : '+';
      slotBody.appendChild(placeholder);
      card.appendChild(romajiTag);
      card.appendChild(slotBody);
    }

    card.addEventListener('click', () => {
      if (placedKana) {
        speakKana(placedKana);
      }
      state.activeSlotKey = cellKey;
      highlightActiveSlot();
    });

    return card;
  }

  function highlightActiveSlot() {
    document.querySelectorAll('[data-slot-key]').forEach(el => {
      const key = el.dataset.slotKey;
      const isSlotActive = state.activeSlotKey === key;
      if (isSlotActive) {
        el.classList.add('border-indigo-500', 'ring-2', 'ring-indigo-500/30', 'bg-indigo-50/50');
      } else {
        el.classList.remove('border-indigo-500', 'ring-2', 'ring-indigo-500/30', 'bg-indigo-50/50');
      }
    });
  }

  // --- RENDER CHARACTER PALETTE (Mode 3) ---
  function renderPalette(shuffle = false) {
    const container = document.getElementById('palette-cards-container');
    if (!container) return;
    container.innerHTML = '';

    const validItems = getAllValidItems();

    const placedCounts = {};
    Object.values(state.userAnswers).forEach(k => {
      placedCounts[k] = (placedCounts[k] || 0) + 1;
    });

    let kanaList = validItems.map(i => i.kana);
    if (shuffle) {
      kanaList.sort(() => Math.random() - 0.5);
    }

    const uniqueKana = Array.from(new Set(kanaList));

    uniqueKana.forEach(kana => {
      const totalNeeded = validItems.filter(i => i.kana === kana).length;
      const used = placedCounts[kana] || 0;
      const available = totalNeeded - used;

      const btn = document.createElement('button');
      btn.className = `w-9 h-9 sm:w-12 sm:h-12 rounded-xl font-jp font-bold text-base sm:text-xl flex items-center justify-center transition-all relative shrink-0 ${available > 0
        ? 'bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 hover:border-indigo-500 hover:scale-105 active:scale-95 shadow-sm'
        : 'bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
        }`;
      btn.textContent = kana;

      if (totalNeeded > 1) {
        const badge = document.createElement('span');
        badge.className = 'absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-indigo-500 text-white text-[8px] sm:text-[9px] font-bold rounded-full flex items-center justify-center';
        badge.textContent = available;
        btn.appendChild(badge);
      }

      if (available > 0) {
        btn.addEventListener('click', () => {
          placeKanaIntoSlot(kana);
        });
      }

      container.appendChild(btn);
    });
  }

  function placeKanaIntoSlot(kana) {
    const validItems = getAllValidItems();
    speakKana(kana);

    let targetKey = state.activeSlotKey;
    if (!targetKey || state.userAnswers[targetKey]) {
      const firstEmpty = validItems.find(i => !state.userAnswers[i.key]);
      if (firstEmpty) {
        targetKey = firstEmpty.key;
      }
    }

    if (targetKey) {
      state.userAnswers[targetKey] = kana;

      const currentIndex = validItems.findIndex(i => i.key === targetKey);
      const remainingItems = validItems.slice(currentIndex + 1).concat(validItems.slice(0, currentIndex));
      const nextEmpty = remainingItems.find(i => !state.userAnswers[i.key]);

      state.activeSlotKey = nextEmpty ? nextEmpty.key : null;

      renderMatrix();
      renderPalette();
      updateStats();
      checkAllCompletedZen();
    }
  }

  // --- KEYBOARD NAVIGATION HELPERS ---
  function focusNextInput(currentKey) {
    const inputs = Array.from(document.querySelectorAll('input[data-cell-key]'));
    const currentIdx = inputs.findIndex(i => i.dataset.cellKey === currentKey);
    if (currentIdx !== -1 && currentIdx < inputs.length - 1) {
      inputs[currentIdx + 1].focus();
      inputs[currentIdx + 1].select();
    }
  }

  function focusPrevInput(currentKey) {
    const inputs = Array.from(document.querySelectorAll('input[data-cell-key]'));
    const currentIdx = inputs.findIndex(i => i.dataset.cellKey === currentKey);
    if (currentIdx > 0) {
      inputs[currentIdx - 1].focus();
      inputs[currentIdx - 1].select();
    }
  }

  // --- STATS & EVALUATION ---
  function updateStats() {
    const validItems = getAllValidItems();
    const total = validItems.length;

    let filled = 0;
    let correct = 0;

    validItems.forEach(item => {
      const userAns = state.userAnswers[item.key];
      if (userAns !== undefined && userAns !== '') {
        filled++;
        if (state.currentTab === 'fill-romaji') {
          if (item.alternatives.includes(userAns.toLowerCase().trim())) {
            correct++;
          }
        } else {
          if (userAns === item.kana) {
            correct++;
          }
        }
      }
    });

    const progressPct = total > 0 ? Math.round((filled / total) * 100) : 0;
    const accuracyPct = filled > 0 ? Math.round((correct / filled) * 100) : 0;

    const bar = document.getElementById('stat-progress-bar');
    const txtProgress = document.getElementById('stat-progress-text');
    const txtAccuracy = document.getElementById('stat-accuracy-text');

    if (bar) bar.style.width = `${progressPct}%`;
    if (txtProgress) txtProgress.textContent = `${filled}/${total}`;
    if (txtAccuracy) txtAccuracy.textContent = `${accuracyPct}%`;

    const countBadge = document.getElementById('selected-count-badge');
    if (countBadge) countBadge.textContent = `Đang chọn: ${total} chữ`;
  }

  function checkAllCompletedZen() {
    if (state.evalMode !== 'zen' || state.currentTab === 'study') return;
    const validItems = getAllValidItems();
    if (validItems.length === 0) return;

    const allCorrect = validItems.every(item => {
      const userAns = state.userAnswers[item.key];
      if (!userAns) return false;
      if (state.currentTab === 'fill-romaji') {
        return item.alternatives.includes(userAns.toLowerCase().trim());
      }
      return userAns === item.kana;
    });

    if (allCorrect) {
      setTimeout(() => {
        evaluateAllAnswers(false);
      }, 400);
    }
  }

  function evaluateAllAnswers(showModal = true) {
    state.isSubmitted = true;
    stopTimer();

    const validItems = getAllValidItems();
    const total = validItems.length;
    let correct = 0;

    validItems.forEach(item => {
      const userAns = state.userAnswers[item.key];
      if (userAns) {
        if (state.currentTab === 'fill-romaji') {
          if (item.alternatives.includes(userAns.toLowerCase().trim())) correct++;
        } else {
          if (userAns === item.kana) correct++;
        }
      }
    });

    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const mins = Math.floor(state.timerSeconds / 60);
    const secs = state.timerSeconds % 60;
    const timeStr = `${mins > 0 ? mins + 'm ' : ''}${secs}s`;

    const modal = document.getElementById('results-modal');
    if (!modal) return;

    document.getElementById('modal-score-accuracy').textContent = `${accuracy}%`;
    document.getElementById('modal-score-count').textContent = `${correct}/${total}`;
    document.getElementById('modal-score-time').textContent = timeStr;

    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');

    if (accuracy === 100) {
      titleEl.textContent = '🎉 Xuất Sắc! Hoàn Thành 100%';
      msgEl.textContent = 'Bạn đã ghi nhớ hoàn hảo tất cả các chữ trong phạm vi vừa chọn!';
    } else if (accuracy >= 80) {
      titleEl.textContent = '👏 Rất Tốt!';
      msgEl.textContent = `Bạn đạt ${accuracy}% độ chính xác. Hãy ôn lại những chữ chưa thuộc nhé!`;
    } else {
      titleEl.textContent = '💪 Cố Lên Nhé!';
      msgEl.textContent = `Bạn đã hoàn thành bài tập với ${correct}/${total} chữ đúng. Luyện tập thêm để nhớ lâu hơn!`;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    renderMatrix();
    if (state.currentTab === 'fill-hiragana') renderPalette();
    updateStats();
    if (window.lucide) lucide.createIcons();
  }

  // --- BOOTSTRAP ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
