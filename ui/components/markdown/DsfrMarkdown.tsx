import { Box } from "@mui/material";
import Markdown from "react-markdown";

import { DsfrLink } from "@/components/link/DsfrLink";
import { Tag } from "@/components/tag/Tag";

export function DsfrMarkdown({ children }: { children: string | null | undefined }) {
  return (
    <Markdown
      components={{
        p: ({ children }) => <Box>{children}</Box>,
        a: ({ children, href }) => (
          <DsfrLink href={href ?? ""} arrow="none">
            {children}
          </DsfrLink>
        ),
        code: ({ children }) => {
          return children ? <Tag color="beigeGrisGalet">{children}</Tag> : null;
        },
      }}
    >
      {children}
    </Markdown>
  );
}
