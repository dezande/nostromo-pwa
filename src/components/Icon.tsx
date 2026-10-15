// Icônes en SVG (trait de la couleur du style d'écran) et boutons « icône seule ».
import type { ButtonHTMLAttributes } from "preact";

export const ICONS = {
  valider: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  annuler: <path d="M6 6l12 12M18 6L6 18" />,
  pasArriere: <><path d="M9 7L4.5 11.5 9 16" /><path d="M5 11.5h9a5 5 0 0 1 0 10h-3" /></>,
  retour: <path d="M15 5l-7 7 7 7" />,
  continuer: <path d="M9 5l7 7-7 7" />,
  demarrer: <path d="M7 4.5v15L19.5 12z" />,
  reglages: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1" />
    </>
  ),
  // Dé « à traits » sur sa face 4 (tutoriel du 3D6 Système)
  tuto: <><rect x="4" y="4" width="16" height="16" rx="2.5" /><path d="M8 8.5h4.5M8 12h4.5M8 15.5h4.5M16 8v8" /></>,
  // Livre ouvert (sources et crédits)
  sources: <><path d="M12 6.5C10 5 7 4.5 3.5 5v13.5C7 18 10 18.5 12 20c2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" /><path d="M12 6.5V20" /></>,
  accueil: <><path d="M3.5 11.5L12 4l8.5 7.5" /><path d="M6 10v9.5h4.5v-5h3v5H18V10" /></>,
  son: <><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></>,
  muet: <><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M16 9.5l5 5M21 9.5l-5 5" /></>,
  // Documents des scénarios : symboles du sexe (mêmes tracés que fiches/pretire.js, et pas d'emoji coloré),
  // aide du Superviseur (bloc-notes), guide (livre fermé), cartes des rôles (deux cartes), PDF (téléchargement)
  homme: <><circle cx="10" cy="14" r="6" /><path d="M14.3 9.7L21 3M15 3h6v6" /></>,
  femme: <><circle cx="12" cy="9" r="6" /><path d="M12 15v7M8.5 19h7" /></>,
  aide: <><rect x="5" y="4.5" width="14" height="16" /><path d="M9 3v3M15 3v3M8.5 10.5h7M8.5 14h7M8.5 17.5h4" /></>,
  guide: <><path d="M5 4h12.5v16H5z" /><path d="M8 4v16M11 8.5h4" /></>,
  roles: <><rect x="3.5" y="7" width="10" height="14" rx="1" /><path d="M8 7V3h10.5v14h-5" /></>,
  pdf: <path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14" />,
  // Texte en miroir (liseuse des documents du Superviseur) : un axe et ses deux reflets
  miroir: <><path d="M12 3v18" stroke-dasharray="2 2" /><path d="M9 7.5L3.5 12 9 16.5z" /><path d="M15 7.5l5.5 4.5-5.5 4.5z" /></>,
};

export type IconName = keyof typeof ICONS;

export function Icon({ name }: { name: IconName }) {
  return (
    <span class="ic" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
        {ICONS[name]}
      </svg>
    </span>
  );
}

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "icon" | "label"> & {
  icon: IconName;
  /** Nom du bouton, dans la langue de l'app : lu par les lecteurs d'écran et affiché au survol. */
  label: string;
  primary?: boolean;
};

/** Bouton carré, icône seule, bordé et éclairé de la couleur du style d'écran. */
export function IconButton({ icon, label, primary, title, class: cls, ...props }: ButtonProps) {
  return (
    <button type="button" {...props} class={["icon-btn", primary && "primary", cls].filter(Boolean).join(" ")}
      aria-label={label} title={title ?? label}>
      <Icon name={icon} />
    </button>
  );
}
