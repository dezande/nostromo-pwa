// Tutoriel du 3D6 Système (jeu de rôle des fiches imprimables), ouvert depuis l'écran d'accueil.
// Une page par règle : un pictogramme (dessiné dans screens/Tutorial.tsx) et quelques lignes.
// Règles : 3D6 Système, François Cedelle, licence ORC (https://3d6.ovh/).

export type TutorialScene =
  | "test" | "succes" | "difficulte" | "avantage" | "critique"
  | "opposition" | "maitrise" | "pe" | "combat";

export interface TutorialPage {
  scene: TutorialScene;
  title: string;
  points: string[];
  /** Exemple tiré des fiches, affiché en bas de la page. */
  example?: string;
}

export const TUTORIAL: TutorialPage[] = [
  {
    scene: "test",
    title: "LE TEST",
    points: [
      "Le personnage tente quelque chose de risqué : on lance trois dés à six faces (3D6).",
      "On compare les dés à une caractéristique : Physique, Mental ou Social, notée de 1 à 5.",
    ],
    example: "Ressentir une présence derrière une cloison : test de Mental.",
  },
  {
    scene: "succes",
    title: "LES SUCCÈS",
    points: [
      "Chaque dé inférieur ou égal à la caractéristique compte pour 1 succès.",
      "Plus la caractéristique est haute, plus les succès sont faciles.",
    ],
    example: "Mental 4, les dés font 2, 4 et 6 : 2 succès.",
  },
  {
    scene: "difficulte",
    title: "LA DIFFICULTÉ",
    points: [
      "Le Superviseur annonce combien de succès il faut pour réussir.",
      "Facile 1 · Moyenne 2 · Difficile 3 · Extrême 4.",
    ],
    example: "Repérer une clause du contrat : Mental, Moyenne (2 succès).",
  },
  {
    scene: "avantage",
    title: "AVANTAGE ET DÉSAVANTAGE",
    points: [
      "Avantage : on lance 4 dés. Désavantage : on lance seulement 2 dés.",
      "Tous les dés comptent. Pas de cumul : un avantage et un désavantage s'annulent.",
    ],
    example: "Claustrophobe dans un conduit d'aération : désavantage.",
  },
  {
    scene: "critique",
    title: "LES CRITIQUES",
    points: [
      "Trois dés identiques (1-1-1 … 6-6-6) : c'est un critique.",
      "Valeur inférieure ou égale à la caractéristique : réussite critique. Au-dessus : échec critique.",
    ],
  },
  {
    scene: "opposition",
    title: "L'OPPOSITION",
    points: [
      "Deux personnages s'affrontent : chacun fait son test.",
      "Le plus de succès l'emporte. Égalité : on relance, avantage au joueur, ou match nul.",
    ],
    example: "Social de Kessler contre Social du candidat.",
  },
  {
    scene: "maitrise",
    title: "LES MAÎTRISES",
    points: [
      "Rang 1 : avantage au test.",
      "Rang 2 : un effet en plus dans l'histoire (souvent 1 PE).",
      "Rang 3 : un effet majeur.",
    ],
    example: "Athlétisme rang 2 pour courir d'une salle à l'autre.",
  },
  {
    scene: "pe",
    title: "LES POINTS D'ÉNERGIE",
    points: [
      "PE = Physique + Mental : la santé du corps et de l'esprit.",
      "1 ou 2 PE : affaibli (désavantage). 0 : inconscient. En dessous : état critique.",
    ],
    example: "Un test de peur raté : −1 PE.",
  },
  {
    scene: "combat",
    title: "LE COMBAT",
    points: [
      "Deux actions par tour. Attaquer : test de Physique, 1 succès suffit pour toucher.",
      "Dégâts = arme (1 à 5) + 1 par succès en plus − protection.",
    ],
  },
];

// Version anglaise.
export const TUTORIAL_EN: TutorialPage[] = [
  {
    scene: "test",
    title: "THE TEST",
    points: [
      "The character attempts something risky: roll three six-sided dice (3D6).",
      "Compare the dice to an attribute: Physical, Mental or Social, rated from 1 to 5.",
    ],
    example: "Sensing a presence behind a bulkhead: Mental test.",
  },
  {
    scene: "succes",
    title: "SUCCESSES",
    points: [
      "Each die less than or equal to the attribute counts as 1 success.",
      "The higher the attribute, the easier the successes.",
    ],
    example: "Mental 4, the dice show 2, 4 and 6: 2 successes.",
  },
  {
    scene: "difficulte",
    title: "DIFFICULTY",
    points: [
      "The Supervisor announces how many successes are needed to succeed.",
      "Easy 1 · Average 2 · Hard 3 · Extreme 4.",
    ],
    example: "Spotting a clause in the contract: Mental, Average (2 successes).",
  },
  {
    scene: "avantage",
    title: "ADVANTAGE AND DISADVANTAGE",
    points: [
      "Advantage: roll 4 dice. Disadvantage: roll only 2 dice.",
      "All dice count. No stacking: an advantage and a disadvantage cancel out.",
    ],
    example: "Claustrophobic in an air duct: disadvantage.",
  },
  {
    scene: "critique",
    title: "CRITICALS",
    points: [
      "Three identical dice (1-1-1 … 6-6-6): that is a critical.",
      "Value less than or equal to the attribute: critical success. Above it: critical failure.",
    ],
  },
  {
    scene: "opposition",
    title: "OPPOSED TESTS",
    points: [
      "Two characters face off: each makes a test.",
      "Most successes wins. Tie: reroll, advantage to the player, or a draw.",
    ],
    example: "Kessler's Social against the candidate's Social.",
  },
  {
    scene: "maitrise",
    title: "MASTERIES",
    points: [
      "Rank 1: advantage on the test.",
      "Rank 2: an extra effect in the story (often 1 EP).",
      "Rank 3: a major effect.",
    ],
    example: "Athletics rank 2 to run from one room to the next.",
  },
  {
    scene: "pe",
    title: "ENERGY POINTS",
    points: [
      "EP = Physical + Mental: the health of body and mind.",
      "1 or 2 EP: weakened (disadvantage). 0: unconscious. Below that: critical condition.",
    ],
    example: "A failed fear test: −1 EP.",
  },
  {
    scene: "combat",
    title: "COMBAT",
    points: [
      "Two actions per turn. Attack: Physical test, 1 success is enough to hit.",
      "Damage = weapon (1 to 5) + 1 per extra success − armor.",
    ],
  },
];
