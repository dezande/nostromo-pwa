// Faux module audio pour les tests : jsdom ne connaît pas Web Audio.
export const audio = {
  init: jest.fn(),
  startMusic: jest.fn(),
  stopMusic: jest.fn(),
  setMusicVolume: jest.fn(),
  setSfxVolume: jest.fn(),
  duck: jest.fn(),
  beep: jest.fn(),
  tick: jest.fn(),
  siren: jest.fn(),
  slam: jest.fn(),
  alien: jest.fn(),
  victory: jest.fn(),
  musicVolume: 0.6,
  playing: false,
  state: "running",
};
