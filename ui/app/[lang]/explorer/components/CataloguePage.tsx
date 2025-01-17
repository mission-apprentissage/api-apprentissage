import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Box, Container } from "@mui/material";
import type { DocPage } from "api-alternance-sdk/internal";

import type { WithLangAndT } from "@/app/i18n/settings";
import { DsfrLink } from "@/components/link/DsfrLink";
import type { IPage } from "@/utils/routes.utils";
import { PAGES } from "@/utils/routes.utils";

import { CatalogueData } from "./CatalogueData";
import { CatalogueHeadline } from "./CatalogueHeadline";
import { DataSources } from "./DataSources";

type Props = WithLangAndT<{
  page: IPage;
  doc: DocPage;
}>;

export function CataloguePage({ lang, t, page, doc }: Props) {
  return (
    <Container maxWidth="xl" sx={{ marginTop: fr.spacing("2w"), marginBottom: fr.spacing("9w") }}>
      <Breadcrumb
        currentPageLabel={page.getTitle(lang, t)}
        homeLinkProps={{ href: "/" }}
        segments={[
          {
            label: PAGES.static.explorerApi.getTitle(lang, t),
            linkProps: { href: PAGES.static.explorerApi.getPath(lang) },
          },
        ]}
        style={{ marginBottom: fr.spacing("3w") }}
      />

      <Box sx={{ mb: fr.spacing("6w") }}>
        <DsfrLink href={PAGES.static.explorerApi.getPath(lang)} arrow="left" size="lg">
          Revenir à la liste
        </DsfrLink>
      </Box>

      <CatalogueHeadline lang={lang} t={t} doc={doc} title={page.getTitle(lang, t)} />
      <CatalogueData doc={doc} lang={lang} t={t} />
      <DataSources sources={doc.sources} />
    </Container>
  );
}
