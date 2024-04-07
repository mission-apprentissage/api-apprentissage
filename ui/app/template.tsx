"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import PlausibleProvider from "next-plausible";
import { FC, useRef } from "react";

import { publicConfig } from "../config.public";
import { queryClient } from "../utils/query.utils";

interface Props {
  children: React.ReactNode;
}

const RootTemplate: FC<Props> = ({ children }) => {
  const searchParams = useSearchParams();
  const tracking = useRef(searchParams?.get("notracking") !== "true");

  return (
    <PlausibleProvider trackLocalhost={false} enabled={tracking.current} domain={publicConfig.host}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PlausibleProvider>
  );
};

export default RootTemplate;
