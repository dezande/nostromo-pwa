jest.mock("../audio/audio", () => require("../test/audioMock"));

import { audio } from "../audio/audio";
import { expired, formatTime, remaining, startTimer, stopTimer } from "./timer";

beforeEach(() => { jest.useFakeTimers(); stopTimer(); });
afterEach(() => { stopTimer(); jest.useRealTimers(); });

test("format mm:ss", () => {
  expect(formatTime(300)).toBe("05:00");
  expect(formatTime(59)).toBe("00:59");
  expect(formatTime(0)).toBe("00:00");
});

test("5 minutes, puis alarme une seule fois, sans s'arrêter en négatif", () => {
  startTimer();
  expect(remaining.value).toBe(300);
  jest.advanceTimersByTime(60_000);
  expect(remaining.value).toBe(240);
  expect(audio.alarm).not.toHaveBeenCalled();
  jest.advanceTimersByTime(240_000);
  expect(remaining.value).toBe(0);
  expect(expired.value).toBe(true);
  jest.advanceTimersByTime(30_000);
  expect(remaining.value).toBe(0);
  expect(audio.alarm).toHaveBeenCalledTimes(1);
});

test("arrêt : plus de minuteur affiché", () => {
  startTimer();
  jest.advanceTimersByTime(5_000);
  stopTimer();
  expect(remaining.value).toBeNull();
  expect(expired.value).toBe(false);
});
