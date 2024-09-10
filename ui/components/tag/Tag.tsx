import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import type { ReactNode } from "react";

const colorMap = {
  beigeGrisGalet: {
    color: fr.colors.decisions.background.flat.beigeGrisGalet.default,
    backgroundColor: fr.colors.decisions.background.contrast.beigeGrisGalet.default,
  },
  blueEcume: {
    backgroundColor: fr.colors.decisions.background.alt.blueEcume.default,
    color: fr.colors.decisions.text.actionHigh.blueEcume.default,
  },
} as const;

type TagColor = keyof typeof colorMap;

export function Tag({ children, color }: { children: NonNullable<ReactNode>; color: TagColor }) {
  return (
    <Badge small style={colorMap[color]}>
      {children}
    </Badge>
  );
}
