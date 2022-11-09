export const template = {
  rate: { min: 10, max: 240, value: 40 },
  globalCycle: { enum: [32, 24, 16, 12, 9, 8, 6, 4, 3, 2, 1, 0.5], value: 32 },
  
  buf0: { min: 0, max: 19, value: 3 },
  buf0: { min: 0, max: 19, value: 0 },
  buf0: { min: 0, max: 19, value: 12 },
  buf0: { min: 0, max: 19, value: 8 },
  buf0: { min: 0, max: 19, value: 12 },
  buf0: { min: 0, max: 19, value: 13 },
  buf0: { min: 20, max: 33, value: 31 },

  pitch0: { min: -36, max: 36, value: -5 },
  pitch1: { min: -36, max: 36, value: 0 },
  pitch2: { min: -36, max: 36, value: 1 },
  pitch3: { min: -36, max: 36, value: 26 },
  pitch4: { min: -36, max: 36, value: 4 },
  pitch5: { min: -36, max: 36, value: -3 },

  scale: { min: 0, max: 6, value: 4 },
  
  len0: { min: 0, max: 1, value: 1 },
  len1: { min: 0, max: 1, value: 0.2 },
  len2: { min: 0, max: 1, value: 0.5 },
  len3: { min: 0, max: 1, value: 0 },
  len4: { min: 0, max: 1, value: 0.8 },
  len5: { min: 0, max: 1, value: 0.4 },
  len6: { min: 0, max: 1, value: 1 },

  div0: { min: 1, max: 16, value: 6 },
  div0: { min: 1, max: 16, value: 1 },
  div0: { min: 1, max: 16, value: 3 },
  div0: { min: 1, max: 16, value: 16 },

  range0: { min: 1, max: 16, value: 8 },
  range0: { min: 1, max: 16, value: 12 },
  range0: { min: 1, max: 16, value: 7 },
  range0: { min: 1, max: 16, value: 16 },

  retrig0: { enum: [32, 6, 4, 3, 2, 1, 0.5, 0.25], value: 2 },
  retrig1: { enum: [32, 6, 4, 3, 2, 1, 0.5, 0.25], value: 4 },

  retrigGate0: { enum: [0, 1], value: 1 },
  retrigGate1: { enum: [0, 1], value: 1 },

  chordfollow: { enum: [0, 1, 2, 3, 4], value: 0 },
  chordspread: { enum: [1, 2, 3, 4, 5, 6, 7, 8], value: 5 },

  chordlow: { min: 0, max: 100, value: 10 },
  chordhigh: { min: 0, max: 100, value: 90 }
};
