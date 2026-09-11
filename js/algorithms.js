/**
 * Core Encoder / Decoder Algorithms
 * 10 Paired Reversible Systems & Deterministic Corruption Logic
 * Fully Unicode-safe (supporting Emojis 😀🚀, Malayalam മലയാളം, symbols, newlines, tabs)
 */

export const ALGORITHM_PAIRS = [
  {
    id: 1,
    key: 'caesar',
    name: 'Caesar Shift (+3)',
    encoderName: 'Encoder 01 · Caesar (+3)',
    decoderName: 'Decoder 01 · Caesar (-3)',
    description: 'Rotates alphabetical characters forward by 3 positions, preserving Unicode & symbols.',
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
    description: 'Replaces letters with their symmetric alphabet opposite (A ↔ Z, B ↔ Y).',
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
    description: 'Reverses grapheme/character order and toggles letter casing, emoji-safe.',
    encode: (text) => {
      const chars = Array.from(text);
      const toggled = chars.map((c) => {
        if (c >= 'a' && c <= 'z') return c.toUpperCase();
        if (c >= 'A' && c <= 'Z') return c.toLowerCase();
        return c;
      });
      return toggled.reverse().join('');
    },
    decode: (payload) => {
      const chars = Array.from(payload).reverse();
      return chars
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
    description: 'Applies bitwise XOR 0x5A over UTF-8 byte stream and formats as hyphenated hex.',
    encode: (text) => {
      const bytes = new TextEncoder().encode(text);
      const hexArr = [];
      for (let i = 0; i < bytes.length; i++) {
        const masked = (bytes[i] ^ 0x5a) & 0xff;
        hexArr.push(masked.toString(16).padStart(2, '0').toUpperCase());
      }
      return hexArr.join('-');
    },
    decode: (payload) => {
      try {
        const parts = payload.split('-');
        const bytes = new Uint8Array(parts.length);
        for (let i = 0; i < parts.length; i++) {
          const b = parseInt(parts[i], 16);
          if (isNaN(b)) return null;
          bytes[i] = (b ^ 0x5a) & 0xff;
        }
        return new TextDecoder().decode(bytes);
      } catch {
        return null;
      }
    }
  },
  {
    id: 5,
    key: 'base64',
    name: 'Base64 Representation',
    encoderName: 'Encoder 05 · Base64 Wrapper',
    decoderName: 'Decoder 05 · Base64 Unwrapper',
    description: 'Encodes Unicode text into standard Base64 representation (clearly labeled as encoding, not encryption).',
    encode: (text) => {
      const bytes = new TextEncoder().encode(text);
      let binStr = '';
      for (let i = 0; i < bytes.length; i++) {
        binStr += String.fromCharCode(bytes[i]);
      }
      return btoa(binStr);
    },
    decode: (payload) => {
      try {
        const binStr = atob(payload);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
          bytes[i] = binStr.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
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
    description: 'Converts UTF-8 bytes into 8-bit binary strings separated by spaces.',
    encode: (text) => {
      const bytes = new TextEncoder().encode(text);
      const binArr = [];
      for (let i = 0; i < bytes.length; i++) {
        binArr.push(bytes[i].toString(2).padStart(8, '0'));
      }
      return binArr.join(' ');
    },
    decode: (payload) => {
      try {
        const chunks = payload.trim().split(/\s+/);
        const bytes = new Uint8Array(chunks.length);
        for (let i = 0; i < chunks.length; i++) {
          if (!/^[01]{8}$/.test(chunks[i])) return null;
          bytes[i] = parseInt(chunks[i], 2);
        }
        return new TextDecoder().decode(bytes);
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
    description: 'Transposition cipher placing characters in a 3-rail zig-zag pattern, emoji-safe.',
    encode: (text) => {
      const chars = Array.from(text);
      if (chars.length <= 3) return text;
      const rails = [[], [], []];
      let rail = 0;
      let direction = 1;
      for (let i = 0; i < chars.length; i++) {
        rails[rail].push(chars[i]);
        rail += direction;
        if (rail === 2) direction = -1;
        else if (rail === 0) direction = 1;
      }
      return rails[0].join('') + rails[1].join('') + rails[2].join('');
    },
    decode: (payload) => {
      const chars = Array.from(payload);
      if (chars.length <= 3) return payload;
      const railLengths = [0, 0, 0];
      let rail = 0;
      let direction = 1;
      for (let i = 0; i < chars.length; i++) {
        railLengths[rail]++;
        rail += direction;
        if (rail === 2) direction = -1;
        else if (rail === 0) direction = 1;
      }

      const rails = [
        chars.slice(0, railLengths[0]),
        chars.slice(railLengths[0], railLengths[0] + railLengths[1]),
        chars.slice(railLengths[0] + railLengths[1])
      ];

      let out = '';
      rail = 0;
      direction = 1;
      for (let i = 0; i < chars.length; i++) {
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
    description: 'Converts UTF-8 byte stream into contiguous uppercase hexadecimal bytes.',
    encode: (text) => {
      const bytes = new TextEncoder().encode(text);
      let hex = '';
      for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0').toUpperCase();
      }
      return '0x' + hex;
    },
    decode: (payload) => {
      try {
        let clean = payload.startsWith('0x') ? payload.slice(2) : payload;
        if (clean.length % 2 !== 0) return null;
        const bytes = new Uint8Array(clean.length / 2);
        for (let i = 0; i < clean.length; i += 2) {
          const byteVal = parseInt(clean.substr(i, 2), 16);
          if (isNaN(byteVal)) return null;
          bytes[i / 2] = byteVal;
        }
        return new TextDecoder().decode(bytes);
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
    description: 'Bijective mapping exchanging vowels and select consonants with phonetic symbols.',
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
      return Array.from(text)
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
      return Array.from(payload)
        .map((c) => reverseMap[c] || c)
        .join('');
    }
  }
];

/**
 * Generate deliberate, plausible corrupted gibberish output when an incompatible
 * decoder attempts to process an encoded payload.
 *
 * Requirements (Section 7 of agent.md):
 * - Deterministic for given transmission state.
 * - Plausible visual gibberish/glitch output.
 * - Must not accidentally equal the original plaintext.
 * - Must preserve application stability for Unicode, emoji, long messages.
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
  const safeChars = Array.from(payload);
  for (let i = 0; i < Math.min(safeChars.length, 30); i++) {
    seed = (seed * 33 + safeChars[i].codePointAt(0)) % 10007;
  }

  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  let base = attemptedDecode && attemptedDecode.length >= 3 ? attemptedDecode : payload;

  const baseChars = Array.from(base);
  if (baseChars.length > 36) {
    base = baseChars.slice(0, 32).join('') + '...';
  }

  const chars = Array.from(base);
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
