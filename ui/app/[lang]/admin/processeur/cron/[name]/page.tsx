"use client";
import { Box, Typography } from "@mui/material";
import { ProcessorStatusCronComponent } from "job-processor/dist/react";
import { use } from "react";
import { useTranslation } from "react-i18next";

import { ProcessorStatusProvider } from "@/app/[lang]/admin/processeur/components/ProcessorStatusProvider";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { publicConfig } from "@/config.public";
import { PAGES } from "@/utils/routes.utils";

export default function JobTypePage({ params }: PropsWithLangParams<{ name: string }>) {
  const { name: rawName, lang } = use(params);
  const name = decodeURIComponent(rawName);
  const { t } = useTranslation("global", { lng: lang });
  return (
    <Box>
      <Breadcrumb pages={[PAGES.static.adminProcessor, PAGES.dynamic.adminProcessorCron(name)]} lang={lang} t={t} />
      <Typography variant="h2" gutterBottom>
        {PAGES.dynamic.adminProcessorCron(name).getTitle(lang, t)}
      </Typography>
      <ProcessorStatusProvider>
        {(status) => (
          <ProcessorStatusCronComponent
            name={name}
            status={status}
            baseUrl={new URL(PAGES.static.adminProcessor.getPath(lang), publicConfig.baseUrl).href}
          />
        )}
      </ProcessorStatusProvider>
    </Box>
  );
}
