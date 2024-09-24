"use client";
import { Box, Typography } from "@mui/material";
import { ProcessorStatusJobComponent } from "job-processor/dist/react";
import { useTranslation } from "react-i18next";

import { ProcessorStatusProvider } from "@/app/[lang]/admin/processeur/components/ProcessorStatusProvider";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { publicConfig } from "@/config.public";
import { PAGES } from "@/utils/routes.utils";

export default function JobTypePage({ params }: PropsWithLangParams<{ name: string }>) {
  const name = decodeURIComponent(params.name);
  const { lang } = params;
  const { t } = useTranslation("global", { lng: lang });
  return (
    <Box>
      <Breadcrumb pages={[PAGES.static.adminProcessor, PAGES.dynamic.adminProcessorJob(name)]} lang={lang} t={t} />
      <Typography variant="h2" gutterBottom>
        {PAGES.dynamic.adminProcessorJob(name).getTitle(lang, t)}
      </Typography>
      <ProcessorStatusProvider>
        {(status) => (
          <ProcessorStatusJobComponent
            name={name}
            status={status}
            baseUrl={new URL(PAGES.static.adminProcessor.path, publicConfig.baseUrl).href}
          />
        )}
      </ProcessorStatusProvider>
    </Box>
  );
}
