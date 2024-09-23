"use client";
import { Box, Typography } from "@mui/material";
import { ProcessorStatusCronComponent } from "job-processor/dist/react";

import { ProcessorStatusProvider } from "@/app/[lang]/admin/processeur/components/ProcessorStatusProvider";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { publicConfig } from "@/config.public";
import { PAGES } from "@/utils/routes.utils";

export default function JobTypePage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  return (
    <Box>
      <Breadcrumb pages={[PAGES.static.adminProcessor, PAGES.dynamic.adminProcessorCron(name)]} />
      <Typography variant="h2" gutterBottom>
        {PAGES.dynamic.adminProcessorCron(name).title}
      </Typography>
      <ProcessorStatusProvider>
        {(status) => (
          <ProcessorStatusCronComponent
            name={name}
            status={status}
            baseUrl={new URL(PAGES.static.adminProcessor.path, publicConfig.baseUrl).href}
          />
        )}
      </ProcessorStatusProvider>
    </Box>
  );
}
