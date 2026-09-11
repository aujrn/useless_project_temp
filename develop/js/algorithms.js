/**
 * Core Encoder / Decoder Algorithms
 * 10 Paired Reversible Systems & Deterministic Corruption Logic
 */

export const ALGORITHM_PAIRS = [
  {
    id: 1,
    key: 'caesar',
    name: 'Caesar Shift (+3)',
    encoderName: 'Encoder 01 · Caesar (+3)',
    decoderName: 'Decoder 01 · Caesar (-3)',
    description: 'Rotates each alphabetical character forward by 3 positions.',
    encode: (text) => {
      return text.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        return String.fromCharCode(((code - base + 3) % 26) + base);
      });
    },
    decode: (payload) => {
      return payload.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        return String.fromCharCode(((code - base - 3 + 26) % 26) + base);
      });
    }
  },
  {
    id: 2,
    key: 'atbash',
    name: 'Atbash Substitution',
    encoderName: 'Encoder 02 · Atbash Cipher',
    decoderName: 'Decoder 02 · Atbash Inverse',
    description: 'Replaces each letter with its symmetric opposite in the alphabet (A ↔ Z, B ↔ Y).',
    encode: (text) => {
      return text.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(90 - (code - 65));
        } else {
          return String.fromCharCode(122 - (code - 97));
        }
      });
    },
    decode: (payload) => {
      return payload.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(90 - (code - 65));
        } else {
          return String.fromCharCode(122 - (code - 97));
        }
      });
    }
  },
  {
    id: 3,
    key: 'reverse-case',
    name: 'Reverse + Invert Case',
    encoderName: 'Encoder 03 · Reverse & Invert',
    decoderName: 'Decoder 03 · Revert & Restore',
    description: 'Reverses character order and toggles uppercase to lowercase and vice versa.',
    encode: (text) => {
      const toggled = text
        .split('')
        .map((c) => {
          if (c >= 'a' && c <= 'z') return c.toUpperCase();
          if (c >= 'A' && c <= 'Z') return c.toLowerCase();
          return c;
        })
        .join('');
      return toggled.split('').reverse().join('');
    },
    decode: (payload) => {
      const reversed = payload.split('').reverse().join('');
      return reversed
        .split('')
        .map((c) => {
          if (c >= 'a' && c <= 'z') return c.toUpperCase();
          if (c >= 'A' && c <= 'Z') return c.toLowerCase();
          return c;
        })
        .join('');
    }
  },
  {
    id: 4,
    key: 'xor-hex',
    name: 'XOR Mask (0x5A)',
    encoderName: 'Encoder 04 · XOR 0x5A Hex',
    decoderName: 'Decoder 04 · XOR 0x5A Revert',
    description: 'Applies bitwise XOR with 0x5A key and formats as hyphenated hex bytes.',
    encode: (text) => {
      const bytes = [];
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        const masked = (code ^ 0x5a) & 0xff;
        bytes.push(masked.toString(16).padStart(2, '0').toUpperCase());
      }
      return bytes.join('-');
    },
    decode: (payload) => {
      try {
        const parts = payload.split('-');
        let out = '';
        for (const part of parts) {
          const byte = parseInt(part, 16);
          if (isNaN(byte)) return null;
          out += String.fromCharCode((byte ^ 0x5a) & 0xff);
        }
        return out;
      } catch {
        return null;
      }
    }
  },
  {
    id: 5,
    key: 'base64',
    name: 'Base64 Tokenizer',
    encoderName: 'Encoder 05 · Base64 Wrapper',
    decoderName: 'Decoder 05 · Base64 Unwrapper',
    description: 'Encodes Unicode text into standard Base64 representation (clearly labeled as encoding, not encryption).',
    encode: (text) => {
      try {
        return btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (match, p1) => {
          return String.fromCharCode(parseInt('0x' + p1, 16));
        }));
      } catch {
        return btoa(text);
      }
    },
    decode: (payload) => {
      try {
        const decoded = atob(payload);
        return decodeURIComponent(
          decoded
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      } catch {
        return null;
      }
    }
  },
  {
    id: 6,
    key: 'vigenere',
    name: 'Vigenère ("ENIGMA")',
    encoderName: 'Encoder 06 · Vigenère Polyalphabetic',
    decoderName: 'Decoder 06 · Vigenère Decryptor',
    description: 'Polyalphabetic substitution cipher using repeating key "ENIGMA".',
    encode: (text) => {
      const key = 'ENIGMA';
      let keyIdx = 0;
      return text.replace(/[a-zA-Z]/g, (char) => {
        const isUpper = char >= 'A' && char <= 'Z';
        const base = isUpper ? 65 : 97;
        const shift = key.charCodeAt(keyIdx % key.length) - 65;
        keyIdx++;
        return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
      });
    },
    decode: (payload) => {
      const key = 'ENIGMA';
      let keyIdx = 0;
      return payload.replace(/[a-zA-Z]/g, (char) => {
        const isUpper = char >= 'A' && char <= 'Z';
        const base = isUpper ? 65 : 97;
        const shift = key.charCodeAt(keyIdx % key.length) - 65;
        keyIdx++;
        return String.fromCharCode(((char.charCodeAt(0) - base - shift + 26) % 26) + base);
      });
    }
  },
  {
    id: 7,
    key: 'binary-stream',
    name: '8-bit Binary Stream',
    encoderName: 'Encoder 07 · Binary Stream (8-bit)',
    decoderName: 'Decoder 07 · Binary to Text',
    description: 'Converts each character into an 8-bit binary representation separated by spaces.',
    encode: (text) => {
      return text
        .split('')
        .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ');
    },
    decode: (payload) => {
      try {
        const chunks = payload.trim().split(/\s+/);
        let out = '';
        for (const chunk of chunks) {
          if (!/^[01]{1,16}$/.test(chunk)) return null;
          out += String.fromCharCode(parseInt(chunk, 2));
        }
        return out;
      } catch {
        return null;
      }
    }
  },
  {
    id: 8,
    key: 'railfence',
    name: 'Rail Fence (3 Rails)',
    encoderName: 'Encoder 08 · Rail Fence Zig-Zag',
    decoderName: 'Decoder 08 · Rail Fence Reconstruct',
    description: 'Transposition cipher writing characters in a 3-rail zig-zag pattern.',
    encode: (text) => {
      if (text.length <= 3) return text;
      const rails = [[], [], []];
      let rail = 0;
      let direction = 1;
      for (let i = 0; i < text.length; i++) {
        rails[rail].push(text[i]);
        rail += direction;
        if (rail === 2) direction = -1;
        else if (rail === 0) direction = 1;
      }
      return rails[0].join('') + rails[1].join('') + rails[2].join('');
    },
    decode: (payload) => {
      if (payload.length <= 3) return payload;
      const railLengths = [0, 0, 0];
      let rail = 0;
      let direction = 1;
      for (let i = 0; i < payload.length; i++) {
        railLengths[rail]++;
        rail += direction;
        if (rail === 2) direction = -1;
        else if (rail === 0) direction = 1;
      }

      const rails = [
        payload.slice(0, railLengths[0]).split(''),
        payload.slice(railLengths[0], railLengths[0] + railLengths[1]).split(''),
        payload.slice(railLengths[0] + railLengths[1]).split('')
      ];

      let out = '';
      rail = 0;
      direction = 1;
      for (let i = 0; i < payload.length; i++) {
        out += rails[rail].shift();
        rail += direction;
        if (rail === 2) direction = -1;
        else if (rail === 0) direction = 1;
      }
      return out;
    }
  },
  {
    id: 9,
    key: 'hex-byte',
    name: 'Hexadecimal Stream',
    encoderName: 'Encoder 09 · Hex Byte Stream',
    decoderName: 'Decoder 09 · Hex Byte Converter',
    description: 'Converts UTF-8 characters into contiguous uppercase hexadecimal byte representation.',
    encode: (text) => {
      let hex = '';
      for (let i = 0; i < text.length; i++) {
        hex += text.charCodeAt(i).toString(16).padStart(2, '0').toUpperCase();
      }
      return '0x' + hex;
    },
    decode: (payload) => {
      try {
        let clean = payload.startsWith('0x') ? payload.slice(2) : payload;
        if (clean.length % 2 !== 0) return null;
        let out = '';
        for (let i = 0; i < clean.length; i += 2) {
          const code = parseInt(clean.substr(i, 2), 16);
          if (isNaN(code)) return null;
          out += String.fromCharCode(code);
        }
        return out;
      } catch {
        return null;
      }
    }
  },
  {
    id: 10,
    key: 'symbol-token',
    name: 'Symbol Token Substitution',
    encoderName: 'Encoder 10 · Symbol Token Matrix',
    decoderName: 'Decoder 10 · Symbol Matrix Reversal',
    description: 'Bijective mapping exchanging vowels and select common consonants with phonetic symbols.',
    encode: (text) => {
      const map = {
        'a': 'α', 'A': 'Δ',
        'e': 'ε', 'E': 'Ξ',
        'i': 'ι', 'I': 'Ψ',
        'o': 'ω', 'O': 'Ω',
        'u': 'μ', 'U': 'θ',
        's': 'σ', 'S': '§',
        't': 'τ', 'T': '†',
        'r': 'ρ', 'R': '®',
        'n': 'η', 'N': 'Π'
      };
      return text
        .split('')
        .map((c) => map[c] || c)
        .join('');
    },
    decode: (payload) => {
      const reverseMap = {
        'α': 'a', 'Δ': 'A',
        'ε': 'e', 'Ξ': 'E',
        'ι': 'i', 'Ψ': 'I',
        'ω': 'o', 'Ω': 'O',
        'μ': 'u', 'θ': 'U',
        'σ': 's', '§': 'S',
        'τ': 't', '†': 'T',
        'ρ': 'r', '®': 'R',
        'η': 'n', 'Π': 'N'
      };
      return payload
        .split('')
        .map((c) => reverseMap[c] || c)
        .join('');
    }
  }
];

