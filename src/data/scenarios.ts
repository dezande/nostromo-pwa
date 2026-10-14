// Textes des trois scénarios : « Entraînement » (Psychic Agent, par défaut), « Recrutement » (jeu de rôle) et « Infiltré ».
// Les règles sont projetées sur les moniteurs de la salle de briefing : titres courts et puces, comme un support
// de présentation ; la voix (l'instructeur, le RH) reste au MJ.
// La partie elle-même est la même ; seuls les panneaux d'accueil, les règles et les rapports de fin changent.
import type { RuleName } from "../components/RuleScenes";
import type { Scenario } from "../state/settings";
import type { BriefingPanel } from "../state/ui";

/** Règle affichée sur un moniteur : titre, scène animée, puces ([[…]] = passage censuré). */
export interface Rule { id: string; title: string; scene: RuleName; points: string[] }

/** Rapport de fin de partie ; {room} est remplacé par le nom de la salle. */
export interface Report {
  header: string;
  title: string;
  status?: string;
  lines: string[];
  /** Tampon apposé en bas du rapport. */
  stamp: string;
  /** Message d'une autre source, affiché à part sous le rapport. */
  note?: { from: string; text: string };
}

export interface ScenarioText {
  /** Premier panneau après « Démarrer », et celui où ramène « Retour » depuis la première règle. */
  firstPanel: BriefingPanel;
  lastPanel: BriefingPanel;
  /** Nom dans les Réglages et sous-titre de l'accueil. */
  name: string;
  description: string;
  homeLine: string;
  /** En-tête des panneaux de règles. */
  rulesHeader: string;
  rulesIntro: string;
  rules: Rule[];
  rulesSign: string;
  /** Question avant d'abandonner la partie. */
  quitQuestion: string;
  win: Report;
  dead: Report;
}

const TRAINING: ScenarioText = {
  firstPanel: "welcome",
  lastPanel: "welcome",
  name: "Entraînement",
  description: "Psychic Agent en formation à bord du Nostromo II. Scénario d'origine.",
  homeLine: "Simulation d'intrusion alien pour Psychic Agents.",
  rulesHeader: "ALIEN INTRUSION PROTOCOL",
  rulesIntro: "Protocole établi par la compagnie. Seul le Coordinateur en connaît l'ordre de fermeture.",
  rules: [
    {
      id: "start", title: "POSITION DE DÉPART", scene: "start",
      points: [
        "Chaque agent choisit la salle où il commence l'entraînement.",
        "Changement de salle possible jusqu'à la validation.",
      ],
    },
    {
      id: "moves", title: "DÉPLACEMENTS", scene: "moves",
      points: [
        "Avant chaque fermeture, le Coordinateur tire une carte W.Y.C. : elle fixe le nombre de déplacements imposés.",
        "Un déplacement = une salle voisine, par une porte, un ascenseur ou un passage de ventilation.",
        "Ascenseurs et conduits d'aération : lieux de passage, arrêt interdit.",
      ],
    },
    {
      id: "close", title: "FERMETURE", scene: "close",
      points: [
        "Le Coordinateur annonce la salle fermée.",
        "Un xénomorphe y est introduit.",
        "Tout agent présent dans cette salle est éliminé.",
      ],
    },
    {
      id: "end", title: "FIN DE L'ENTRAÎNEMENT", scene: "end",
      points: [
        "Huit fermetures successives.",
        "Survivants : les agents présents dans la dernière salle restée ouverte.",
      ],
    },
  ],
  rulesSign: "Fiez-vous à votre instinct, Agents.",
  quitQuestion: "Abandonner l'entraînement en cours ?",
  win: {
    header: "RAPPORT D'ENTRAÎNEMENT",
    title: "AGENT SURVIVANT",
    stamp: "APTITUDE VALIDÉE",
    status: "ENTRAÎNEMENT TERMINÉ.",
    lines: [
      "Félicitations, Agent. Vous avez survécu à toutes les fermetures du protocole.",
      "Position finale : {room}. Vos capacités de Psychic Agent sont confirmées : vous avez ressenti chaque présence xénomorphe à bord du vaisseau-base.",
      "La compagnie vous remercie de votre engagement. Votre dossier est transmis pour une première mission.",
    ],
  },
  dead: {
    header: "RAPPORT D'INCIDENT",
    title: "AGENT ÉLIMINÉ",
    stamp: "DOSSIER CLOS",
    lines: [
      "Fermeture de la salle : {room}. Un spécimen y a été introduit. Vous vous y trouviez.",
      "Conformément à votre contrat, les risques liés à cet entraînement étaient connus et acceptés.",
      "La compagnie regrette la perte de son agent. Un nouveau candidat va être sélectionné.",
    ],
  },
};

