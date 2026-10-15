// Lighthouse CI (npm run lighthouse) : performance de chargement, accessibilité, bonnes pratiques et SEO
// de l'app construite (dist/), servie par « vite preview ». Lancé en CI dans le job « lighthouse ».
// Un seul profil d'appareil par exécution : le script npm lance d'abord le profil téléphone (celui de
// Lighthouse par défaut), puis le profil ordinateur avec --collect.settings.preset=desktop.
// Depuis Lighthouse 12 il n'y a plus de catégorie « PWA » : l'installabilité n'est plus mesurée ici.

module.exports = {
  ci: {
    collect: {
      startServerCommand: "npx vite preview --port 4173 --strictPort",
      startServerReadyPattern: "localhost:4173",
      url: ["http://localhost:4173/"],
      // Trois passages, on garde la médiane : les temps de chargement varient d'un passage à l'autre.
      numberOfRuns: 3,
    },
    assert: {
      aggregationMethod: "median",
      // Des avertissements, pas des erreurs : premiers chiffres, les seuils bloquants viendront ensuite.
      // Seule l'accessibilité est exigée, le score est déjà bon.
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      // Rapports HTML et JSON écrits sur disque (publiés comme artefact en CI), pas de serveur LHCI.
      target: "filesystem",
      outputDir: "rapports-lighthouse",
    },
  },
};
