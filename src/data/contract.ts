// Contrat de travail du scénario « Une simple formalité » : très long, à faire défiler, signé par empreinte.
// Les clauses inquiétantes sont noyées dans le jargon ; le contrat ne dit jamais clairement que l'examen est mortel.
// [[…]] : passage censuré (voir src/components/Redacted.tsx).

// Même année que les matricules des fiches prétirées (PA-2184-0417, WY-C-2184-0612) et que la Session disciplinaire.
export const CONTRACT_REF = "WY-RH/2184-0612";

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

// Version anglaise, même ordre et mêmes numéros d'articles.
export const CONTRACT_PREAMBLE_EN: string[] = [
  "BETWEEN THE UNDERSIGNED:",
  "WEYLAND-YUTANI CORPORATION, “Building Better Worlds”, a company incorporated under interplanetary law, entered in the Register of Colonial Companies under number [[0000-417-WY]], with its registered office in Tokyo (Earth), represented by its Human Resources Department, hereinafter referred to as “the Company”,",
  "AND",
  "The candidate whose biometric print appears at the foot of this document, hereinafter referred to as “the Employee”,",
  "IT IS HEREBY AGREED AS FOLLOWS:",
];

export const CONTRACT_ARTICLES_EN: Article[] = [
  {
    title: "PURPOSE OF THE CONTRACT",
    paragraphs: [
      "The purpose of this contract is to set out the terms under which the Employee is engaged by the Company as “Special Assignment Personnel”, with effect from the date of signature.",
      "The duties assigned to the Employee shall be specified at a later date, according to the results of the aptitude test provided for in article 6 and to the needs of the Company.",
    ],
  },
  {
    title: "DEFINITIONS",
    paragraphs: [
      "“Base”: the base ship Nostromo II, stationed in lunar orbit, the exclusive property of the Company.",
      "“Test”: the aptitude test required prior to any assignment, supervised by an authorised Coordinator.",
      "“Test Element”: any device, equipment, substance or organism [[of class XX-121]] introduced into the Base for the purposes of the Test.",
      "“Permanent Unavailability”: any situation in which the Employee is permanently unable to perform this contract.",
    ],
  },
  {
    title: "TERM AND PROBATIONARY PERIOD",
    paragraphs: [
      "This contract is entered into for a term of five (5) Earth years, renewable by tacit agreement.",
      "The Test shall serve as the probationary period. It may be terminated at any time, without notice or compensation, by the Company or upon the occurrence of an event provided for in article 12.",
    ],
  },
  {
    title: "REMUNERATION AND BENEFITS",
    paragraphs: [
      "In consideration of his or her work, the Employee shall receive a gross monthly salary of forty-eight thousand (48,000) credits, paid in arrears into an account held with the Weyland-Yutani Colonial Bank.",
      "The Employee shall further be entitled to company accommodation, an assignment bonus of twelve thousand (12,000) credits, the Company's full medical coverage and unlimited access to the Base's beverage dispensers.",
      "The assignment bonus shall be paid only upon successful completion of the Test.",
    ],
  },
  {
    title: "PLACE OF ASSIGNMENT",
    paragraphs: [
      "The Employee shall perform his or her duties aboard the Base, and thereafter on any ship, station or colony designated by the Company, without such change constituting an amendment to the contract.",
      "The Employee accepts in advance any transit time, including in hypersleep, as well as any assignment to an uncharted sector.",
    ],
  },
  {
    title: "PRELIMINARY APTITUDE TEST",
    paragraphs: [
      "Prior to any assignment, the Employee shall take an aptitude test aboard the Base. The Test consists of moving from room to room as instructed by the Coordinator, while certain rooms are sealed one after another.",
      "The Coordinator shall be the sole judge of the conduct of the Test. His or her instructions may not be contested, either during or after the Test.",
      "The Employee shall not leave the Base, force a sealed door or inquire into the nature of the test elements. [[Pass rate of candidates in previous sessions: 12%.]]",
    ],
  },
  {
    title: "OBLIGATIONS OF THE EMPLOYEE",
    paragraphs: [
      "The Employee undertakes to perform his or her duties with loyalty, punctuality and composure, and to comply with the Company's internal regulations, safety protocols and the directives of the MU/TH/UR 6000 onboard computer [[, including where such directives conflict with the Employee's safety]].",
      "The Employee undertakes to report without delay any anomaly, any unusual noise coming from the air ducts and any disappearance of a colleague.",
    ],
  },
  {
    title: "CONFIDENTIALITY",
    paragraphs: [
      "The Employee is bound to the strictest secrecy regarding all information that may come to his or her knowledge in the course of the Test and of his or her duties, in particular regarding the nature of the test elements.",
      "This obligation shall survive the termination of the contract for any reason whatsoever, including the Permanent Unavailability of the Employee.",
    ],
  },
  {
    title: "INTELLECTUAL PROPERTY AND ASSIGNMENT OF RIGHTS",
    paragraphs: [
      "The Employee assigns to the Company, exclusively, free of charge and for the full legal term of protection, all rights in his or her work, inventions, observations, recordings and reports.",
      "This assignment extends to the Employee's image, voice and name, as well as to any discovery made in contact with, on or inside his or her body.",
    ],
  },
  {
    title: "BIOLOGICAL AND MEDICAL DATA",
    paragraphs: [
      "The Employee authorises the Company to collect, store and analyse his or her biometric, genetic and medical data, together with any biological sample taken before, during or after the Test.",
      "Samples shall remain the property of the Company and may be retained for scientific research purposes for an unlimited period, in particular by the [[Bioweapons Division]].",
    ],
  },
  {
    title: "EXPOSURE TO UNCATALOGUED ORGANISMS",
    paragraphs: [
      "The Employee acknowledges that the Test may bring him or her into contact with uncatalogued organisms [[collected on LV-426]]. Any interaction with such organisms shall be at the Employee's sole initiative.",
      "The Employee shall not feed, approach, photograph or name the said organisms.",
    ],
  },
  {
    title: "ACCEPTED OCCUPATIONAL RISKS",
    paragraphs: [
      "The Employee declares that he or she has been fully informed of the risks inherent in the Test and in his or her duties, and accepts them without reservation. The Employee acknowledges in particular that the sealing of a room in which he or she is present may result in his or her Permanent Unavailability [[or death]].",
      "The Employee waives any claim, on his or her own behalf and on behalf of his or her successors and heirs, in respect of such risks.",
    ],
  },
  {
    title: "LIMITATION OF LIABILITY",
    paragraphs: [
      "The Company shall not be held liable for any bodily, psychological, genetic or parasitic harm suffered by the Employee in the course of the Test or of his or her duties.",
      "In any event, the Company's liability shall be limited to one (1) month's salary, less the cost of cleaning the Base.",
    ],
  },
  {
    title: "REPATRIATION",
    paragraphs: [
      "In the event of the Employee's Permanent Unavailability, the Company undertakes to repatriate the remains, subject to available cargo capacity [[and to the condition of the remains]].",
      "Repatriation costs shall be deducted from the Employee's final salary. Should the remains prove unrecoverable, the Employee's personal effects shall be returned to the family within a reasonable time.",
    ],
  },
  {
    title: "NON-COMPETITION",
    paragraphs: [
      "For the term of the contract and for ten (10) years following its expiry, the Employee shall not work for any competing company, in particular Seegson, Hyperdyne Systems or any colonial government.",
    ],
  },
  {
    title: "PRIORITY OF THE COMPANY'S INTERESTS",
    paragraphs: [
      "Pursuant to internal directive No. [[937]], the Company's priority is the study and return of any organism of scientific interest. All other considerations are secondary.",
      "The Employee acknowledges that, for the purposes of this directive, he or she is deemed expendable.",
    ],
  },
  {
    title: "TERMINATION OF THE CONTRACT",
    paragraphs: [
      "The contract may be terminated by the Company at any time, without cause. The Employee may not terminate the contract before the conclusion of the Test.",
      "The Permanent Unavailability of the Employee shall automatically terminate the contract, without compensation, on the date it is recorded by the Coordinator.",
    ],
  },
  {
    title: "GOVERNING LAW AND JURISDICTION",
    paragraphs: [
      "This contract is governed by the internal law of the Company. Any dispute shall fall under the exclusive jurisdiction of the Weyland-Yutani Arbitration Tribunal, sitting in closed session.",
    ],
  },
  {
    title: "MISCELLANEOUS PROVISIONS",
    paragraphs: [
      "Should any clause of this contract be declared void, the remaining clauses shall continue in full force and effect. Failure by the Company to enforce any clause shall not constitute a waiver of its right to enforce it at a later date.",
      "Article headings are for guidance only. In the event of any inconsistency, the interpretation most favourable to the Company shall prevail.",
    ],
  },
  {
    title: "BIOMETRIC SIGNATURE",
    paragraphs: [
      "The Employee acknowledges having read and understood this contract in its entirety. Affixing his or her fingerprint shall constitute signature, acceptance of all clauses and consent to the Test.",
      "Done aboard the Base, in a single original retained by the Company.",
    ],
  },
];
