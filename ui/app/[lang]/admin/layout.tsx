"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Container } from "@mui/material";
import type { FC, PropsWithChildren } from "react";

import { withAuth } from "@/components/login/withAuth";

const AdminLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Container
      maxWidth="xl"
      sx={{
        my: fr.spacing("4w"),
      }}
    >
      {children}
    </Container>
  );
};

export default withAuth(AdminLayout);
