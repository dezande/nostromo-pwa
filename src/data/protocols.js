// Les 4 protocoles A.I.P. (Alien Intrusion Protocol) : ordre de fermeture des salles, en 8 étapes.
export const PROTOCOLS = [
  {
    id: 1, date: "04/17/2183", instructor: "Elton Riley", participants: 4, conclusion: "2 alive",
    steps: [["atelier"], ["entrepot2"], ["entrepot4", "entrepot3"], ["cockpit", "cuisine"], ["serre", "sport"], ["reunion", "infirmerie"], ["entrepot1"], ["dortoir1", "dortoir2"]],
  },
  {
    id: 2, date: "10/02/2184", instructor: "Jack Stone", participants: 5, conclusion: "1 alive",
    steps: [["cuisine"], ["entrepot1"], ["entrepot2"], ["dortoir2", "sport"], ["dortoir1", "atelier"], ["infirmerie", "entrepot3"], ["reunion", "entrepot4"], ["serre", "cockpit"]],
  },
  {
    id: 3, date: "03/17/2182", instructor: "Helen Wade", participants: 7, conclusion: "3 alive",
    steps: [["cockpit"], ["reunion"], ["infirmerie"], ["dortoir1", "sport"], ["atelier", "dortoir2"], ["entrepot1", "entrepot4"], ["entrepot2", "entrepot3"], ["cuisine", "serre"]],
  },
  {
    id: 4, date: "12/22/2181", instructor: "Igor Ivenov", participants: 5, conclusion: "2 alive",
    steps: [["dortoir1"], ["infirmerie", "entrepot2"], ["entrepot4", "entrepot1"], ["cuisine", "serre"], ["dortoir2", "sport"], ["reunion"], ["entrepot3"], ["cockpit", "atelier"]],
  },
];

export const STEP_COUNT = 8;