const RECRUITMENT: ScenarioText = {
  firstPanel: "hr",
  lastPanel: "contract",
  name: "Recrutement",
  description: "Jeu de rôle (3d6) : un candidat signe un contrat très bien payé, puis passe l'examen d'aptitude. Le MJ joue le RH et le Coordinateur.",
  homeLine: "Examen d'aptitude · Recrutement Weyland-Yutani.",
  rulesHeader: "EXAMEN D'APTITUDE · COORDINATEUR",
  rulesIntro: "Candidats, regardez l'écran. Déroulement établi par la [[Division scientifique de la]] compagnie. Seul le Coordinateur connaît l'ordre de fermeture.",
  rules: [
    {
      id: "start", title: "POSITION DE DÉPART", scene: "start",
      points: [
        "Chaque candidat choisit la salle où il commence l'examen [[sous observation]].",
        "Changement de salle possible jusqu'à la validation.",
      ],
    },
    {
      id: "moves", title: "DÉPLACEMENTS", scene: "moves",
      points: [
        "Avant chaque fermeture, le Coordinateur tire une carte W.Y.C. : elle fixe le nombre de déplacements imposés.",
        "Un déplacement = une salle voisine, par une porte, un ascenseur ou un passage de ventilation.",
        "Ascenseurs et conduits d'aération : lieux de passage, arrêt interdit. [[Ne pas s'attarder près des grilles.]]",
      ],
    },
    {
      id: "close", title: "FERMETURE", scene: "close",
      points: [
        "Le Coordinateur annonce la salle fermée.",
        "Un élément de test [[XX-121]] y est introduit.",
        "Tout candidat présent dans cette salle est disqualifié [[définitivement]].",
      ],
    },
    {
      id: "end", title: "FIN DE L'EXAMEN", scene: "end",
      points: [
        "Huit fermetures successives.",
        "Candidats retenus : ceux présents dans la dernière salle restée ouverte. [[Les autres ne sont pas rapatriés.]]",
      ],
    },
  ],
  rulesSign: "Restez calmes et suivez les instructions, Candidats.",
  quitQuestion: "Abandonner l'examen en cours ?",
  win: {
    header: "RAPPORT D'EXAMEN",
    title: "CANDIDAT RETENU",
    stamp: "EMBAUCHE VALIDÉE",
    status: "EXAMEN D'APTITUDE RÉUSSI.",
    lines: [
      "Félicitations. Vous avez satisfait à toutes les étapes de l'examen.",
      "Position finale : {room}. Votre sang-froid a été noté avec intérêt par le Coordinateur.",
      "Le Service des ressources humaines prendra contact avec vous pour votre affectation. Bienvenue à la Weyland-Yutani.",
    ],
  },
  dead: {
    header: "RAPPORT D'INCIDENT",
    title: "CANDIDATURE CLOSE",
    stamp: "CANDIDATURE REJETÉE",
    lines: [
      "Fermeture de la salle : {room}. Un élément de test [[XX-121]] y a été introduit. Vous vous y trouviez.",
      "Conformément à l'article 13 de votre contrat, la compagnie décline toute responsabilité.",
      "Le poste reste à pourvoir. [[Dépouille non récupérable.]] La compagnie remercie votre famille pour sa compréhension.",
    ],
  },
};

const INFILTRATED: ScenarioText = {
  firstPanel: "email",
  lastPanel: "email",
  name: "Infiltré",
  description: "Vous êtes le Lieutenant D.R., agent de la C.R.F. infiltré. La direction sait tout : pour vous punir, elle vous envoie à l'entraînement.",
  homeLine: "Session disciplinaire · Agent infiltré.",
  rulesHeader: "SESSION DISCIPLINAIRE · ALIEN INTRUSION PROTOCOL",
  rulesIntro: "Session ordonnée par la Direction de la sécurité. Protocole établi par la compagnie. Seul le Coordinateur en connaît l'ordre de fermeture.",
  rules: TRAINING.rules.map(rule => ({
    ...rule,
    title: rule.title.replace("L'ENTRAÎNEMENT", "LA SESSION"),
    points: rule.points.map(point => point.replace("l'entraînement", "la session")),
  })),
  rulesSign: "Fiez-vous à votre instinct, Agents.",
  quitQuestion: "Abandonner la session en cours ?",
  win: {
    header: "RAPPORT DE LA DIRECTION DE LA SÉCURITÉ",
    title: "L'AGENT INFILTRÉ A SURVÉCU",
    stamp: "RÉSULTAT NON CONFORME",
    status: "SESSION DISCIPLINAIRE TERMINÉE.",
    lines: [
      "Position finale : {room}. L'individu « Lieutenant D.R. » a survécu à toutes les fermetures du protocole.",
      "Résultat non conforme aux attentes de la Direction. [[Procédure 7-B déclenchée.]]",
    ],
    note: { from: "MESSAGE C.R.F. DÉCRYPTÉ", text: "Bien reçu, Lieutenant. Exfiltration organisée cette nuit, sas 3. Gardez les protocoles." },
  },
  dead: {
    header: "RAPPORT DE LA DIRECTION DE LA SÉCURITÉ",
    title: "SANCTION APPLIQUÉE",
    stamp: "SANCTION EXÉCUTÉE",
    lines: [
      "Fermeture de la salle : {room}. Un spécimen y a été introduit. L'individu « Lieutenant D.R. » s'y trouvait.",
      "La décision disciplinaire est exécutée. Aucune trace ne sera transmise à la C.R.F.",
      "Dossier clos. [[Documents dérobés récupérés sur la dépouille.]]",
    ],
  },
};

export const SCENARIOS: Record<Scenario, ScenarioText> = { training: TRAINING, recruitment: RECRUITMENT, infiltrated: INFILTRATED };
