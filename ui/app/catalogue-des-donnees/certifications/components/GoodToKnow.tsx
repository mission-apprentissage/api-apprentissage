"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Box, Button, Collapse, Typography } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DocField } from "shared/docs/types";

import { DsfrLink } from "@/components/link/DsfrLink";

export function GoodToKnow({ tip }: Pick<DocField, "tip">) {
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
        <Typography>
          <strong>💡Bon à savoir :</strong>
        </Typography>
        <Button
          variant="text"
          endIcon={<i className={fr.cx(isOpen ? "fr-icon-arrow-up-s-line" : "fr-icon-arrow-down-s-line")}></i>}
          onClick={toggle}
          sx={{ color: fr.colors.decisions.text.actionHigh.blueFrance.default }}
          className={fr.cx("fr-text--md", "fr-text--regular")}
        >
          {tip.title}
        </Button>
      </Box>
      <Collapse in={isOpen}>
        <Markdown
          components={{
            p: ({ children }) => <Typography>{children}</Typography>,
            a: ({ children, href }) => (
              <DsfrLink href={href ?? ""} noArrow>
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
