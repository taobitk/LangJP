/**
 * Lightweight Japanese Romaji-to-Kana & IME Engine
 * Converts QWERTY keystrokes to Hiragana & Katakana in real-time with proper IME buffering
 */

(function () {
  'use strict';

  const ROMAJI_TO_HIRAGANA = {
    // 3-character combos (Yoon)
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
    'tsu': 'つ', 'chi': 'ち', 'shi': 'し',

    // 2-character basic & dakuten
    'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
    'sa': 'さ', 'si': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
    'ta': 'た', 'ti': 'ち', 'tu': 'つ', 'te': 'て', 'to': 'と',
    'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
    'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'hu': 'ふ', 'he': 'へ', 'ho': 'ほ',
    'ma': 'ま', 'mi': 'mi', 'mu': 'む', 'me': 'め', 'mo': 'も',
    'mi': 'み',
    'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
    'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
    'wa': 'わ', 'wo': 'を',
    'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
    'za': 'ざ', 'ji': 'じ', 'zi': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
    'da': 'だ', 'dji': 'ぢ', 'di': 'ぢ', 'dzu': 'づ', 'du': 'づ', 'de': 'で', 'do': 'ど',
    'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
    'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',

    // 1-character vowels
    'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
    '-': 'ー'
  };

  const HIRAGANA_TO_KATAKANA = {
    'あ': 'ア', 'い': 'イ', 'う': 'ウ', 'え': 'エ', 'お': 'オ',
    'か': 'カ', 'き': 'キ', 'く': 'ク', 'け': 'ケ', 'こ': 'コ',
    'さ': 'サ', 'し': 'シ', 'す': 'ス', 'せ': 'セ', 'そ': 'ソ',
    'ta': 'タ', 'た': 'タ', 'ち': 'チ', 'つ': 'ツ', 'て': 'テ', 'と': 'ト',
    'na': 'ナ', 'な': 'ナ', 'に': 'ニ', 'ぬ': 'ヌ', 'ね': 'ネ', 'の': 'ノ',
    'は': 'ハ', 'ひ': 'ヒ', 'ふ': 'フ', 'へ': 'ヘ', 'ほ': 'ホ',
    'ま': 'マ', 'み': 'ミ', 'む': 'ム', 'め': 'メ', 'も': 'モ',
    'や': 'ヤ', 'ゆ': 'ユ', 'よ': 'ヨ',
    'ら': 'ラ', 'り': 'リ', 'る': 'ル', 'れ': 'レ', 'ろ': 'ロ',
    'わ': 'ワ', 'を': 'ヲ', 'ん': 'ン',
    'が': 'ガ', 'ぎ': 'ギ', 'ぐ': 'グ', 'ge': 'ゲ', 'げ': 'ゲ', 'ご': 'ゴ',
    'za': 'ザ', 'ざ': 'ザ', 'じ': 'ジ', 'ず': 'ズ', 'ぜ': 'ゼ', 'ぞ': 'ゾ',
    'da': 'ダ', 'だ': 'ダ', 'ぢ': 'ヂ', 'づ': 'ヅ', 'で': 'デ', 'ど': 'ド',
    'ba': 'バ', 'ば': 'バ', 'び': 'ビ', 'bu': 'ブ', 'ぶ': 'ブ', 'べ': 'ベ', 'bo': 'ボ', 'ぼ': 'ボ',
    'pa': 'パ', 'ぱ': 'パ', 'pi': 'ピ', 'ぴ': 'ピ', 'pu': 'プ', 'ぷ': 'プ', 'pe': 'ペ', 'ぺ': 'ペ', 'po': 'ポ', 'ぽ': 'ポ',
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
   * Preserves incomplete 'n' while waiting for subsequent vowels (e.g. 'ne' -> 'ね')
   */
  function toHiragana(input) {
    if (!input) return '';
    let text = input.toLowerCase();
    let result = '';
    let i = 0;

    while (i < text.length) {
      // 1. Handle double consonants for sokuon (っ) e.g. tt, kk, ss, pp, dd (excluding 'nn')
      if (i + 1 < text.length && text[i] === text[i + 1] && /[b-df-hj-mp-tv-z]/.test(text[i])) {
        result += 'っ';
        i++;
        continue;
      }

      // 2. Handle 'nn' -> 'ん' or "n'" -> 'ん'
      if (text[i] === 'n') {
        if (i + 1 < text.length && (text[i + 1] === 'n' || text[i + 1] === "'")) {
          result += 'ん';
          i += 2;
          continue;
        }
        // 'n' followed by any consonant except 'y' -> 'ん' (e.g. 'nki' -> 'んき' in 'denki')
        if (i + 1 < text.length && /[b-df-hj-mp-tv-z]/.test(text[i + 1])) {
          result += 'ん';
          i++;
          continue;
        }
        // If 'n' is followed by a vowel or 'y', let step 3 match combos like 'na', 'ni', 'nu', 'ne', 'no', 'nya'
      }

      // 3. Match combinations from 3 chars down to 1 char
      let matched = false;
      for (let len = 3; len >= 1; len--) {
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
    if (!hiraganaText) return '';
    let res = '';
    for (let char of hiraganaText) {
      res += HIRAGANA_TO_KATAKANA[char] || char;
    }
    return res;
  }

  /**
   * Finalize any trailing 'n' to 'ん' when input is finished / validated
   */
  function finalizeKana(text, isKatakana = false) {
    if (!text) return '';
    let converted = toHiragana(text);
    converted = converted.replace(/n$/i, 'ん');
    return isKatakana ? toKatakana(converted) : converted;
  }

  /**
   * Auto Convert Romaji to Kana (Hiragana or Katakana based on target)
   */
  function convertRomaji(input, isKatakana = false) {
    const hira = toHiragana(input);
    return isKatakana ? toKatakana(hira) : hira;
  }

  window.JapaneseIME = {
    toHiragana,
    toKatakana,
    finalizeKana,
    convertRomaji
  };
})();
