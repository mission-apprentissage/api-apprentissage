"use client";
import { Box, Typography } from "@mui/material";
import { ProcessorStatusTaskComponent } from "job-processor/dist/react";
import { useTranslation } from "react-i18next";

import { ProcessorStatusProvider } from "@/app/[lang]/admin/processeur/components/ProcessorStatusProvider";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { publicConfig } from "@/config.public";
import { PAGES } from "@/utils/routes.utils";

export default function JobInstancePage({ params }: PropsWithLangParams<{ name: string; id: string }>) {
  const name = decodeURIComponent(params.name);
  const id = decodeURIComponent(params.id);
  const { lang } = params;
  const { t } = useTranslation("global", { lng: lang });

  return (
    <Box>
      <Breadcrumb
        pages={[
          PAGES.static.adminProcessor,
          PAGES.dynamic.adminProcessorJob(name),
          PAGES.dynamic.adminProcessorJobInstance({ name, id }),
        ]}
        lang={lang}
        t={t}
      />
      <Typography variant="h2" gutterBottom>
        {PAGES.dynamic.adminProcessorJobInstance({ name, id }).getTitle(lang, t)}
      </Typography>
      <ProcessorStatusProvider>
        {(status) => (
          <ProcessorStatusTaskComponent
            name={name}
            status={status}
            baseUrl={new URL(PAGES.static.adminProcessor.getPath(lang), publicConfig.baseUrl).href}
            id={id}
            type="job"
          />
        )}
      </ProcessorStatusProvider>
    </Box>
  );
}
