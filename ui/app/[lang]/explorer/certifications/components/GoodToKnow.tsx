"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Box, Collapse, Typography } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { DocBusinessField } from "api-alternance-sdk/internal";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { DsfrLink } from "@/components/link/DsfrLink";

export function GoodToKnow({ tip }: Pick<DocBusinessField, "tip">) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  if (!tip) return null;

  return (
    <Box
      sx={{
        gridColumn: {
          sm: "1/-1",
          md: "2/-1",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography className={fr.cx("fr-text--bold")}>💡Bon à savoir :</Typography>
        <Button
          priority="tertiary no outline"
          iconId={isOpen ? "fr-icon-arrow-up-s-line" : "fr-icon-arrow-down-s-line"}
          iconPosition="right"
          onClick={toggle}
        >
          {tip.title}
        </Button>
      </Box>
      <Collapse in={isOpen}>
        <Markdown
          components={{
            p: ({ children }) => <Typography>{children}</Typography>,
            a: ({ children, href }) => (
              <DsfrLink href={href ?? ""} arrow="none" size="lg">
                {children}
              </DsfrLink>
            ),
            table: ({ children }) => {
              return (
                <Table
                  sx={{
                    tableLayout: "fixed",
                  }}
                  stickyHeader
                >
                  {children}
                </Table>
              );
            },
            thead: ({ children }) => <TableHead>{children}</TableHead>,
            tbody: ({ children }) => <TableBody>{children}</TableBody>,
            tr: ({ children }) => <TableRow>{children}</TableRow>,
            th: ({ children }) => (
              <TableCell
                sx={{
                  borderBottomColor: fr.colors.decisions.border.plain.grey.default,
                  backgroundColor: fr.colors.decisions.background.contrast.grey.default,
                }}
                className={fr.cx("fr-text--sm", "fr-text--bold")}
              >
                {children}
              </TableCell>
            ),
            td: ({ children }) => (
              <TableCell
                sx={{
                  borderBottomColor: fr.colors.decisions.border.default.grey.default,
                  backgroundColor: fr.colors.decisions.background.alt.grey.default,
                }}
              >
                {children}
              </TableCell>
            ),
          }}
          remarkPlugins={[remarkGfm]}
        >
          {tip.content}
        </Markdown>
      </Collapse>
    </Box>
  );
}