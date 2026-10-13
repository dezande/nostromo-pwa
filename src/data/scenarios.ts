// Textes des deux scénarios : « Entraînement » (Psychic Agent, par défaut) et « Recrutement » (jeu de rôle).
// La partie elle-même est la même ; seuls les panneaux d'accueil, les règles et les rapports de fin changent.
import type { RuleName } from "../components/RuleScenes";
import type { Scenario } from "../state/settings";
import type { BriefingPanel } from "../state/ui";

export interface Rule { id: string; title: string; scene: RuleName; text: string }

/** Rapport de fin de partie ; {room} est remplacé par le nom de la salle. */
export interface Report {
  header: string;
  title: string;
  status?: string;
  lines: string[];
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
  rulesIntro: "Le protocole de cet entraînement a été établi par la compagnie. Seul le Coordinateur en connaît l'ordre de fermeture.",
  rules: [
    {
      id: "start", title: "POSITION DE DÉPART", scene: "start",
      text: "Choisissez la salle où vous commencez l'entraînement. Vous pouvez changer d'avis tant que vous n'avez pas validé.",
    },
    {
      id: "moves", title: "DÉPLACEMENTS", scene: "moves",
      text: "Avant chaque fermeture, le Coordinateur tire une carte W.Y.C. Elle indique le nombre de déplacements imposés. Un déplacement vous fait passer dans une salle voisine, par une porte, un ascenseur ou un passage de ventilation. Les ascenseurs et les conduits d'aération sont des lieux de passage : vous ne pouvez pas vous y arrêter.",
    },
    {
      id: "close", title: "FERMETURE", scene: "close",
      text: "Le Coordinateur annonce la salle fermée. Un xénomorphe y est introduit. Tout agent présent dans cette salle est éliminé.",
    },
    {
      id: "end", title: "FIN DE L'ENTRAÎNEMENT", scene: "end",
      text: "Huit fermetures se succèdent. Seuls les agents qui se trouvent dans la dernière salle restée ouverte survivent.",
    },
  ],
  rulesSign: "Fiez-vous à votre instinct, Agent.",
  quitQuestion: "Abandonner l'entraînement en cours ?",
  win: {
    header: "RAPPORT D'ENTRAÎNEMENT",
    title: "AGENT SURVIVANT",
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
  rulesIntro: "Je suis votre Coordinateur. Le déroulement de cet examen a été établi par la [[Division scientifique de la]] compagnie. Moi seul en connais l'ordre de fermeture.",
  rules: [
    {
      id: "start", title: "POSITION DE DÉPART", scene: "start",
      text: "Choisissez la salle où vous commencez l'examen [[sous observation]]. Vous pouvez changer d'avis tant que vous n'avez pas validé.",
    },
    {
      id: "moves", title: "DÉPLACEMENTS", scene: "moves",
      text: "Avant chaque fermeture, je tire une carte W.Y.C. Elle indique le nombre de déplacements imposés. Un déplacement vous fait passer dans une salle voisine, par une porte, un ascenseur ou un passage de ventilation. Les ascenseurs et les conduits d'aération sont des lieux de passage : vous ne pouvez pas vous y arrêter. [[Ne vous attardez pas près des grilles.]]",
    },
    {
      id: "close", title: "FERMETURE", scene: "close",
      text: "J'annonce la salle fermée. Un élément de test [[XX-121]] y est introduit. Tout candidat présent dans cette salle est disqualifié [[définitivement]].",
    },
    {
      id: "end", title: "FIN DE L'EXAMEN", scene: "end",
      text: "Huit fermetures se succèdent. Seuls les candidats qui se trouvent dans la dernière salle restée ouverte sont retenus. [[Les autres ne sont pas rapatriés.]]",
    },
  ],
  rulesSign: "Restez calme et suivez mes instructions, Candidat.",
  quitQuestion: "Abandonner l'examen en cours ?",
  win: {
    header: "RAPPORT D'EXAMEN",
    title: "CANDIDAT RETENU",
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
    lines: [
      "Fermeture de la salle : {room}. Un élément de test [[XX-121]] y a été introduit. Vous vous y trouviez.",
      "Conformément à l'article 13 de votre contrat, la compagnie décline toute responsabilité.",
      "Le poste reste à pourvoir. [[Dépouille non récupérable.]] La compagnie remercie votre famille pour sa compréhension.",
    ],
  },
};

const INFILTRATED: ScenarioText = {
  firstPanel: "archives",
  lastPanel: "email",
  name: "Infiltré",
  description: "Vous êtes le Lieutenant D.R., agent de la C.R.F. infiltré. La direction sait tout : pour vous punir, elle vous envoie à l'entraînement.",
  homeLine: "Session disciplinaire · Agent infiltré.",
  rulesHeader: "SESSION DISCIPLINAIRE · ALIEN INTRUSION PROTOCOL",
  rulesIntro: "Session ordonnée par la Direction de la sécurité. Le protocole a été établi par la compagnie. Seul le Coordinateur en connaît l'ordre de fermeture.",
  rules: TRAINING.rules.map(rule => ({
    ...rule,
    title: rule.title.replace("L'ENTRAÎNEMENT", "LA SESSION"),
    text: rule.text.replace("l'entraînement", "la session"),
  })),
  rulesSign: "Fiez-vous à votre instinct, Lieutenant.",
  quitQuestion: "Abandonner la session en cours ?",
  win: {
    header: "RAPPORT DE LA DIRECTION DE LA SÉCURITÉ",
    title: "L'AGENT INFILTRÉ A SURVÉCU",
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
    lines: [
      "Fermeture de la salle : {room}. Un spécimen y a été introduit. L'individu « Lieutenant D.R. » s'y trouvait.",
      "La décision disciplinaire est exécutée. Aucune trace ne sera transmise à la C.R.F.",
      "Dossier clos. [[Documents dérobés récupérés sur la dépouille.]]",
    ],
  },
};

export const SCENARIOS: Record<Scenario, ScenarioText> = { training: TRAINING, recruitment: RECRUITMENT, infiltrated: INFILTRATED };
