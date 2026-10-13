// Icônes en SVG : même taille et même centrage quelle que soit la police du style d'écran.
const PATHS = {
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path stroke-width="3.4" stroke-linecap="butt"
        d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  warn: <><path d="M12 3L22 20H2Z" /><path d="M12 9v5M12 16.5v1.5" /></>,
  undo: <><path d="M9 15L4 10l5-5" /><path d="M4 10h11a5 5 0 0 1 0 10h-4" /></>,
  reset: <><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" /><path d="M4 3.5v5h5" /></>,
  play: <path d="M7 4l13 8-13 8Z" fill="currentColor" />,
  check: <path d="M4 12.5l5 5L20 6.5" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return (
    <span class="ic" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter">
        {PATHS[name]}
      </svg>
    </span>
  );
}
