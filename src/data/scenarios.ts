// Textes des trois scénarios : « Sixième sens » (Psychic Agent, par défaut), « Une simple formalité » (jeu de rôle) et « Session disciplinaire ».
// Les règles sont projetées sur les moniteurs de la salle de briefing : titres courts et puces, comme un support
// de présentation ; la voix (l'instructeur, le RH) reste au Superviseur.
// La partie elle-même est la même ; seuls les panneaux d'accueil, les règles et les rapports de fin changent.
import type { RuleName } from "../components/RuleScenes";
import type { Scenario } from "../state/settings";
import type { BriefingPanel } from "../state/ui";
import { lang, type Lang } from "../i18n";

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
  /** Choix au lancement : nom et ligne courte sur la carte, description sous les cartes. */
  name: string;
  description: string;
  homeLine: string;
  /** Difficulté pour le joueur et durée indicative, affichées sur la carte et dans le guide du Superviseur. */
  level: string;
  duration: string;
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
  name: "Sixième sens",
  description: "Psychic Agent en formation à bord du Nostromo II. Scénario d'origine.",
  homeLine: "Simulation d'intrusion alien pour Psychic Agents.",
  level: "Débutant",
  duration: "20–30 min",
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
  name: "Une simple formalité",
  description: "Jeu de rôle : un candidat signe un contrat très bien payé, puis passe l'examen d'aptitude. Le Superviseur joue le RH et le Coordinateur.",
  homeLine: "Recrutement Weyland-Yutani.",
  level: "Intermédiaire",
  duration: "30–45 min",
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
  name: "Session disciplinaire",
  description: "Vous êtes le Lieutenant D.R., agent infiltré de la C.R.F. (Civil Resistance Force). La direction sait tout : pour vous punir, elle vous envoie à l'entraînement.",
  homeLine: "Agent C.R.F. démasqué.",
  level: "Confirmé",
  duration: "30 min",
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

const TRAINING_EN: ScenarioText = {
  ...TRAINING,
  name: "Sixth Sense",
  description: "Psychic Agent in training aboard Nostromo II. The original scenario.",
  homeLine: "Alien intrusion simulation for Psychic Agents.",
  level: "Beginner",
  rulesIntro: "Protocol set by the company. Only the Coordinator knows the sealing order.",
  rules: [
    {
      id: "start", title: "STARTING POSITION", scene: "start",
      points: [
        "Each agent chooses the room where they start the training.",
        "You may change rooms until you confirm.",
      ],
    },
    {
      id: "moves", title: "MOVES", scene: "moves",
      points: [
        "Before each sealing, the Coordinator draws a W.Y.C. card: it sets the number of mandatory moves.",
        "One move = one adjacent room, through a door, a lift or a ventilation passage.",
        "Lifts and air ducts: transit only, no stopping.",
      ],
    },
    {
      id: "close", title: "SEALING", scene: "close",
      points: [
        "The Coordinator announces the sealed room.",
        "A xenomorph is released into it.",
        "Any agent inside that room is eliminated.",
      ],
    },
    {
      id: "end", title: "END OF TRAINING", scene: "end",
      points: [
        "Eight successive sealings.",
        "Survivors: the agents in the last room left open.",
      ],
    },
  ],
  rulesSign: "Trust your instinct, Agents.",
  quitQuestion: "Abandon the current training?",
  win: {
    header: "TRAINING REPORT",
    title: "AGENT SURVIVED",
    stamp: "APTITUDE CONFIRMED",
    status: "TRAINING COMPLETE.",
    lines: [
      "Congratulations, Agent. You survived every sealing of the protocol.",
      "Final position: {room}. Your Psychic Agent abilities are confirmed: you sensed every xenomorph presence aboard the base ship.",
      "The company thanks you for your commitment. Your file is being forwarded for a first mission.",
    ],
  },
  dead: {
    header: "INCIDENT REPORT",
    title: "AGENT ELIMINATED",
    stamp: "FILE CLOSED",
    lines: [
      "Room sealed: {room}. A specimen was released into it. You were inside.",
      "Under the terms of your contract, the risks of this training were known and accepted.",
      "The company regrets the loss of its agent. A new candidate will be selected.",
    ],
  },
};

