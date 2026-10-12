import { announcementFor, durationText } from "./announcements";

const ALL = { every30s: true, finalCountdown: true };

test("durées en toutes lettres", () => {
  expect(durationText(300)).toBe("5 minutes");
  expect(durationText(270)).toBe("4 minutes 30 secondes");
  expect(durationText(90)).toBe("1 minute 30 secondes");
  expect(durationText(60)).toBe("1 minute");
  expect(durationText(30)).toBe("30 secondes");
  expect(durationText(1)).toBe("1 seconde");
});

test("phrases de début, toutes les 30 s et de fin", () => {
  expect(announcementFor(300, 300, ALL)).toBe("Alerte. Entraînement en cours. Il reste 5 minutes.");
  expect(announcementFor(270, 300, ALL)).toBe("Il reste 4 minutes 30 secondes.");
  expect(announcementFor(60, 300, ALL)).toBe("Il reste 1 minute.");
  expect(announcementFor(30, 300, ALL)).toBe("Il reste 30 secondes.");
  expect(announcementFor(0, 300, ALL)).toBe("Temps écoulé. Fin de l'entraînement.");
});

test("calendrier : une annonce toutes les 30 s (10 en tout), puis 10 à 1, puis la fin", () => {
  const said = [];
  for (let s = 300; s >= 0; s--) { const t = announcementFor(s, 300, ALL); if (t) said.push([s, t]); }
  const every30 = said.filter(([s]) => (s as number) % 30 === 0 && s !== 0).map(([s]) => s);
  expect(every30).toEqual([300, 270, 240, 210, 180, 150, 120, 90, 60, 30]);
  expect(said.slice(-11).map(([, t]) => t)).toEqual(["10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "Temps écoulé. Fin de l'entraînement."]);
  // rien entre deux annonces
  expect(announcementFor(299, 300, ALL)).toBeNull();
  expect(announcementFor(45, 300, ALL)).toBeNull();
});

test("réglages : sans voix toutes les 30 s, sans décompte", () => {
  const none = { every30s: false, finalCountdown: false };
  expect(announcementFor(300, 300, none)).toBeNull();
  expect(announcementFor(30, 300, none)).toBeNull();
  expect(announcementFor(5, 300, none)).toBeNull();
  expect(announcementFor(0, 300, none)).toBe("Temps écoulé. Fin de l'entraînement.");
  expect(announcementFor(5, 300, { every30s: false, finalCountdown: true })).toBe("5");
  expect(announcementFor(10, 300, { every30s: true, finalCountdown: false })).toBeNull();
});
