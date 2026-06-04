// Phonetic mapper for Nepali Unicode to Roman (and vice-versa)
// Optimized for lyrics style as used by major Nepali lyrics platforms

const ROMAN_VOWELS_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ii', 'उ': 'u', 'ऊ': 'oo',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऋ': 'ri', 'अं': 'an', 'अँ': 'an'
};

const ROMAN_MATRAS_MAP: Record<string, string> = {
  'ा': 'aa', 'ि': 'i', 'ी': 'ii', 'ु': 'u', 'ू': 'oo',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ृ': 'ri',
  'ं': 'n', 'ँ': 'n', 'ः': 'ah'
};

const ROMAN_CONSONANTS_MAP: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 'tt', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'na',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gya', 'श्र': 'shr'
};

const NEPALI_CONSONANTS = new Set(Object.keys(ROMAN_CONSONANTS_MAP));

export const convertToRoman = (text: string): string => {
  if (!text) return "";
  let result = "";
  const chars = Array.from(text);
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const nextChar = chars[i + 1];
    const nextNextChar = chars[i + 2];

    // 0. Special Conjuncts (Check 3-char sequences first)
    // द्द (da + halant + da)
    if (char === 'द' && nextChar === '्' && nextNextChar === 'द') {
        result += 'dd';
        i += 2;
        continue;
    }
    // द्ध (da + halant + dha)
    if (char === 'द' && nextChar === '्' && nextNextChar === 'ध') {
        result += 'ddh';
        i += 2;
        continue;
    }

    // 1. Standalone Vowels
    if (ROMAN_VOWELS_MAP[char]) {
      result += ROMAN_VOWELS_MAP[char];
      continue;
    }

    // 2. Consonants
    if (NEPALI_CONSONANTS.has(char)) {
      let roman = ROMAN_CONSONANTS_MAP[char];
      
      if (nextChar === '्') {
        // Halant: No implicit vowel
        result += roman;
        i++; // skip halant
      } else if (ROMAN_MATRAS_MAP[nextChar]) {
        // Matra: Append the matra sound
        // Special case for Anusvara/Chandrabindu (nasals) - they follow the inherent 'a' sound usually
        if (nextChar === 'ं' || nextChar === 'ँ') {
            result += roman + 'an';
        } else {
            result += roman + ROMAN_MATRAS_MAP[nextChar];
        }
        i++; // skip matra
      } else {
        // Schwa deletion logic
        // If at end of word or followed by punctuation/space, drop trailing 'a'
        const isEndOfWord = !nextChar || /[\s।.,!?;:()|]/.test(nextChar);
        
        if (isEndOfWord) {
            // Exceptions for short frequent words that usually keep 'a'
            if (char === 'त' || char === 'म' || char === 'न' || char === 'छ') {
                result += roman + 'a';
            } else {
                result += roman;
            }
        } else {
            result += roman + 'a';
        }
      }
      continue;
    }

    // 3. Punctuation and Others
    if (char === '।') result += '.';
    else if (char === 'र' && nextChar === '्' && nextNextChar === 'र' && chars[i+3] === 'ि') {
        // Special handle for र्रि
        result += 'rri';
        i += 3;
    }
    else if (char === 'र्') {
        result += 'r';
    }
    else result += char;
  }
  
  // Clean up double vowels that might occur accidentally
  return result
    .replace(/aaa/g, 'aa')
    .replace(/iii/g, 'ii')
    .replace(/ooo/g, 'oo');
};

// Reverse: Roman to Nepali
export const convertToNepali = (text: string): string => {
  if (!text) return "";
  
  const VOWELS: Record<string, string> = {
    'a': 'अ', 'aa': 'आ', 'i': 'इ', 'ii': 'ई', 'u': 'उ', 'oo': 'ऊ', 'uu': 'ऊ',
    'e': 'ए', 'ae': 'ए', 'ai': 'ऐ', 'o': 'ओ', 'au': 'औ', 'ao': 'औ'
  };

  const MATRAS: Record<string, string> = {
    'a': '', 'aa': 'ा', 'i': 'ि', 'ii': 'ी', 'u': 'ु', 'oo': 'ू', 'uu': 'ू',
    'e': 'े', 'ae': 'े', 'ai': 'ै', 'o': 'ो', 'au': 'ौ', 'ao': 'ौ'
  };

  const CONSONANTS: Record<string, string> = {
    'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ', 'ng': 'ङ',
    'ch': 'च', 'chh': 'छ', 'j': 'ज', 'jh': 'झ', 'ny': 'ञ',
    'tt': 'ट', 'th': 'त', 'd': 'द', 'dh': 'ध', 'n': 'न',
    'na': 'ण', 'nn': 'ण', 'p': 'प', 'ph': 'फ', 'f': 'फ', 'b': 'ब', 'bh': 'भ', 'm': 'म',
    'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व',
    'sh': 'श', 's': 'स', 'h': 'ह', 'ksh': 'क्ष', 'xa': 'क्ष', 'tr': 'त्र', 'gya': 'ज्ञ', 'jna': 'ज्ञ', 'shr': 'श्र'
  };

  let result = "";
  let i = 0;
  
  while (i < text.length) {
    let char = text[i].toLowerCase();
    
    if (!/[a-z]/.test(char)) {
        result += text[i] === '.' ? '।' : text[i];
        i++;
        continue;
    }

    let foundConsonant = "";
    let cLen = 0;
    for (let len = 3; len > 0; len--) {
        let sub = text.substring(i, i + len).toLowerCase();
        if (CONSONANTS[sub]) {
            foundConsonant = CONSONANTS[sub];
            cLen = len;
            break;
        }
    }

    if (foundConsonant) {
        i += cLen;
        let foundMatra = "";
        let mLen = 0;
        for (let len = 2; len > 0; len--) {
            let sub = text.substring(i, i + len).toLowerCase();
            if (MATRAS[sub] !== undefined) {
                foundMatra = MATRAS[sub];
                mLen = len;
                break;
            }
        }

        if (mLen > 0) {
            result += foundConsonant + foundMatra;
            i += mLen;
        } else {
            let nextChar = text[i]?.toLowerCase();
            if (nextChar && /[a-z]/.test(nextChar) && !VOWELS[nextChar]) {
                result += foundConsonant + '्';
            } else {
                result += foundConsonant;
            }
        }
    } else {
        let foundVowel = "";
        let vLen = 0;
        for (let len = 2; len > 0; len--) {
            let sub = text.substring(i, i + len).toLowerCase();
            if (VOWELS[sub]) {
                foundVowel = VOWELS[sub];
                vLen = len;
                break;
            }
        }
        if (foundVowel) {
            result += foundVowel;
            i += vLen;
        } else {
            result += text[i];
            i++;
        }
    }
  }
  return result;
};
