"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Box, Dialog, DialogContent, Typography } from "@mui/material";
import Link from "next/link";

import type { WithLang } from "@/app/i18n/settings";
import { Artwork } from "@/components/artwork/Artwork";
import { PAGES } from "@/utils/routes.utils";

export function LoginEmailSentModal({ email, lang }: WithLang<{ email: string }>) {
  return (
    <Dialog
      open
      aria-labelledby="login-sent-modal-title"
      aria-describedby="login-sent-modal-description"
      fullScreen
      scroll="paper"
      PaperProps={{
        sx: {
          display: "flex",
          backgroundColor: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <DialogContent
        sx={{
          maxWidth: "md",
          padding: fr.spacing("5w"),
        }}
      >
        <Box sx={{ textAlign: "right", marginBottom: fr.spacing("2w") }}>
          <Button priority="tertiary">
            <Box component={Link} href={PAGES.static.home.getPath(lang)} sx={{ backgroundImage: "none" }}>
              Fermer
            </Box>
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: fr.spacing("5w"),
            marginBottom: fr.spacing("3w"),
            gap: fr.spacing("5w"),
            border: "1px solid var(--light-border-default-grey, #DDD)",
            background: "var(--light-background-default-grey, #FFF)",
          }}
        >
          <Box>
            <Typography
              variant="h1"
              align="center"
              id="login-sent-modal-title"
              sx={{
                marginBottom: fr.spacing("3w"),
                color: fr.colors.decisions.text.label.blueEcume.default,
              }}
            >
              Vérifier votre adresse electronique
            </Typography>
            <Typography id="login-sent-modal-description">
              Nous avons envoyé un lien à l’adresse <strong>{email}</strong> qui va vous permettre de{" "}
              <strong>vous connecter à votre compte ou de vous inscrire, sans mot de passe</strong> (n’oubliez pas de
              vérifier vos indésirables)
            </Typography>
          </Box>
          <Artwork name="mail-sent" />
          <Typography textAlign="center" color={fr.colors.decisions.text.default.grey.default}>
            Si vous n’avez pas reçu le lien d’ici 10 min, contactez-nous :{" "}
            <Box
              component="a"
              href="mailto:support_api@apprentissage.beta.gouv.fr"
              sx={{ color: fr.colors.decisions.text.actionHigh.blueFrance.default }}
            >
              support_api@apprentissage.beta.gouv.fr
            </Box>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
