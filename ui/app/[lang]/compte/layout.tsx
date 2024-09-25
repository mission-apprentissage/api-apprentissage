"use client";
import { Container } from "@mui/material";
import type { FC, PropsWithChildren } from "react";

import type { PropsWithLangParams } from "@/app/i18n/settings";
import { withAuth } from "@/components/login/withAuth";

const ProfilLayout: FC<PropsWithChildren<PropsWithLangParams>> = ({ children, params: { lang } }) => {
  return <Container maxWidth="xl">{children}</Container>;
};

export default withAuth(ProfilLayout);
