"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import PlausibleProvider from "next-plausible";
import { FC } from "react";

import { publicConfig } from "../config.public";
import { queryClient } from "../utils/query.utils";

interface Props {
  children: React.ReactNode;
}

const RootTemplate: FC<Props> = ({ children }) => {
  return (
    <PlausibleProvider trackLocalhost={false} domain={publicConfig.host}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PlausibleProvider>
  );
};

export default RootTemplate;
