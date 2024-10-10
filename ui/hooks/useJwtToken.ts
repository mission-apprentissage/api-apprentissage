import { captureException } from "@sentry/nextjs";
import { jwtDecode } from "jwt-decode";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

type UseJwtToken =
  | {
      valid: true;
      value: string;
    }
  | { valid: false; error: string };

export function useJwtToken(): UseJwtToken {
  const token = useSearchParams().get("token") ?? null;

  return useMemo(() => {
    if (!token) {
      return {
        valid: false,
        error: "Le lien pour accéder à cette ressource est invalide, le jeton de connexion est introuvable",
      };
    }

    try {
      jwtDecode(token);
    } catch (error) {
      captureException(error);
      console.error(error);
      return {
        valid: false,
        error: "Le lien pour accéder à cette ressource est invalide, le jeton de connexion est invalide",
      };
    }

    return { valid: true, value: token };
  }, [token]);
}
