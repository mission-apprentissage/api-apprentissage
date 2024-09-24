"use client";
import { Box, Typography } from "@mui/material";
import { ProcessorStatusIndexComponent } from "job-processor/dist/react";
import { useTranslation } from "react-i18next";

import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { publicConfig } from "@/config.public";
import { PAGES } from "@/utils/routes.utils";

import { ProcessorStatusProvider } from "./components/ProcessorStatusProvider";

export default function AdminProcessorPage({ params: { lang } }: PropsWithLangParams) {
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
            baseUrl={new URL(PAGES.static.adminProcessor.path, publicConfig.baseUrl).href}
          />
        )}
      </ProcessorStatusProvider>
    </Box>
  );
}
