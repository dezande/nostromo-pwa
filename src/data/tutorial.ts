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
      "Le MJ annonce combien de succès il faut pour réussir.",
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
