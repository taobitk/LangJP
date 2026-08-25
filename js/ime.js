/**
 * Lightweight Japanese Romaji-to-Kana & IME Engine
 * Converts QWERTY keystrokes to Hiragana & Katakana in real-time
 */

const JapaneseIME = (function () {
  'use strict';

  const ROMAJI_TO_HIRAGANA = {
    'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
    'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ', 'sya': 'しゃ', 'syu': 'しゅ', 'syo': 'しょ',
    'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ', 'tya': 'ちゃ', 'tyu': 'ちゅ', 'tyo': 'ちょ',
    'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
    'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
    'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
    'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
    'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
    'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ', 'jya': 'じゃ', 'jyu': 'じゅ', 'jyo': 'じょ', 'zya': 'じゃ', 'zyu': 'じゅ', 'zyo': 'じょ',
    'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
    'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
    'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
    'sa': 'さ', 'shi': 'し', 'si': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
    'ta': 'た', 'chi': 'ち', 'ti': 'ち', 'tsu': 'つ', 'tu': 'つ', 'te': 'て', 'to': 'と',
    'na': 'な', 'ni': 'ni', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
    'ha': 'は', 'hi': 'hi', 'fu': 'ふ', 'hu': 'ふ', 'he': 'へ', 'ho': 'ほ',
    'ma': 'ま', 'mi': 'mi', 'mu': 'む', 'me': 'め', 'mo': 'mo',
    'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
    'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
    'wa': 'わ', 'wo': 'を', 'nn': 'ん', "n'": 'ん',
    'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
    'za': 'ざ', 'ji': 'じ', 'zi': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
    'da': 'だ', 'dji': 'ぢ', 'di': 'ぢ', 'dzu': 'づ', 'du': 'づ', 'de': 'de', 'do': 'do',
    'ba': 'ば', 'bi': 'bi', 'bu': 'bu', 'be': 'be', 'bo': 'bo',
    'pa': 'ぱ', 'pi': 'pi', 'pu': 'pu', 'pe': 'pe', 'po': 'po',
    'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
    '-': 'ー'
  };

  const HIRAGANA_TO_KATAKANA = {
    'あ': 'ア', 'い': 'イ', 'う': 'ウ', 'え': 'エ', 'お': 'オ',
    'か': 'カ', 'き': 'キ', 'く': 'ク', 'け': 'ケ', 'こ': 'コ',
    'さ': 'サ', 'し': 'シ', 'す': 'ス', 'せ': 'セ', 'そ': 'ソ',
    'た': 'タ', 'ち': 'チ', 'つ': 'ツ', 'て': 'テ', 'と': 'ト',
    'な': 'ナ', 'に': 'ニ', 'ぬ': 'ヌ', 'ね': 'ネ', 'の': 'ノ',
    'は': 'ハ', 'ひ': 'ヒ', 'ふ': 'フ', 'へ': 'ヘ', 'ほ': 'ホ',
    'ま': 'マ', 'み': 'ミ', 'む': 'ム', 'め': 'メ', 'も': 'モ',
    'や': 'ヤ', 'ゆ': 'ユ', 'よ': 'ヨ',
    'ら': 'ラ', 'り': 'リ', 'る': 'ル', 'れ': 'レ', 'ろ': 'ロ',
    'わ': 'ワ', 'を': 'ヲ', 'ん': 'ン',
    'が': 'ガ', 'ぎ': 'ギ', 'ぐ': 'グ', 'げ': 'ゲ', 'ご': 'ゴ',
    'ざ': 'ザ', 'じ': 'ジ', 'ず': 'ズ', 'ぜ': 'ゼ', 'ぞ': 'ゾ',
    'だ': 'ダ', 'ぢ': 'ヂ', 'づ': 'ヅ', 'で': 'デ', 'ど': 'ド',
    'ば': 'バ', 'び': 'ビ', 'ぶ': 'ブ', 'べ': 'ベ', 'ぼ': 'ボ',
    'ぱ': 'パ', 'ぴ': 'ピ', 'ぷ': 'プ', 'ぺ': 'ペ', 'ぽ': 'ポ',
    'きゃ': 'キャ', 'きゅ': 'キュ', 'きょ': 'キョ',
    'しゃ': 'シャ', 'しゅ': 'シュ', 'しょ': 'ショ',
    'ちゃ': 'チャ', 'ちゅ': 'チュ', 'ちょ': 'チョ',
    'にゃ': 'ニャ', 'にゅ': 'ニュ', 'にょ': 'ニョ',
    'ひゃ': 'ヒャ', 'ひゅ': 'ヒュ', 'ひょ': 'ヒョ',
    'みゃ': 'ミャ', 'みゅ': 'ミュ', 'みょ': 'ミョ',
    'りゃ': 'リャ', 'りゅ': 'リュ', 'りょ': 'リョ',
    'ぎゃ': 'ギャ', 'ぎゅ': 'ギュ', 'ぎょ': 'ギョ',
    'じゃ': 'ジャ', 'じゅ': 'ジュ', 'じょ': 'ジョ',
    'びゃ': 'ビャ', 'びゅ': 'ビュ', 'びょ': 'ビョ',
    'ぴゃ': 'ピャ', 'ぴゅ': 'ピュ', 'ぴょ': 'ピョ',
    'っ': 'ッ', 'ー': 'ー'
  };

  /**
   * Convert Romaji string to Hiragana in real-time
   */
  function toHiragana(input) {
    if (!input) return '';
    let text = input.toLowerCase();
    let result = '';
    let i = 0;

    while (i < text.length) {
      // Check 4-char, 3-char, 2-char, 1-char matches
      let matched = false;

      // Handle double consonants for sokuon (っ)
      if (i + 1 < text.length && text[i] === text[i + 1] && /[b-df-hj-np-tv-z]/.test(text[i]) && text[i] !== 'n') {
        result += 'っ';
        i++;
        continue;
      }

      // Handle 'n' before consonant or at end if followed by space/consonant
      if (text[i] === 'n') {
        if (i + 1 === text.length && text.endsWith('nn')) {
          result += 'ん';
          i++;
          continue;
        } else if (i + 1 < text.length && !/[aeiouy]/.test(text[i + 1])) {
          result += 'ん';
          i++;
          continue;
        }
      }

      for (let len = 4; len >= 1; len--) {
        const chunk = text.substr(i, len);
        if (ROMAJI_TO_HIRAGANA[chunk]) {
          result += ROMAJI_TO_HIRAGANA[chunk];
          i += len;
          matched = true;
          break;
        }
      }

      if (!matched) {
        result += text[i];
        i++;
      }
    }

    return result;
  }

  /**
   * Convert Hiragana string to Katakana
   */
  function toKatakana(hiraganaText) {
    let res = '';
    for (let char of hiraganaText) {
      res += HIRAGANA_TO_KATAKANA[char] || char;
    }
    return res;
  }

  /**
   * Bind an input element to automatically convert Romaji to Kana as user types
   */
  function bindAutoIME(inputElement, onConverted) {
    inputElement.addEventListener('input', (e) => {
      const start = inputElement.selectionStart;
      const original = inputElement.value;
      const converted = toHiragana(original);

      if (converted !== original) {
        inputElement.value = converted;
        // Keep cursor position
        inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
      }

      if (onConverted) {
        onConverted(inputElement.value);
      }
    });
  }

  return {
    toHiragana,
    toKatakana,
    bindAutoIME
  };
})();
