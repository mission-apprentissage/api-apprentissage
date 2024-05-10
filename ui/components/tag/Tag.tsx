import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";

export function Tag({ children }: { children: string }) {
  return (
    <Badge
      small
      style={{
        color: fr.colors.decisions.background.flat.beigeGrisGalet.default,
        backgroundColor: fr.colors.decisions.background.contrast.beigeGrisGalet.default,
      }}
    >
      {children}
    </Badge>
  );
}
