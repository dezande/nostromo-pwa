// Contrat de travail du scénario « Une simple formalité » : très long, à faire défiler, signé par empreinte.
// Les clauses inquiétantes sont noyées dans le jargon ; le contrat ne dit jamais clairement que l'examen est mortel.
// [[…]] : passage censuré (voir src/components/Redacted.tsx).

export const CONTRACT_REF = "WY-RH/2122-0612";

export interface Article { title: string; paragraphs: string[] }

export const CONTRACT_PREAMBLE = [
  "ENTRE LES SOUSSIGNÉS :",
  "La société WEYLAND-YUTANI CORPORATION, « Building Better Worlds », société de droit interplanétaire, immatriculée au Registre des Compagnies Coloniales sous le numéro [[0000-417-WY]], dont le siège est situé à Tokyo (Terre), représentée par son Service des ressources humaines, ci-après dénommée « la Compagnie »,",
  "ET",
  "Le candidat dont l'empreinte biométrique figure au bas du présent document, ci-après dénommé « le Salarié »,",
  "IL A ÉTÉ CONVENU CE QUI SUIT :",
];

export const CONTRACT_ARTICLES: Article[] = [
  {
    title: "OBJET DU CONTRAT",
    paragraphs: [
      "Le présent contrat a pour objet de définir les conditions dans lesquelles le Salarié est engagé par la Compagnie, en qualité de « Personnel d'affectation spéciale », à compter de la date de signature.",
      "Les missions confiées au Salarié seront précisées ultérieurement, en fonction des résultats de l'examen d'aptitude prévu à l'article 6 et des besoins de la Compagnie.",
    ],
  },
  {
    title: "DÉFINITIONS",
    paragraphs: [
      "« Base » : le vaisseau-base Nostromo II, stationné en orbite lunaire, propriété exclusive de la Compagnie.",
      "« Examen » : l'examen d'aptitude préalable à toute affectation, supervisé par un Coordinateur habilité.",
      "« Élément de test » : tout dispositif, matériel, substance ou organisme [[de classe XX-121]] introduit dans la Base dans le cadre de l'Examen.",
      "« Indisponibilité définitive » : toute situation dans laquelle le Salarié n'est plus en mesure, de façon permanente, d'exécuter le présent contrat.",
    ],
  },
  {
    title: "DURÉE ET PÉRIODE D'ESSAI",
    paragraphs: [
      "Le présent contrat est conclu pour une durée de cinq (5) années terrestres, renouvelable par tacite reconduction.",
      "L'Examen tient lieu de période d'essai. Il peut y être mis fin à tout moment, sans préavis ni indemnité, par la Compagnie ou par la survenance d'un événement prévu à l'article 12.",
    ],
  },
  {
    title: "RÉMUNÉRATION ET AVANTAGES",
    paragraphs: [
      "En contrepartie de son travail, le Salarié percevra une rémunération mensuelle brute de quarante-huit mille (48 000) crédits, versée à terme échu sur un compte de la Banque Coloniale Weyland-Yutani.",
      "Le Salarié bénéficie en outre d'un logement de fonction, d'une prime d'affectation de douze mille (12 000) crédits, de la couverture médicale complète de la Compagnie et d'un accès illimité aux distributeurs de boissons de la Base.",
      "La prime d'affectation n'est versée qu'à l'issue favorable de l'Examen.",
    ],
  },
  {
    title: "LIEU D'AFFECTATION",
    paragraphs: [
      "Le Salarié exercera ses fonctions à bord de la Base, puis sur tout vaisseau, station ou colonie désigné par la Compagnie, sans que ce changement constitue une modification du contrat.",
      "Le Salarié accepte par avance toute durée de transit, y compris en hypersommeil, ainsi que toute affectation dans un secteur non cartographié.",
    ],
  },
  {
    title: "EXAMEN D'APTITUDE PRÉALABLE",
    paragraphs: [
      "Avant toute affectation, le Salarié passe un examen d'aptitude à bord de la Base. L'Examen consiste à se déplacer de salle en salle selon les instructions du Coordinateur, pendant que certaines salles sont fermées successivement.",
      "Le Coordinateur est seul juge du déroulement de l'Examen. Ses instructions ne peuvent faire l'objet d'aucune contestation, ni pendant ni après l'Examen.",
      "Le Salarié s'interdit de quitter la Base, de forcer une porte fermée ou de rechercher la nature des éléments de test. [[Taux de candidats retenus lors des sessions précédentes : 12 %.]]",
    ],
  },
  {
    title: "OBLIGATIONS DU SALARIÉ",
    paragraphs: [
      "Le Salarié s'engage à exécuter ses fonctions avec loyauté, ponctualité et sang-froid, et à se conformer au règlement intérieur de la Compagnie, aux protocoles de sécurité et aux directives de l'ordinateur de bord MU/TH/UR 6000 [[, y compris lorsque celles-ci contredisent la sécurité du Salarié]].",
      "Le Salarié s'engage à signaler sans délai toute anomalie, tout bruit inhabituel provenant des conduits d'aération et toute disparition de collègue.",
    ],
  },
  {
    title: "CONFIDENTIALITÉ",
    paragraphs: [
      "Le Salarié est tenu au secret le plus absolu sur l'ensemble des informations dont il aurait connaissance à l'occasion de l'Examen et de ses fonctions, notamment sur la nature des éléments de test.",
      "Cette obligation survit à la fin du contrat, pour quelque cause que ce soit, y compris l'Indisponibilité définitive du Salarié.",
    ],
  },
  {
    title: "PROPRIÉTÉ INTELLECTUELLE ET CESSION DES DROITS",
    paragraphs: [
      "Le Salarié cède à la Compagnie, à titre exclusif, gratuit et pour toute la durée légale de protection, l'ensemble des droits sur ses travaux, inventions, observations, enregistrements et rapports.",
      "Cette cession s'étend à l'image, à la voix et au nom du Salarié, ainsi qu'à toute découverte faite à son contact, sur son corps ou à l'intérieur de celui-ci.",
    ],
  },
  {
    title: "DONNÉES BIOLOGIQUES ET MÉDICALES",
    paragraphs: [
      "Le Salarié autorise la Compagnie à collecter, conserver et analyser ses données biométriques, génétiques et médicales, ainsi que tout échantillon biologique prélevé avant, pendant ou après l'Examen.",
      "Les échantillons demeurent la propriété de la Compagnie et peuvent être conservés à des fins de recherche scientifique pour une durée illimitée, notamment par la [[Division des armes biologiques]].",
    ],
  },
  {
    title: "EXPOSITION À DES ORGANISMES NON RÉPERTORIÉS",
    paragraphs: [
      "Le Salarié reconnaît que l'Examen peut le mettre en présence d'organismes non répertoriés [[prélevés sur LV-426]]. Toute interaction avec ces organismes relève de sa seule initiative.",
      "Le Salarié s'interdit de nourrir, d'approcher, de photographier ou de nommer lesdits organismes.",
    ],
  },
  {
    title: "RISQUES PROFESSIONNELS ACCEPTÉS",
    paragraphs: [
      "Le Salarié déclare avoir été pleinement informé des risques inhérents à l'Examen et à ses fonctions, et les accepter sans réserve. Il reconnaît notamment que la fermeture d'une salle dans laquelle il se trouve peut entraîner son Indisponibilité définitive [[ou son décès]].",
      "Le Salarié renonce à toute action, pour lui-même, ses ayants droit et ses héritiers, au titre de ces risques.",
    ],
  },
  {
    title: "LIMITATION DE RESPONSABILITÉ",
    paragraphs: [
      "La responsabilité de la Compagnie ne saurait être engagée pour tout dommage corporel, psychique, génétique ou parasitaire subi par le Salarié dans le cadre de l'Examen ou de ses fonctions.",
      "En tout état de cause, la responsabilité de la Compagnie est limitée au montant d'un (1) mois de rémunération, déduction faite des frais de nettoyage de la Base.",
    ],
  },
  {
    title: "RAPATRIEMENT",
    paragraphs: [
      "En cas d'Indisponibilité définitive du Salarié, la Compagnie s'engage au rapatriement de la dépouille, dans la limite de la capacité de fret disponible [[et de l'état de la dépouille]].",
      "Les frais de rapatriement sont imputés sur la dernière rémunération du Salarié. Si la dépouille n'est pas récupérable, ses effets personnels sont restitués à la famille dans un délai raisonnable.",
    ],
  },
  {
    title: "NON-CONCURRENCE",
    paragraphs: [
      "Pendant la durée du contrat et les dix (10) années suivant son terme, le Salarié s'interdit de travailler pour toute compagnie concurrente, notamment Seegson, Hyperdyne Systems ou tout gouvernement colonial.",
    ],
  },
  {
    title: "PRIORITÉ DES INTÉRÊTS DE LA COMPAGNIE",
    paragraphs: [
      "En application de la directive interne n° [[937]], la priorité de la Compagnie est l'étude et le rapatriement de tout organisme d'intérêt scientifique. Toutes les autres considérations sont secondaires.",
      "Le Salarié reconnaît être, au regard de cette directive, considéré comme remplaçable.",
    ],
  },
  {
    title: "RUPTURE DU CONTRAT",
    paragraphs: [
      "Le contrat peut être rompu par la Compagnie à tout moment, sans motif. Le Salarié ne peut rompre le contrat avant le terme de l'Examen.",
      "L'Indisponibilité définitive du Salarié emporte rupture de plein droit du contrat, sans indemnité, au jour de sa constatation par le Coordinateur.",
    ],
  },
  {
    title: "DROIT APPLICABLE ET JURIDICTION",
    paragraphs: [
      "Le présent contrat est régi par le droit interne de la Compagnie. Tout litige relève de la compétence exclusive du Tribunal arbitral de la Weyland-Yutani, siégeant à huis clos.",
    ],
  },
  {
    title: "DISPOSITIONS DIVERSES",
    paragraphs: [
      "Si l'une des clauses du présent contrat était déclarée nulle, les autres clauses conserveraient leur plein effet. Le fait pour la Compagnie de ne pas se prévaloir d'une clause ne vaut pas renonciation à s'en prévaloir ultérieurement.",
      "Les titres des articles n'ont qu'une valeur indicative. En cas de contradiction, l'interprétation la plus favorable à la Compagnie prévaut.",
    ],
  },
  {
    title: "SIGNATURE BIOMÉTRIQUE",
    paragraphs: [
      "Le Salarié reconnaît avoir lu et compris l'intégralité du présent contrat. L'apposition de son empreinte digitale vaut signature, acceptation de l'ensemble des clauses et consentement à l'Examen.",
      "Fait à bord de la Base, en un exemplaire unique conservé par la Compagnie.",
    ],
  },
];
