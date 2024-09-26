import { fr } from "@codegouvfr/react-dsfr";
import { Tag as TagDsfr } from "@codegouvfr/react-dsfr/Tag";
import { Box, Typography } from "@mui/material";

import type { WithLangAndT } from "@/app/i18n/settings";
import { Tag } from "@/components/tag/Tag";

import { BesoinDesDonnes } from "./BesoinDesDonnees";
import { HabilitationRequise } from "./HabilitationRequise";

const threeColumns = {
  md: "1fr",
  lg: "1fr 1fr 1fr",
  gap: fr.spacing("9w"),
};

const spanTwoColumns = {
  md: "span 1",
  lg: "span 2",
};

type Props = WithLangAndT<{
  title: string;
  type: "outil" | "data";
  dangerousHtmlDescriptions: string[];
  demandeHabilitation?: {
    subject: string;
    body: string;
  };
  frequenceMiseAJour: "daily";
  note?: string;
}>;

export function CatalogueHeadline({
  t,
  type,
  lang,
  title,
  dangerousHtmlDescriptions,
  demandeHabilitation,
  frequenceMiseAJour,
  note,
}: Props) {
  return (
    <>
      <Box sx={{ marginBottom: fr.spacing("2w") }}>
        <TagDsfr>{t(`type.${type}`, { lng: lang })}</TagDsfr>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: threeColumns,
          marginBottom: fr.spacing("6w"),
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: fr.spacing("2w"),
            gridColumn: spanTwoColumns,
          }}
        >
          <Typography variant="h1" sx={{ color: fr.colors.decisions.text.label.blueEcume.default }}>
            {title}
          </Typography>

          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              gap: fr.spacing("2w"),
            }}
          >
            <Typography component="span" variant="body1">
              <strong>{t("frequenceMiseAJour.titre", { lng: lang })}</strong>{" "}
              <Tag color="blueEcume">{t(`frequenceMiseAJour.${frequenceMiseAJour}`, { lng: lang })}</Tag>
            </Typography>
          </Box>

          {dangerousHtmlDescriptions.map((html, index) => (
            <Typography
              key={index}
              className={fr.cx("fr-text--lead")}
              sx={{ marginTop: fr.spacing("1w") }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))}

          {note != null && (
            <Typography sx={{ marginTop: fr.spacing("1w") }} dangerouslySetInnerHTML={{ __html: note }} />
          )}

          {demandeHabilitation != null && <HabilitationRequise lang={lang} t={t} {...demandeHabilitation} />}
        </Box>
        <BesoinDesDonnes lang={lang} t={t} />
      </Box>
    </>
  );
}
