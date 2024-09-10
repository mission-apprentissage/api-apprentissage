"use client";
import { Container } from "@mui/material";
import type { FC, PropsWithChildren } from "react";

import { withAuth } from "@/components/login/withAuth";

const ProfilLayout: FC<PropsWithChildren> = ({ children }) => {
  return <Container maxWidth="xl">{children}</Container>;
};

export default withAuth(ProfilLayout);
