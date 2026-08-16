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
    process.exit(1)
  })
