/**
 * Japanese Kana Syllabary Master Datasets (Hiragana & Katakana)
 * 46 Gojuon + 25 Dakuten/Handakuten + 33 Yoon Combinations
 */

const HIRAGANA_DATA = {
  basic: {
    id: "basic",
    name: "Bảng Cơ Bản (Gojuon - 46 chữ)",
    description: "Các nguyên âm và phụ âm cơ bản",
    rows: [
      {
        id: "a",
        name: "Hàng A (あ - お)",
        items: [
          { kana: "あ", romaji: "a", alternatives: ["a"] },
          { kana: "い", romaji: "i", alternatives: ["i"] },
          { kana: "う", romaji: "u", alternatives: ["u"] },
          { kana: "え", romaji: "e", alternatives: ["e"] },
          { kana: "お", romaji: "o", alternatives: ["o"] }
        ]
      },
      {
        id: "ka",
        name: "Hàng Ka (か - こ)",
        items: [
          { kana: "か", romaji: "ka", alternatives: ["ka"] },
          { kana: "き", romaji: "ki", alternatives: ["ki"] },
          { kana: "く", romaji: "ku", alternatives: ["ku"] },
          { kana: "け", romaji: "ke", alternatives: ["ke"] },
          { kana: "こ", romaji: "ko", alternatives: ["ko"] }
        ]
      },
      {
        id: "sa",
        name: "Hàng Sa (さ - そ)",
        items: [
          { kana: "さ", romaji: "sa", alternatives: ["sa"] },
          { kana: "し", romaji: "shi", alternatives: ["shi", "si"] },
          { kana: "す", romaji: "su", alternatives: ["su"] },
          { kana: "せ", romaji: "se", alternatives: ["se"] },
          { kana: "そ", romaji: "so", alternatives: ["so"] }
        ]
      },
      {
        id: "ta",
        name: "Hàng Ta (た - と)",
        items: [
          { kana: "た", romaji: "ta", alternatives: ["ta"] },
          { kana: "ち", romaji: "chi", alternatives: ["chi", "ti"] },
          { kana: "つ", romaji: "tsu", alternatives: ["tsu", "tu"] },
          { kana: "て", romaji: "te", alternatives: ["te"] },
          { kana: "to", romaji: "to", alternatives: ["to"] }
        ]
      },
      {
        id: "na",
        name: "Hàng Na (な - の)",
        items: [
          { kana: "な", romaji: "na", alternatives: ["na"] },
          { kana: "ni", romaji: "ni", alternatives: ["ni"] },
          { kana: "nu", romaji: "nu", alternatives: ["nu"] },
          { kana: "ne", romaji: "ne", alternatives: ["ne"] },
          { kana: "no", romaji: "no", alternatives: ["no"] }
        ]
      },
      {
        id: "ha",
        name: "Hàng Ha (は - ほ)",
        items: [
          { kana: "は", romaji: "ha", alternatives: ["ha"] },
          { kana: "ひ", romaji: "hi", alternatives: ["hi"] },
          { kana: "ふ", romaji: "fu", alternatives: ["fu", "hu"] },
          { kana: "へ", romaji: "he", alternatives: ["he"] },
          { kana: "ほ", romaji: "ho", alternatives: ["ho"] }
        ]
      },
      {
        id: "ma",
        name: "Hàng Ma (ま - も)",
        items: [
          { kana: "ま", romaji: "ma", alternatives: ["ma"] },
          { kana: "み", romaji: "mi", alternatives: ["mi"] },
          { kana: "む", romaji: "mu", alternatives: ["mu"] },
          { kana: "め", romaji: "me", alternatives: ["me"] },
          { kana: "も", romaji: "mo", alternatives: ["mo"] }
        ]
      },
      {
        id: "ya",
        name: "Hàng Ya (や - よ)",
        items: [
          { kana: "や", romaji: "ya", alternatives: ["ya"] },
          { kana: null, romaji: null },
          { kana: "ゆ", romaji: "yu", alternatives: ["yu"] },
          { kana: null, romaji: null },
          { kana: "よ", romaji: "yo", alternatives: ["yo"] }
        ]
      },
      {
        id: "ra",
        name: "Hàng Ra (ら - ろ)",
        items: [
          { kana: "ら", romaji: "ra", alternatives: ["ra"] },
          { kana: "り", romaji: "ri", alternatives: ["ri"] },
          { kana: "る", romaji: "ru", alternatives: ["ru"] },
          { kana: "れ", romaji: "re", alternatives: ["re"] },
          { kana: "ろ", romaji: "ro", alternatives: ["ro"] }
        ]
      },
      {
        id: "wa",
        name: "Hàng Wa - N (わ - ん)",
        items: [
          { kana: "わ", romaji: "wa", alternatives: ["wa"] },
          { kana: null, romaji: null },
          { kana: null, romaji: null },
          { kana: "を", romaji: "wo", alternatives: ["wo", "o"] },
          { kana: "ん", romaji: "n", alternatives: ["n", "nn"] }
        ]
      }
    ]
  },

  dakuten: {
    id: "dakuten",
    name: "Bảng Âm Đục / Bán Đục (Dakuten - 25 chữ)",
    description: "Thêm dấu Tenten (゛) hoặc Maru (゜)",
    rows: [
      {
        id: "ga",
        name: "Hàng Ga (が - ご)",
        items: [
          { kana: "が", romaji: "ga", alternatives: ["ga"] },
          { kana: "ぎ", romaji: "gi", alternatives: ["gi"] },
          { kana: "ぐ", romaji: "gu", alternatives: ["gu"] },
          { kana: "げ", romaji: "ge", alternatives: ["ge"] },
          { kana: "ご", romaji: "go", alternatives: ["go"] }
        ]
      },
      {
        id: "za",
        name: "Hàng Za (ざ - ぞ)",
        items: [
          { kana: "ざ", romaji: "za", alternatives: ["za"] },
          { kana: "じ", romaji: "ji", alternatives: ["ji", "zi"] },
          { kana: "ず", romaji: "zu", alternatives: ["zu"] },
          { kana: "ぜ", romaji: "ze", alternatives: ["ze"] },
          { kana: "ぞ", romaji: "zo", alternatives: ["zo"] }
        ]
      },
      {
        id: "da",
        name: "Hàng Da (だ - ど)",
        items: [
          { kana: "だ", romaji: "da", alternatives: ["da"] },
          { kana: "ぢ", romaji: "ji", alternatives: ["ji", "di", "dji"] },
          { kana: "づ", romaji: "zu", alternatives: ["zu", "du", "dzu"] },
          { kana: "で", romaji: "de", alternatives: ["de"] },
          { kana: "do", romaji: "do", alternatives: ["do"] }
        ]
      },
      {
        id: "ba",
        name: "Hàng Ba (ば - ぼ)",
        items: [
          { kana: "ば", romaji: "ba", alternatives: ["ba"] },
          { kana: "び", romaji: "bi", alternatives: ["bi"] },
          { kana: "ぶ", romaji: "bu", alternatives: ["bu"] },
          { kana: "べ", romaji: "be", alternatives: ["be"] },
          { kana: "ぼ", romaji: "bo", alternatives: ["bo"] }
        ]
      },
      {
        id: "pa",
        name: "Hàng Pa (ぱ - ぽ)",
        items: [
          { kana: "ぱ", romaji: "pa", alternatives: ["pa"] },
          { kana: "ぴ", romaji: "pi", alternatives: ["pi"] },
          { kana: "ぷ", romaji: "pu", alternatives: ["pu"] },
          { kana: "ぺ", romaji: "pe", alternatives: ["pe"] },
          { kana: "ぽ", romaji: "po", alternatives: ["po"] }
        ]
      }
    ]
  },

  yoon: {
    id: "yoon",
    name: "Bảng Âm Ghép (Yoon - 33 chữ)",
    description: "Kết hợp âm hàng I với Ya, Yu, Yo nhỏ",
    rows: [
      {
        id: "kya",
        name: "Hàng Kya (きゃ - きょ)",
        items: [
          { kana: "きゃ", romaji: "kya", alternatives: ["kya"] },
          { kana: "きゅ", romaji: "kyu", alternatives: ["kyu"] },
          { kana: "きょ", romaji: "kyo", alternatives: ["kyo"] }
        ]
      },
      {
        id: "sha",
        name: "Hàng Sha (しゃ - しょ)",
        items: [
          { kana: "しゃ", romaji: "sha", alternatives: ["sha", "sya"] },
          { kana: "しゅ", romaji: "shu", alternatives: ["shu", "syu"] },
          { kana: "しょ", romaji: "sho", alternatives: ["sho", "syo"] }
        ]
      },
      {
        id: "cha",
        name: "Hàng Cha (ちゃ - ちょ)",
        items: [
          { kana: "ちゃ", romaji: "cha", alternatives: ["cha", "tya"] },
          { kana: "ちゅ", romaji: "chu", alternatives: ["chu", "tyu"] },
          { kana: "ちょ", romaji: "cho", alternatives: ["cho", "tyo"] }
        ]
      },
      {
        id: "nya",
        name: "Hàng Nya (にゃ - にょ)",
        items: [
          { kana: "にゃ", romaji: "nya", alternatives: ["nya"] },
          { kana: "にゅ", romaji: "nyu", alternatives: ["nyu"] },
          { kana: "にょ", romaji: "nyo", alternatives: ["nyo"] }
        ]
      },
      {
        id: "hya",
        name: "Hàng Hya (ひゃ - ひょ)",
        items: [
          { kana: "ひゃ", romaji: "hya", alternatives: ["hya"] },
          { kana: "ひゅ", romaji: "hyu", alternatives: ["hyu"] },
          { kana: "ひょ", romaji: "hyo", alternatives: ["hyo"] }
        ]
      },
      {
        id: "mya",
        name: "Hàng Mya (みゃ - みょ)",
        items: [
          { kana: "みゃ", romaji: "mya", alternatives: ["mya"] },
          { kana: "みゅ", romaji: "myu", alternatives: ["myu"] },
          { kana: "みょ", romaji: "myo", alternatives: ["myo"] }
        ]
      },
      {
        id: "rya",
        name: "Hàng Rya (りゃ - りょ)",
        items: [
          { kana: "りゃ", romaji: "rya", alternatives: ["rya"] },
          { kana: "りゅ", romaji: "ryu", alternatives: ["ryu"] },
          { kana: "りょ", romaji: "ryo", alternatives: ["ryo"] }
        ]
      },
      {
        id: "gya",
        name: "Hàng Gya (ぎゃ - ぎょ)",
        items: [
          { kana: "ぎゃ", romaji: "gya", alternatives: ["gya"] },
          { kana: "ぎゅ", romaji: "gyu", alternatives: ["gyu"] },
          { kana: "ぎょ", romaji: "gyo", alternatives: ["gyo"] }
        ]
      },
      {
        id: "ja",
        name: "Hàng Ja (じゃ - じょ)",
        items: [
          { kana: "じゃ", romaji: "ja", alternatives: ["ja", "zya", "jya"] },
          { kana: "じゅ", romaji: "ju", alternatives: ["ju", "zyu", "jyu"] },
          { kana: "じょ", romaji: "jo", alternatives: ["jo", "zyo", "jyo"] }
        ]
      },
      {
        id: "bya",
        name: "Hàng Bya (びゃ - びょ)",
        items: [
          { kana: "びゃ", romaji: "bya", alternatives: ["bya"] },
          { kana: "びゅ", romaji: "byu", alternatives: ["byu"] },
          { kana: "びょ", romaji: "byo", alternatives: ["byo"] }
        ]
      },
      {
        id: "pya",
        name: "Hàng Pya (ぴゃ - ぴょ)",
        items: [
          { kana: "ぴゃ", romaji: "pya", alternatives: ["pya"] },
          { kana: "ぴゅ", romaji: "pyu", alternatives: ["pyu"] },
          { kana: "ぴょ", romaji: "pyo", alternatives: ["pyo"] }
        ]
      }
    ]
  }
};

