"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Box, Snackbar, Typography } from "@mui/material";
import { captureException } from "@sentry/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { ISourceNpecNormalized } from "shared/models/source/npec/source.npec.normalized.model";
import type { Jsonify } from "type-fest";

import Loading from "@/app/[lang]/loading";
import { DsfrLink } from "@/components/link/DsfrLink";
import { apiGet } from "@/utils/api.utils";

import { Pastille } from "./Pastille";

export type ResultSectionProps = {
  rncp: string | null;
  idcc: number | null;
  date_signature: Date | null;
};

const numberFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function formatNpecValue(data: Jsonify<ISourceNpecNormalized> | null | undefined) {
  if (data == null || data.npec.length === 0) {
    return "- €";
  }

  if (data.npec.length === 1) {
    return numberFormatter.format(data.npec[0]);
  }

  const min = Math.min(...data.npec);
  const max = Math.max(...data.npec);

  return `${numberFormatter.format(min)} - ${numberFormatter.format(max)}`;
}

function Title() {
  return (
    <>
      <Pastille>4</Pastille>
      <Typography
        className={fr.cx("fr-text--lead")}
        sx={{ color: fr.colors.decisions.artwork.minor.blueEcume.default }}
        aria-describedby="tooltip-npec-step-4"
      >
        <strong>Montant annuel de prise en charge</strong>
        <button className="fr-btn--tooltip fr-btn" aria-describedby="tooltip-npec-step-4" />
        <span
          className={fr.cx("fr-tooltip", "fr-placement")}
          id="tooltip-npec-step-4"
          role="tooltip"
          aria-hidden="true"
        >
          Calculé sur la base du montant de prise en charge en vigueur au moment de la signature du contrat.
        </span>
      </Typography>
    </>
  );
}

function NpecBadge(props: { isLoading: boolean; value: Jsonify<ISourceNpecNormalized> | null | undefined }) {
  const [copyState, setCopyState] = useState<boolean | null>(null);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard
      .writeText(formatNpecValue(props.value))
      .then(() => {
        setCopyState(true);
      })
      .catch((err) => {
        captureException(err);
        setCopyState(false);
      });
  }, [props.value]);

  return (
    <Badge
      noIcon
      style={{
        backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
        paddingTop: fr.spacing("1w"),
        paddingBottom: fr.spacing("1w"),
        paddingLeft: fr.spacing("2w"),
        paddingRight: 0,
        display: "flex",
        gap: fr.spacing("1w"),
      }}
      className={fr.cx("fr-text--lead", "fr-text--bold")}
    >
      {props.isLoading ? <Loading /> : formatNpecValue(props.value)}
      {props.value && (
        <Button onClick={copyToClipboard} priority="tertiary no outline">
          Copier
        </Button>
      )}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={copyState !== null}
        onClose={() => setCopyState(null)}
        autoHideDuration={copyState === true ? 3000 : null}
        sx={{
          textWrap: "wrap",
          overflowWrap: "anywhere",
          maxWidth: fr.breakpoints.values.sm,
        }}
        message={
          copyState === false
            ? "Une erreur est survenue lors de la copie du NPEC. Veuillez copier manuellement."
            : "Copié dans le presse papier"
        }
      />
    </Badge>
  );
}

function ResultNotice(props: { value: Jsonify<ISourceNpecNormalized> | null | undefined }) {
  if (props.value == null || props.value.npec.length === 0) {
    return (
      <Alert
        description={
          <Typography>
            <strong>
              La certification renseignée ne dispose d’aucun NPEC. Dans ce cas de figure, l’OPCO engage le contrat
              suivant la valeur d’amorçage du niveau de la certification visée.
            </strong>
            {" Cette valeur est déterminée par décret ou arrêté en fonction de la date de signature du contrat. "}
            Source&nbsp;:<DsfrLink href="https://www.cfadock.fr/Home/Documents">Vademecum CFA</DsfrLink>
          </Typography>
        }
        small
        severity="error"
      />
    );
  }

  if (props.value.npec.length > 1) {
    return (
      <Alert
        description={
          <Typography>
            <strong>
              La certification renseignée dispose de plusieurs NPEC. Pour le moment, nous ne sommes pas en mesure de
              savoir quel est le bon montant de prise en charge.
            </strong>
            {" Pour plus de détail vous pouvez vous référez au fichier source téléchargeable ci-dessous."}
          </Typography>
        }
        small
        severity="error"
      />
    );
  }

  return null;
}

function removeFirstLetterUpperCase(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function ResultSection({ rncp, idcc, date_signature }: ResultSectionProps) {
  const queryKey: [string, ResultSectionProps] = ["/_private/simulateur/npec/contrat", { rncp, idcc, date_signature }];
  const enabled = rncp != null && idcc != null && date_signature != null;

  const result = useQuery({
    queryKey,
    queryFn: async (context) => {
      const [, { rncp, idcc, date_signature }] = context.queryKey;
      if (!rncp || !idcc || !date_signature) {
        throw new Error("Missing required parameters");
      }

      return apiGet("/_private/simulateur/npec/contrat", {
        querystring: { rncp, idcc, date_signature: date_signature.toJSON() },
      });
    },
    enabled,
  });

  if (result.isError) {
    throw result.error;
  }

  return (
    <Box sx={{ display: "flex", gap: fr.spacing("2w"), flexDirection: "column" }}>
      <Title />

      <NpecBadge isLoading={result.isFetching} value={result.data?.npec} />

      {result.isFetched && <ResultNotice value={result.data?.npec} />}

      {result.data && (
        <>
          <Typography className={fr.cx("fr-text--sm")} color={fr.colors.decisions.text.default.grey.default}>
            {`Source : ${result.data.metadata.title}`}
            <br />
            <a
              href={result.data.metadata.resource}
              className={fr.cx("fr-link", "fr-link--download", "fr-link--sm", "fr-text--sm")}
              download
            >{`Télécharger le ${removeFirstLetterUpperCase(result.data.metadata.description)}`}</a>
          </Typography>
        </>
      )}
    </Box>
  );
}