/**
 * Generate deliberate, plausible corrupted gibberish output when an incompatible
 * decoder attempts to process an encoded payload.
 *
 * Implements requirement from Section 8 of agent.md:
 * "The app should not pretend that the decoder successfully decoded the message.
 *  Instead, produce visibly corrupted/gibberish output. Examples: H3llo ░▒?9x
 *  or another deterministic corruption derived from the encoded payload."
 */
export function generateCorruptedOutput(payload, encoder, decoder) {
  let attemptedDecode = null;
  try {
    attemptedDecode = decoder.decode(payload);
  } catch {
    attemptedDecode = null;
  }

  const glitchGlyphs = ['░', '▒', '▓', '?', '¿', '§', '¶', '×', 'ø', '¥', '9x', '#!'];

  let seed = (encoder.id * 73 + decoder.id * 31) % 10007;
  for (let i = 0; i < Math.min(payload.length, 30); i++) {
    seed = (seed * 33 + payload.charCodeAt(i)) % 10007;
  }

  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  let base = attemptedDecode && attemptedDecode.length >= 3 ? attemptedDecode : payload;

  if (base.length > 36) {
    base = base.slice(0, 32) + '...';
  }

  const chars = base.split('');
  const corrupted = [];

  for (let i = 0; i < chars.length; i++) {
    const r = seededRandom();
    const c = chars[i];

    if (r < 0.25) {
      const glyph = glitchGlyphs[Math.floor(seededRandom() * glitchGlyphs.length)];
      corrupted.push(glyph);
    } else if (r < 0.45 && /[a-zA-Z]/.test(c)) {
      const leet = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', b: '8' };
      const low = c.toLowerCase();
      corrupted.push(leet[low] || (seededRandom() > 0.5 ? c.toUpperCase() : c.toLowerCase()));
    } else if (r < 0.6 && /[a-zA-Z]/.test(c)) {
      const shift = Math.floor(seededRandom() * 10) + 1;
      corrupted.push(String.fromCharCode((c.charCodeAt(0) + shift) % 126));
    } else {
      corrupted.push(c);
    }
  }

  let result = corrupted.join('');
  if (!result.includes('░') && !result.includes('▒') && !result.includes('?')) {
    const insertPos = Math.floor(result.length / 2);
    result = result.slice(0, insertPos) + ' ░▒?9x ' + result.slice(insertPos);
  }

  return result;
}
