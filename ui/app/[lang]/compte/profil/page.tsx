"use client";

import "./profil.css";

import { fr } from "@codegouvfr/react-dsfr";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { TooltipProps } from "@mui/material/Tooltip";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { PropsWithLangParams } from "@/app/i18n/settings";
import { DsfrLink } from "@/components/link/DsfrLink";
import { PAGES } from "@/utils/routes.utils";

import { ApiKeyAction } from "./components/ApiKeyAction";
import { GenerateApiKey } from "./components/GenerateApiKey";
import { ManageApiKeysBanner } from "./components/ManageApiKeysBanner";
import { useApiKeys, useApiKeysStatut } from "./hooks/useApiKeys";

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "none",
  },
});

const ProfilPage = ({ params: { lang } }: PropsWithLangParams) => {
  const apiKeys = useApiKeys();
  const statut = useApiKeysStatut();

  const { t } = useTranslation("inscription-connexion", { lng: lang });

  const tableData = useMemo(() => {
    if (apiKeys.isLoading) {
      return [];
    }

    return apiKeys.apiKeys.map((apiKey, index) => {
      const expired = new Date(apiKey.expires_at) < new Date();
      const statut = expired ? t("monCompte.expire", { lng: lang }) : t("monCompte.actif", { lng: lang });

      return [
        <Typography variant="body1" key="name" className="fr-text--sm">
          {apiKey.name}
        </Typography>,
        <Typography
          variant="body1"
          key="statut"
          className="fr-text--bold"
          color={
            expired
              ? fr.colors.decisions.text.label.pinkTuile.default
              : fr.colors.decisions.artwork.minor.greenBourgeon.default
          }
        >
          <i className={fr.cx(!expired ? "fr-icon-checkbox-circle-fill" : "fr-icon-error-warning-fill")}></i>
          &nbsp;
          {statut}
        </Typography>,
        <Typography variant="body1" key="created_at" className="fr-text--sm">
          {new Date(apiKey.created_at).toLocaleDateString()}
        </Typography>,
        <Typography variant="body1" key="expires_at" className="fr-text--sm">
          {new Date(apiKey.expires_at).toLocaleDateString()}
          <CustomWidthTooltip
            title={
              <Box component="ul" sx={{ margin: fr.spacing("1w") }} className={fr.cx("fr-text--xs")}>
                <li>{t("monCompte.jetonsDureeVie", { lng: lang })}</li>
                <li>{t("monCompte.creerJetonProlongation", { lng: lang })}</li>
                <li>{t("monCompte.possibiliteCreerJeton", { lng: lang })}</li>
                <li>{t("monCompte.impossibleProlonger", { lng: lang })}</li>
              </Box>
            }
            arrow
          >
            <Box
              component={"i"}
              sx={{
                marginLeft: fr.spacing("1v"),
                color: fr.colors.decisions.background.active.blueFrance.default,
              }}
              className={fr.cx("fr-icon-question-line")}
            ></Box>
          </CustomWidthTooltip>
        </Typography>,
        <Typography variant="body1" key="last_used_at" className="fr-text--sm">
          {apiKey.last_used_at
            ? new Date(apiKey.last_used_at).toLocaleDateString()
            : t("monCompte.jamais", { lng: lang })}
        </Typography>,
        <ApiKeyAction index={index} key={`action_${index}`} apiKey={apiKey} t={t} lang={lang} />,
      ];
    });
  }, [apiKeys, lang, t]);

  return (
    <Box
      sx={{
        display: "flex",
        gap: fr.spacing("4w"),
        flexDirection: "column",
        marginTop: fr.spacing("9w"),
        marginBottom: fr.spacing("9w"),
        minWidth: fr.breakpoints.values.sm,
      }}
    >
      <Typography variant="h1" color={fr.colors.decisions.text.actionHigh.blueEcume.default}>
        {t("monCompte.monCompte", { lng: lang })}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
        <Typography variant="h2" color={fr.colors.decisions.artwork.minor.blueEcume.default}>
          {t("monCompte.jetonsAPI", { lng: lang })}
        </Typography>
        <Typography textAlign="right">
          <DsfrLink href={PAGES.static.documentationTechnique.getPath(lang)}>
            {t("monCompte.consulterDocTechnique", { lng: lang })}
          </DsfrLink>
        </Typography>
      </Box>

      {statut !== "actif-ready" && <GenerateApiKey lang={lang} t={t} />}

      <Box>
        <ManageApiKeysBanner key="api-key-banner" lang={lang} t={t} />
        {tableData.length > 0 && (
          <Table
            data={tableData}
            fixed
            headers={[
              t("monCompte.nom", { lng: lang }),
              t("monCompte.statut", { lng: lang }),
              t("monCompte.dateCreation", { lng: lang }),
              t("monCompte.dateExpiration", { lng: lang }),
              t("monCompte.derniereUtilisation", { lng: lang }),
              t("monCompte.action", { lng: lang }),
            ]}
            style={{
              minWidth: "100%",
              marginBottom: fr.spacing("2w"),
            }}
            className="api-key-table"
          />
        )}
      </Box>

      {statut === "actif-ready" && <GenerateApiKey lang={lang} t={t} />}
    </Box>
  );
};

export default ProfilPage;
