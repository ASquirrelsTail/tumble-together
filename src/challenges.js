export default [  
  {
    id: 1,
    name: 'Gravity',
    code: '-C1GD0FC1GKC1GKC1GKC1GKK_IA0E2A4A6A7A8A',
    trigger: 'left',
    output: 'bbbbbbbb',
    objective: 'Make all of the blue balls (and only the blue balls) reach the end.'
  },
  {
    id: 2,
    name: 'Re-entry',
    code: '-C1GD1FE1EF1DG1CH1BKKKKK_II0F2A6A7A4A8A',
    trigger: 'left',
    output: 'bbbbbbbb',
    objective: 'Make all of the blue balls (and only the blue balls) reach the end.'
  },
  {
    id: 3,
    name: 'Ignition',
    code: '-C1C0CKKKKKI0AH1BI0AH1BK_II0G2A6A7A4A8A',
    trigger: 'left',
    output: 'rrrrrrrrb',
    objective: 'Release one blue ball and then all of the red balls.'
  },
  {
    id: 4,
    name: 'Fusion',
    code: '-C0C1CB0E1BA0G1AKKKKKKKK_II0N2A6A7A4A8A',
    trigger: 'right',
    output: 'bbbbbbbbr',
    objective: 'Release one red ball and then all of the blue balls.'
  },
  {
    id: 5,
    name: 'Entropy',
    code: '-C1GD1FE6EF1DG0CF1DG0CF1DG0CF1DK_II0J2A6A7A4A8A',
    trigger: 'left',
    output: 'rbrbrbrbrbrbrbrb',
    objective: 'Make the pattern blue, red, blue, red, blue, red...'
  },
  {
    id: 6,
    name: 'Total Internal Reflection',
    code: '-KD1A0DKD1A0DKD1A0DKD1A0DKD1A0DK_II0C2A6F7A4A8A',
    trigger: 'left',
    output: 'rbrbrbrbrbrbrbrb',
    objective: 'Make the pattern blue, red, blue, red, blue, red...'
  },
  {
    id: 7,
    name: 'Path of Least Resistance',
    code: '-KKC6A6EKA6ID6FKB6HC6GKK_II0G2A6A7A4A8A',
    trigger: 'left',
    output: 'bbbbbbbb',
    objective: 'Create a path for the blue balls to reach the output with only 6 ramps.'
  },
  {
    id: 8,
    name: 'Depolarization',
    code: '-C1C0CD1A0DE2EKKKKKKKK_II0O2A6A7A4A8A',
    trigger: 'left',
    output: 'rbrbrbrbrbrbrbrb',
    objective: 'Make the pattern blue, red, blue, red, blue, red...'
  },
  {
    id: 9,
    name: 'Dimers',
    code: '-C2C0CD1A0DE6EKKKKKKKK_KK0S2A6A7A4A8A',
    trigger: 'left',
    output: 'rbbrbbrbbrbbrbb',
    objective: 'Make the pattern blue, blue, red, blue, blue, red...'
  },
  {
    id: 10,
    name: 'Double Bond',
    code: '-C2C3CKE6EKKKKKKKK_II0W2A6A7A4A8A',
    trigger: 'left',
    output: 'rrbbrrbbrrbbrrbbrrbbrrbbrrbbrrbb',
    objective: 'Make the pattern blue, blue, red, red, blue, blue, red, red...'
  },
  {
    id: 11,
    name: 'Selectivity',
    code: '-KKE2EKKKA3A3A3A3A3AKKKK_CA0P2A6A7A4A8A',
    trigger: 'left',
    objective: 'Flip bits 2 and 5 to the right.'
  },
  {
    id: 12,
    name: 'Duality',
    code: '-C1GD1FE2EKKKG0CF0DE7EKK_II0D2A6A7A4A8A',
    trigger: 'left',
    objective: 'Intercept a blue ball.'
  },
  {
    id: 13,
    name: 'Duality - Part 2',
    code: '-C1GD1FE2EF1DG1CH0BG0CF0DE7EKK_I0M2A6A7A4A8A',
    trigger: 'left',
    objective: 'Intercept a red ball.'
  },
  {
    id: 14,
    name: 'Duality - Part 3',
    code: '-KKE2EKKKKKE7EKK_II0U2A6A7A4A8A',
    trigger: 'left',
    objective: 'If the machine starts with bit A pointing to the left, intercept a blue ball. Otherwise, intercept a red ball.'
  },
  {
    id: 15,
    name: 'Inversion',
    code: '-C2C0CD1A0DE7EKKKKKE2EKK_II0L2A6C7A4A8A',
    trigger: 'left',
    objective: ' If bit A starts to the left, intercept a blue ball. If bit A starts to the right, intercept a red ball.'
  },
  {
    id: 16,
    name: 'Termination',
    code: '-C3GB1HC3GB7HKKKKKKK_II0K2A6A7A4A8A',
    trigger: 'left',
    output: 'bbb',
    objective: 'Let only 3 blue balls reach the bottom and catch the 4th ball in the interceptor.'
  },
  {
    id: 17,
    name: 'Fixed Ratio',
    code: '-C3C3CD0A1DC2C3CF7DKKKKKKK_II2A6A7A4A8A',
    trigger: 'left',
    output: 'rrrbbb',
    objective: 'Make the pattern blue, blue, blue, red, red, red.'
  },
  {
    id: 18,
    name: 'Entanglement',
    code: '-KKE2EKE2EKC7C7CKKKK_II0H2A6A7A4A8A',
    trigger: 'left',
    objective: ' If the top bit AND the bottom bit start pointed to the right, put a ball in interceptor T. Otherwise put a ball in interceptor F.'
  },
  {
    id: 19,
    name: 'Entanglement',
    code: '-KKE2EKE2EKKKKKE7E_II2A6C7A4A8A',
    trigger: 'left',
    objective: 'If the top bit AND the bottom bit start pointed to the right, intercept a blue ball. Otherwise, intercept a red ball.'
  },
  {
    id: 20,
    name: 'Symbiosis',
    code: '-KKE2EKE2EKKKKKE7E_II2A6C7A4A8A',
    trigger: 'left',
    objective: 'If the top bit OR the bottom bit start pointed to the right, intercept a blue ball. Otherwise, intercept a red ball.'
  },
  {
    id: 21,
    name: 'Quantum Number',
    code: '-C3GB1A1FC3GB1A1FC3GB1A1FC3GB1A1FC1GD1FK_II0F2A6A7A4A8A',
    trigger: 'left',
    objective: ' Use register A to count the number of blue balls. (Use 15 or fewer balls.)'
  },
  {
    id: 22,
    name: 'Depletion',
    code: '-C2GB0A0FC2GB0A0FC2GB0A0FC2GB0A0FC0GB0HK_II0E2A6A7A4A8A',
    trigger: 'left',
    objective: 'Register A starts at 15. Subtract the number of blue balls from the register. (Use 15 or fewer balls.)'
  },
  {
    id: 23,
    name: 'Tetrad',
    code: '-C2GB0A0FA1A2GB0A0FA1A2GB0A7FA1IB0HA1IB0HK_II0A2A6A7A4A8A',
    trigger: 'left',
    output: 'bbbb',
    objective: 'Let exactly 4 blue balls reach the end. (Intercept the 5th.)'
  },
  {
    id: 24,
    name: 'Ennead',
    code: '-C2GKC2GKC2GKC2GKKKK_MM0O2A6A7B4A8A',
    trigger: 'left',
    output: 'bbbbbbbbb',
    objective: 'Let exactly 9 blue balls reach the end. (Intercept the 10th.)'
  },
  {
    id: 25,
    name: 'Regular Expression',
    code: '-KKKKKKKKKKK_II2F6A7B4A8A',
    trigger: 'left',
    output: 'rrrbbbbbbb',
    objective: 'Generate the required pattern.'
  },
  {
    id: 26,
    name: 'Nucleus',
    code: '-G2CH7BKKKKKKKKK_KK2C6C7A4A8A',
    trigger: 'left',
    output: 'bbbbrbbbb',
    objective: 'Generate the required pattern.'
  },
  {
    id: 27,
    name: 'Reflection',
    code: '-G2CB2HE2EB2HE2EB2HE2EB2HE2EKK_II2B6A7B4A8A',
    objective: 'Reverse the direction of each of the 9 starting bits, regardless of the direction they point to start.'
  },
  {
    id: 28,
    name: 'Latch',
    code: '-C1C0CD1A0DE4EKC1C0CD0A1DC1C0CD0A1DC1C0CD0A1DK_II0B2A6A7A4B8B',
    trigger: 'left',
    output: 'bbbbbbbb',
    objective: 'Release only the blue balls.'
  },
  {
    id: 29,
    name: 'One Shot Switch',
    code: '-C4GKKKKKKKKKK_II2A6B7A4B8B',
    trigger: 'left',
    output: 'bbbbbbbrb',
    objective: 'Release a blue ball, a red ball, and then the rest of the blue balls.'
  },
  {
    id: 30,
    name: 'Overflow',
    code: '-C3GKC3GKC3GB5HKKKKK_UA0O2A6A7A4B8B',
    trigger: 'left',
    objective: 'Count the blue balls in register A. If there are more than 7, gear bit OV must flip right (and stay right) to indicate the overflow.'
  },
];