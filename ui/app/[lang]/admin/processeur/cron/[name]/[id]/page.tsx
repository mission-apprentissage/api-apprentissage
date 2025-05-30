"use client";
import { Box, Typography } from "@mui/material";
import { ProcessorStatusTaskComponent } from "job-processor/dist/react";
import { use } from "react";
import { useTranslation } from "react-i18next";

import { ProcessorStatusProvider } from "@/app/[lang]/admin/processeur/components/ProcessorStatusProvider";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { publicConfig } from "@/config.public";
import { PAGES } from "@/utils/routes.utils";

export default function JobInstancePage({ params }: PropsWithLangParams<{ name: string; id: string }>) {
  const { name: rawName, id: rawId, lang } = use(params);
  const name = decodeURIComponent(rawName);
  const id = decodeURIComponent(rawId);
  const { t } = useTranslation("global", { lng: lang });

  return (
    <Box>
      <Breadcrumb
        pages={[
          PAGES.static.adminProcessor,
          PAGES.dynamic.adminProcessorCron(name),
          PAGES.dynamic.adminProcessorCronTask({ name, id }),
        ]}
        lang={lang}
        t={t}
      />
      <Typography variant="h2" gutterBottom>
        {PAGES.dynamic.adminProcessorCronTask({ name, id }).getTitle(lang, t)}
      </Typography>
      <ProcessorStatusProvider>
        {(status) => (
          <ProcessorStatusTaskComponent
            name={name}
            status={status}
            baseUrl={new URL(PAGES.static.adminProcessor.getPath(lang), publicConfig.baseUrl).href}
            id={id}
            type="cron"
          />
        )}
      </ProcessorStatusProvider>
    </Box>
  );
}
