"use client";
import { Container } from "@mui/material";
import { FC, PropsWithChildren } from "react";

import { withAuth } from "@/components/login/withAuth";

const AdminLayout: FC<PropsWithChildren> = ({ children }) => {
  return <Container maxWidth="xl">{children}</Container>;
};

export default withAuth(AdminLayout);
