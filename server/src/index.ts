import { config } from "dotenv"

config({ path: ".env", quiet: process.env.NODE_ENV === "test" })
config({ path: ".env.local", override: true, quiet: process.env.NODE_ENV === "test" })

import("./services/sentry/sentry.js")
  .then(({ initSentry }) => {
    initSentry()
    // Dynamic import to start server after env are loaded
    return import("./main.js")
  })
  .catch((err) => {
    // Sentry peut ne pas être initialisé à ce stade : on ne compte que sur la sortie standard.
    console.error("startup error", err)
    // `exitCode` plutôt que `exit` : quand stderr est un pipe (conteneur), l'écriture est
    // asynchrone et `exit` la tronquerait — le message d'erreur serait perdu. Rien n'est en
    // attente sur la boucle d'événements à ce stade, le process sort donc immédiatement.
    process.exitCode = 1
  })
