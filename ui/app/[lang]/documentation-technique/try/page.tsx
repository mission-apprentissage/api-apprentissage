"use client"

import "swagger-ui-dist/swagger-ui.css"
import "./overwride.css"

import { fr } from "@codegouvfr/react-dsfr"
import { Box, Container, Typography } from "@mui/material"
import { captureException } from "@sentry/nextjs"
import { use, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"

import type { PropsWithLangParams } from "@/app/i18n/settings"
import { DsfrLink } from "@/components/link/DsfrLink"
import { publicConfig } from "@/config.public"
import { PAGES } from "@/utils/routes.utils"

export default function TryPage({ params }: PropsWithLangParams) {
  const { lang } = use(params)
  const { t } = useTranslation("documentation-technique")
  const swaggerRef = useRef<HTMLDivElement>(null)

  // Bundle précompilé plutôt que swagger-ui-react : Turbopack perd les enregistrements `refract`
  // d'apidom et le dépliage d'un endpoint tourne à l'infini (vercel/next.js#86507).
  useEffect(() => {
    let cancelled = false
    import("swagger-ui-dist/swagger-ui-bundle.js")
      .then(({ default: SwaggerUIBundle }) => {
        if (!cancelled && swaggerRef.current) {
          SwaggerUIBundle({ url: `${publicConfig.apiEndpoint}/documentation/json`, domNode: swaggerRef.current })
        }
      })
      .catch(captureException)
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: fr.spacing("6w") }}>
        <DsfrLink href={PAGES.static.documentationTechnique.getPath(lang)} arrow="left" size="lg">
          {t("try.back")}
        </DsfrLink>
      </Box>
      <Typography variant="h1" sx={{ color: fr.colors.decisions.text.label.blueEcume.default, mb: fr.spacing("3w") }} gutterBottom>
        {PAGES.static.documentationTechniqueEssayer.getTitle(lang, t)}
      </Typography>
      <div ref={swaggerRef} />
    </Container>
  )
}
