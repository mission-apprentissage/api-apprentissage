import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { useMemo } from "react";

import { useApiKeys, useApiKeysStatut } from "@/app/compte/profil/hooks/useApiKeys";

import { generateApiKeyModal } from "./GenerateApiKey";

export function ManageApiKeysBanner() {
  const apiKeys = useApiKeys();

  const statut = useApiKeysStatut();

  const { buttonLabel, description } = useMemo(() => {
    if (statut === "loading") {
      return { description: "Chargement des jetons d'API. Veuillez patienter...", buttonLabel: "Générer un jeton" };
    }

    if (statut === "none") {
      return {
        description: "Vous n’avez aucun jeton d’accès à l’API Apprentissage",
        buttonLabel: "Générer mon premier jeton",
      };
    }

    if (statut === "actif-ready") {
      return {
        description: (
          <>
            Votre jeton a bien été crée, n’oubliez pas de le copier !
            <br />
            Si vous avez besoin de jetons supplémentaire, vous pouvez en générer un nouveau.
          </>
        ),
        buttonLabel: "Générer un nouveau jeton d’accès",
      };
    }

    if (statut === "actif-encrypted") {
      return {
        description: (
          <>
            Vos jetons actif sont cryptés
            <br />
            Vous ne pouvez plus copier ces jeton, si vous ne les avez pas enregistrés, merci d’en générer un nouveau
          </>
        ),
        buttonLabel: "Générer un nouveau jeton d’accès",
      };
    }

    return {
      description: "Tous vos jetons d’accès ont expirés",
      buttonLabel: "Générer un nouveau jeton d’accès",
    };
  }, [apiKeys]);

  return (
    <>
      {statut === "actif-ready" && (
        <Notice title="Votre jeton a bien été crée. Il sera crypté une fois que vous aurez quitté cette page, vous n’aurez donc plus la possibilité de le copier." />
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: fr.spacing("2w"),
          padding: fr.spacing("4w"),
          border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
        }}
      >
        <Image
          src="/asset/artwork/product_launch/outline_III.svg"
          alt="Illustration d'une personne qui fait décoller une fusée"
          width={240}
          height={108}
        />
        <Typography textAlign="center">{description}</Typography>
        <Button size="large" nativeButtonProps={generateApiKeyModal.buttonProps}>
          {buttonLabel}
        </Button>
      </Box>
    </>
  );
}
