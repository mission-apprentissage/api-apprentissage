"use client";

import { startReactDsfr } from "@codegouvfr/react-dsfr/next-appdir";
import { useIsDarkClientSide } from "@codegouvfr/react-dsfr/useIsDark/client";
import Link from "next/link";
import { useEffect } from "react";

declare module "@codegouvfr/react-dsfr/next-appdir" {
  interface RegisterLink {
    Link: typeof Link;
  }
}

startReactDsfr({ defaultColorScheme: "light", Link });

export function StartDsfr() {
  // Force light mode
  const { isDark, setIsDark } = useIsDarkClientSide();
  useEffect(() => {
    if (isDark) {
      setIsDark(false);
    }
  }, [isDark, setIsDark]);

  //Yes, leave null here.
  return null;
}
