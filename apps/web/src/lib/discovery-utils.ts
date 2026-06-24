export const toEntityId = (name: string): string => {
  // Generate a deterministic UUID v4 from the input string.
  // Use cyrb128 to hash the string into a 128-bit seed.
  let h1 = 1779033703, h2 = 3024734799, h3 = 3362453611, h4 = 502494325;
  const str = name.toLowerCase().trim();
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  
  const seed = [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
  
  // Use sfc32 PRNG to generate hex digits
  let a = seed[0], b = seed[1], c = seed[2], d = seed[3];
  const nextHex = () => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    const val = (t >>> 0) % 16;
    return val.toString(16);
  };

  let uuid = '';
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-';
    }
    if (i === 12) {
      uuid += '4'; // UUID v4 version
    } else if (i === 16) {
      // UUID v4 variant (8, 9, a, or b)
      const val = (parseInt(nextHex(), 16) & 0x3) | 0x8;
      uuid += val.toString(16);
    } else {
      uuid += nextHex();
    }
  }
  return uuid;
};
