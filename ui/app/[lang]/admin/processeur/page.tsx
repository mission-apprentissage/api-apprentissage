"use client";
import { Box, Typography } from "@mui/material";
import { ProcessorStatusIndexComponent } from "job-processor/dist/react";
import { use } from "react";
import { useTranslation } from "react-i18next";

import { ProcessorStatusProvider } from "./components/ProcessorStatusProvider";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { publicConfig } from "@/config.public";
import { PAGES } from "@/utils/routes.utils";

export default function AdminProcessorPage({ params }: PropsWithLangParams) {
  const { lang } = use(params);
  const { t } = useTranslation("global", { lng: lang });
  return (
    <Box>
      <Breadcrumb pages={[PAGES.static.adminProcessor]} lang={lang} t={t} />
      <Typography variant="h2" gutterBottom>
        {PAGES.static.adminProcessor.getTitle(lang, t)}
      </Typography>
      <ProcessorStatusProvider>
        {(status) => (
          <ProcessorStatusIndexComponent
            status={status}
            baseUrl={new URL(PAGES.static.adminProcessor.getPath(lang), publicConfig.baseUrl).href}
          />
        )}
      </ProcessorStatusProvider>
    </Box>
  );
}
