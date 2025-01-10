import { fr } from "@codegouvfr/react-dsfr";
import { Tag as TagDsfr } from "@codegouvfr/react-dsfr/Tag";
import { Box, Typography } from "@mui/material";
import type { DocPage } from "api-alternance-sdk/internal";
import { getTextOpenAPI } from "api-alternance-sdk/internal";

import type { WithLangAndT } from "@/app/i18n/settings";
import { DsfrMarkdown } from "@/components/markdown/DsfrMarkdown";
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
  doc: DocPage;
}>;

export function CatalogueHeadline({ t, doc, lang, title }: Props) {
  return (
    <>
      <Box sx={{ marginBottom: fr.spacing("2w") }}>
        <TagDsfr>{t(`type.${doc.type}`, { lng: lang })}</TagDsfr>
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

          {doc.frequenceMiseAJour && (
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
                <Tag color="blueEcume">{t(`frequenceMiseAJour.${doc.frequenceMiseAJour}`, { lng: lang })}</Tag>
              </Typography>
            </Box>
          )}

          {doc.description.map((description, index) => (
            <DsfrMarkdown key={index}>{getTextOpenAPI(description, lang)}</DsfrMarkdown>
          ))}

          {/* {note != null && (
            <Typography sx={{ marginTop: fr.spacing("1w") }} dangerouslySetInnerHTML={{ __html: note }} />
          )}

          {warning != null && (
            <Typography sx={{ marginTop: fr.spacing("1w") }} dangerouslySetInnerHTML={{ __html: warning }} />
          )} */}

          {doc.emailDemandeHabilitations != null && (
            <HabilitationRequise lang={lang} t={t} {...doc.emailDemandeHabilitations} />
          )}
        </Box>
        <BesoinDesDonnes lang={lang} t={t} />
      </Box>
    </>
  );
}
