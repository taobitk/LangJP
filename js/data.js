/**
 * Japanese Hiragana Learning Dataset
 * Includes Gojuon (Basic 46), Dakuten/Handakuten (25), and Yoon (Combinations 33)
 */

const HIRAGANA_DATA = {
  basic: {
    id: "basic",
    name: "Bảng Cơ Bản (Gojuon - 46 chữ)",
    description: "Các âm cơ bản từ hàng A đến hàng Wa, N",
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
          { kana: "と", romaji: "to", alternatives: ["to"] }
        ]
      },
      {
        id: "na",
        name: "Hàng Na (な - の)",
        items: [
          { kana: "な", romaji: "na", alternatives: ["na"] },
          { kana: "に", romaji: "ni", alternatives: ["ni"] },
          { kana: "ぬ", romaji: "nu", alternatives: ["nu"] },
          { kana: "ね", romaji: "ne", alternatives: ["ne"] },
          { kana: "の", romaji: "no", alternatives: ["no"] }
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
          { kana: null, romaji: null }, // Vị trí trống
          { kana: "ゆ", romaji: "yu", alternatives: ["yu"] },
          { kana: null, romaji: null }, // Vị trí trống
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
          { kana: "ど", romaji: "do", alternatives: ["do"] }
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
    description: "Kết hợp với ya, yu, yo nhỏ (ゃ, ゅ, ょ)",
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
          { kana: "ちゃ", romaji: "cha", alternatives: ["cha", "tya", "cya"] },
          { kana: "ちゅ", romaji: "chu", alternatives: ["chu", "tyu", "cyu"] },
          { kana: "ちょ", romaji: "cho", alternatives: ["cho", "tyo", "cyo"] }
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
