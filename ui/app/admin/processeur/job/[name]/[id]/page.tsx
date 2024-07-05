"use client";
import { Box, Typography } from "@mui/material";
import { ProcessorStatusTaskComponent } from "job-processor/dist/react";

import { ProcessorStatusProvider } from "@/app/admin/processeur/components/ProcessorStatusProvider";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { publicConfig } from "@/config.public";
import { PAGES } from "@/utils/routes.utils";

export default function JobInstancePage({ params }: { params: { name: string; id: string } }) {
  const name = decodeURIComponent(params.name);
  const id = decodeURIComponent(params.id);

  return (
    <Box>
      <Breadcrumb
        pages={[
          PAGES.static.adminProcessor,
          PAGES.dynamic.adminProcessorJob(name),
          PAGES.dynamic.adminProcessorJobInstance({ name, id }),
        ]}
      />
      <Typography variant="h2" gutterBottom>
        {PAGES.dynamic.adminProcessorJobInstance({ name, id }).title}
      </Typography>
      <ProcessorStatusProvider>
        {(status) => (
          <ProcessorStatusTaskComponent
            name={name}
            status={status}
            baseUrl={new URL(PAGES.static.adminProcessor.path, publicConfig.baseUrl).href}
            id={id}
            type="job"
          />
        )}
      </ProcessorStatusProvider>
    </Box>
  );
}
