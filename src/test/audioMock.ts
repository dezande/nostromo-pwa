// Faux module audio pour les tests : jsdom ne connaît pas Web Audio.
export const audio = {
  init: jest.fn(),
  startMusic: jest.fn(),
  stopMusic: jest.fn(),
  setMusicVolume: jest.fn(),
  setSfxVolume: jest.fn(),
  beep: jest.fn(),
  tick: jest.fn(),
  slam: jest.fn(),
  xenomorph: jest.fn(),
  victory: jest.fn(),
  startAlert: jest.fn(),
  stopAlert: jest.fn(),
  previewAlert: jest.fn(),
  playing: false,
  state: "running",
};