const RECRUITMENT_EN: ScenarioText = {
  ...RECRUITMENT,
  name: "A Mere Formality",
  description: "Role-playing: a candidate signs a very well-paid contract, then takes the aptitude test. The Supervisor plays HR and the Coordinator.",
  homeLine: "Weyland-Yutani recruitment.",
  level: "Intermediate",
  rulesHeader: "APTITUDE TEST · COORDINATOR",
  rulesIntro: "Candidates, look at the screen. Procedure set by the [[Science Division of the]] company. Only the Coordinator knows the sealing order.",
  rules: [
    {
      id: "start", title: "STARTING POSITION", scene: "start",
      points: [
        "Each candidate chooses the room where they start the test [[under observation]].",
        "You may change rooms until you confirm.",
      ],
    },
    {
      id: "moves", title: "MOVES", scene: "moves",
      points: [
        "Before each sealing, the Coordinator draws a W.Y.C. card: it sets the number of mandatory moves.",
        "One move = one adjacent room, through a door, a lift or a ventilation passage.",
        "Lifts and air ducts: transit only, no stopping. [[Do not linger near the grates.]]",
      ],
    },
    {
      id: "close", title: "SEALING", scene: "close",
      points: [
        "The Coordinator announces the sealed room.",
        "A test element [[XX-121]] is released into it.",
        "Any candidate inside that room is [[permanently]] disqualified.",
      ],
    },
    {
      id: "end", title: "END OF THE TEST", scene: "end",
      points: [
        "Eight successive sealings.",
        "Candidates retained: those in the last room left open. [[The others are not repatriated.]]",
      ],
    },
  ],
  rulesSign: "Stay calm and follow instructions, Candidates.",
  quitQuestion: "Abandon the current test?",
  win: {
    header: "TEST REPORT",
    title: "CANDIDATE RETAINED",
    stamp: "HIRING APPROVED",
    status: "APTITUDE TEST PASSED.",
    lines: [
      "Congratulations. You have completed every stage of the test.",
      "Final position: {room}. Your composure was noted with interest by the Coordinator.",
      "The Human Resources Department will contact you about your assignment. Welcome to Weyland-Yutani.",
    ],
  },
  dead: {
    header: "INCIDENT REPORT",
    title: "APPLICATION CLOSED",
    stamp: "APPLICATION REJECTED",
    lines: [
      "Room sealed: {room}. A test element [[XX-121]] was released into it. You were inside.",
      "Under article 13 of your contract, the company accepts no liability.",
      "The position remains open. [[Remains not recoverable.]] The company thanks your family for its understanding.",
    ],
  },
};

const INFILTRATED_EN: ScenarioText = {
  ...INFILTRATED,
  name: "Disciplinary Session",
  description: "You are Lieutenant D.R., undercover agent of the C.R.F. (Civil Resistance Force). Management knows everything: as punishment, they send you to training.",
  homeLine: "C.R.F. agent exposed.",
  level: "Experienced",
  rulesHeader: "DISCIPLINARY SESSION · ALIEN INTRUSION PROTOCOL",
  rulesIntro: "Session ordered by the Security Directorate. Protocol set by the company. Only the Coordinator knows the sealing order.",
  rules: TRAINING_EN.rules.map(rule => ({
    ...rule,
    title: rule.title.replace("END OF TRAINING", "END OF THE SESSION"),
    points: rule.points.map(point => point.replace("the training", "the session")),
  })),
  rulesSign: "Trust your instinct, Agents.",
  quitQuestion: "Abandon the current session?",
  win: {
    header: "SECURITY DIRECTORATE REPORT",
    title: "THE INFILTRATOR SURVIVED",
    stamp: "NON-COMPLIANT RESULT",
    status: "DISCIPLINARY SESSION COMPLETE.",
    lines: [
      "Final position: {room}. The individual “Lieutenant D.R.” survived every sealing of the protocol.",
      "Result not in line with Management's expectations. [[Procedure 7-B initiated.]]",
    ],
    note: { from: "DECRYPTED C.R.F. MESSAGE", text: "Received, Lieutenant. Extraction tonight, airlock 3. Keep the protocols." },
  },
  dead: {
    header: "SECURITY DIRECTORATE REPORT",
    title: "SANCTION ENFORCED",
    stamp: "SANCTION EXECUTED",
    lines: [
      "Room sealed: {room}. A specimen was released into it. The individual “Lieutenant D.R.” was inside.",
      "The disciplinary decision has been carried out. No record will reach the C.R.F.",
      "File closed. [[Stolen documents recovered from the remains.]]",
    ],
  },
};

/** Textes des scénarios, par langue. */
export const SCENARIOS: Record<Lang, Record<Scenario, ScenarioText>> = {
  fr: { training: TRAINING, recruitment: RECRUITMENT, infiltrated: INFILTRATED },
  en: { training: TRAINING_EN, recruitment: RECRUITMENT_EN, infiltrated: INFILTRATED_EN },
};

/** Identifiants des scénarios, dans l'ordre du choix au lancement. */
export const SCENARIO_IDS = Object.keys(SCENARIOS.fr) as Scenario[];

/** Textes d'un scénario dans la langue de l'app. */
export const scenarioText = (id: Scenario): ScenarioText => SCENARIOS[lang.value][id];