/**
 * Katakana Syllabary Master Dataset
 * 46 Gojuon + 25 Dakuten/Handakuten + 33 Yoon Combinations
 */
const KATAKANA_DATA = {
  basic: {
    id: "basic",
    name: "Bảng Cơ Bản (Gojuon - 46 chữ)",
    description: "Các nguyên âm và phụ âm cơ bản Katakana",
    rows: [
      {
        id: "a",
        name: "Hàng A (ア - オ)",
        items: [
          { kana: "ア", romaji: "a", alternatives: ["a"] },
          { kana: "イ", romaji: "i", alternatives: ["i"] },
          { kana: "ウ", romaji: "u", alternatives: ["u"] },
          { kana: "エ", romaji: "e", alternatives: ["e"] },
          { kana: "オ", romaji: "o", alternatives: ["o"] }
        ]
      },
      {
        id: "ka",
        name: "Hàng Ka (カ - コ)",
        items: [
          { kana: "カ", romaji: "ka", alternatives: ["ka"] },
          { kana: "キ", romaji: "ki", alternatives: ["ki"] },
          { kana: "ク", romaji: "ku", alternatives: ["ku"] },
          { kana: "ケ", romaji: "ke", alternatives: ["ke"] },
          { kana: "コ", romaji: "ko", alternatives: ["ko"] }
        ]
      },
      {
        id: "sa",
        name: "Hàng Sa (サ - ソ)",
        items: [
          { kana: "サ", romaji: "sa", alternatives: ["sa"] },
          { kana: "シ", romaji: "shi", alternatives: ["shi", "si"] },
          { kana: "ス", romaji: "su", alternatives: ["su"] },
          { kana: "セ", romaji: "se", alternatives: ["se"] },
          { kana: "ソ", romaji: "so", alternatives: ["so"] }
        ]
      },
      {
        id: "ta",
        name: "Hàng Ta (タ - ト)",
        items: [
          { kana: "タ", romaji: "ta", alternatives: ["ta"] },
          { kana: "チ", romaji: "chi", alternatives: ["chi", "ti"] },
          { kana: "ツ", romaji: "tsu", alternatives: ["tsu", "tu"] },
          { kana: "テ", romaji: "te", alternatives: ["te"] },
          { kana: "ト", romaji: "to", alternatives: ["to"] }
        ]
      },
      {
        id: "na",
        name: "Hàng Na (ナ - ノ)",
        items: [
          { kana: "ナ", romaji: "na", alternatives: ["na"] },
          { kana: "ニ", romaji: "ni", alternatives: ["ni"] },
          { kana: "ヌ", romaji: "nu", alternatives: ["nu"] },
          { kana: "ネ", romaji: "ne", alternatives: ["ne"] },
          { kana: "ノ", romaji: "no", alternatives: ["no"] }
        ]
      },
      {
        id: "ha",
        name: "Hàng Ha (ハ - ホ)",
        items: [
          { kana: "ハ", romaji: "ha", alternatives: ["ha"] },
          { kana: "ヒ", romaji: "hi", alternatives: ["hi"] },
          { kana: "フ", romaji: "fu", alternatives: ["fu", "hu"] },
          { kana: "ヘ", romaji: "he", alternatives: ["he"] },
          { kana: "ホ", romaji: "ho", alternatives: ["ho"] }
        ]
      },
      {
        id: "ma",
        name: "Hàng Ma (マ - モ)",
        items: [
          { kana: "マ", romaji: "ma", alternatives: ["ma"] },
          { kana: "ミ", romaji: "mi", alternatives: ["mi"] },
          { kana: "ム", romaji: "mu", alternatives: ["mu"] },
          { kana: "メ", romaji: "me", alternatives: ["me"] },
          { kana: "モ", romaji: "mo", alternatives: ["mo"] }
        ]
      },
      {
        id: "ya",
        name: "Hàng Ya (ヤ - ヨ)",
        items: [
          { kana: "ヤ", romaji: "ya", alternatives: ["ya"] },
          { kana: null, romaji: null },
          { kana: "ユ", romaji: "yu", alternatives: ["yu"] },
          { kana: null, romaji: null },
          { kana: "ヨ", romaji: "yo", alternatives: ["yo"] }
        ]
      },
      {
        id: "ra",
        name: "Hàng Ra (ラ - ロ)",
        items: [
          { kana: "ラ", romaji: "ra", alternatives: ["ra"] },
          { kana: "リ", romaji: "ri", alternatives: ["ri"] },
          { kana: "ル", romaji: "ru", alternatives: ["ru"] },
          { kana: "レ", romaji: "re", alternatives: ["re"] },
          { kana: "ロ", romaji: "ro", alternatives: ["ro"] }
        ]
      },
      {
        id: "wa",
        name: "Hàng Wa - N (ワ - ン)",
        items: [
          { kana: "ワ", romaji: "wa", alternatives: ["wa"] },
          { kana: null, romaji: null },
          { kana: null, romaji: null },
          { kana: "ヲ", romaji: "wo", alternatives: ["wo", "o"] },
          { kana: "ン", romaji: "n", alternatives: ["n", "nn"] }
        ]
      }
    ]
  },

  dakuten: {
    id: "dakuten",
    name: "Bảng Âm Đục / Bán Đục (Dakuten - 25 chữ)",
    description: "Thêm dấu Tenten (゛) hoặc Maru (゜)",
    rows: [
      {
        id: "ga",
        name: "Hàng Ga (ガ - ゴ)",
        items: [
          { kana: "ガ", romaji: "ga", alternatives: ["ga"] },
          { kana: "ギ", romaji: "gi", alternatives: ["gi"] },
          { kana: "グ", romaji: "gu", alternatives: ["gu"] },
          { kana: "ゲ", romaji: "ge", alternatives: ["ge"] },
          { kana: "ゴ", romaji: "go", alternatives: ["go"] }
        ]
      },
      {
        id: "za",
        name: "Hàng Za (ザ - ゾ)",
        items: [
          { kana: "ザ", romaji: "za", alternatives: ["za"] },
          { kana: "ジ", romaji: "ji", alternatives: ["ji", "zi"] },
          { kana: "ズ", romaji: "zu", alternatives: ["zu"] },
          { kana: "ゼ", romaji: "ze", alternatives: ["ze"] },
          { kana: "ゾ", romaji: "zo", alternatives: ["zo"] }
        ]
      },
      {
        id: "da",
        name: "Hàng Da (ダ - ド)",
        items: [
          { kana: "ダ", romaji: "da", alternatives: ["da"] },
          { kana: "ヂ", romaji: "ji", alternatives: ["ji", "di", "dji"] },
          { kana: "ヅ", romaji: "zu", alternatives: ["zu", "du", "dzu"] },
          { kana: "デ", romaji: "de", alternatives: ["de"] },
          { kana: "ド", romaji: "do", alternatives: ["do"] }
        ]
      },
      {
        id: "ba",
        name: "Hàng Ba (バ - ボ)",
        items: [
          { kana: "バ", romaji: "ba", alternatives: ["ba"] },
          { kana: "ビ", romaji: "bi", alternatives: ["bi"] },
          { kana: "ブ", romaji: "bu", alternatives: ["bu"] },
          { kana: "ベ", romaji: "be", alternatives: ["be"] },
          { kana: "ボ", romaji: "bo", alternatives: ["bo"] }
        ]
      },
      {
        id: "pa",
        name: "Hàng Pa (パ - ポ)",
        items: [
          { kana: "パ", romaji: "pa", alternatives: ["pa"] },
          { kana: "ピ", romaji: "pi", alternatives: ["pi"] },
          { kana: "プ", romaji: "pu", alternatives: ["pu"] },
          { kana: "ペ", romaji: "pe", alternatives: ["pe"] },
          { kana: "ポ", romaji: "po", alternatives: ["po"] }
        ]
      }
    ]
  },

  yoon: {
    id: "yoon",
    name: "Bảng Âm Ghép (Yoon - 33 chữ)",
    description: "Kết hợp âm hàng I với Ya, Yu, Yo nhỏ",
    rows: [
      {
        id: "kya",
        name: "Hàng Kya (キャ - キョ)",
        items: [
          { kana: "キャ", romaji: "kya", alternatives: ["kya"] },
          { kana: "キュ", romaji: "kyu", alternatives: ["kyu"] },
          { kana: "キョ", romaji: "kyo", alternatives: ["kyo"] }
        ]
      },
      {
        id: "sha",
        name: "Hàng Sha (シャ - ショ)",
        items: [
          { kana: "シャ", romaji: "sha", alternatives: ["sha", "sya"] },
          { kana: "シュ", romaji: "shu", alternatives: ["shu", "syu"] },
          { kana: "ショ", romaji: "sho", alternatives: ["sho", "syo"] }
        ]
      },
      {
        id: "cha",
        name: "Hàng Cha (チャ - チョ)",
        items: [
          { kana: "チャ", romaji: "cha", alternatives: ["cha", "tya"] },
          { kana: "チュ", romaji: "chu", alternatives: ["chu", "tyu"] },
          { kana: "チョ", romaji: "cho", alternatives: ["cho", "tyo"] }
        ]
      },
      {
        id: "nya",
        name: "Hàng Nya (ニャ - ニョ)",
        items: [
          { kana: "ニャ", romaji: "nya", alternatives: ["nya"] },
          { kana: "ニュ", romaji: "nyu", alternatives: ["nyu"] },
          { kana: "ニョ", romaji: "nyo", alternatives: ["nyo"] }
        ]
      },
      {
        id: "hya",
        name: "Hàng Hya (ヒャ - ヒョ)",
        items: [
          { kana: "ヒャ", romaji: "hya", alternatives: ["hya"] },
          { kana: "ヒュ", romaji: "hyu", alternatives: ["hyu"] },
          { kana: "ヒョ", romaji: "hyo", alternatives: ["hyo"] }
        ]
      },
      {
        id: "mya",
        name: "Hàng Mya (ミャ - ミョ)",
        items: [
          { kana: "ミャ", romaji: "mya", alternatives: ["mya"] },
          { kana: "ミュ", romaji: "myu", alternatives: ["myu"] },
          { kana: "ミョ", romaji: "myo", alternatives: ["myo"] }
        ]
      },
      {
        id: "rya",
        name: "Hàng Rya (リャ - リョ)",
        items: [
          { kana: "リャ", romaji: "rya", alternatives: ["rya"] },
          { kana: "リュ", romaji: "ryu", alternatives: ["ryu"] },
          { kana: "リョ", romaji: "ryo", alternatives: ["ryo"] }
        ]
      },
      {
        id: "gya",
        name: "Hàng Gya (ギャ - ギョ)",
        items: [
          { kana: "ギャ", romaji: "gya", alternatives: ["gya"] },
          { kana: "ギュ", romaji: "gyu", alternatives: ["gyu"] },
          { kana: "ギョ", romaji: "gyo", alternatives: ["gyo"] }
        ]
      },
      {
        id: "ja",
        name: "Hàng Ja (ジャ - ジョ)",
        items: [
          { kana: "ジャ", romaji: "ja", alternatives: ["ja", "zya", "jya"] },
          { kana: "ジュ", romaji: "ju", alternatives: ["ju", "zyu", "jyu"] },
          { kana: "ジョ", romaji: "jo", alternatives: ["jo", "zyo", "jyo"] }
        ]
      },
      {
        id: "bya",
        name: "Hàng Bya (ビャ - ビョ)",
        items: [
          { kana: "ビャ", romaji: "bya", alternatives: ["bya"] },
          { kana: "ビュ", romaji: "byu", alternatives: ["byu"] },
          { kana: "ビョ", romaji: "byo", alternatives: ["byo"] }
        ]
      },
      {
        id: "pya",
        name: "Hàng Pya (ピャ - ピョ)",
        items: [
          { kana: "ピャ", romaji: "pya", alternatives: ["pya"] },
          { kana: "ピュ", romaji: "pyu", alternatives: ["pyu"] },
          { kana: "ピョ", romaji: "pyo", alternatives: ["pyo"] }
        ]
      }
    ]
  }
};

window.HIRAGANA_DATA = HIRAGANA_DATA;
window.KATAKANA_DATA = KATAKANA_DATA;
