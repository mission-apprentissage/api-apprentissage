import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { zRoutes } from "shared";
import { IApiKeyPrivateJson } from "shared/models/user.model";

import { apiGet } from "@/utils/api.utils";

type UseApiKeys =
  | {
      isLoading: true;
    }
  | { isLoading: false; apiKeys: IApiKeyPrivateJson[] };

export function useApiKeys(): UseApiKeys {
  const result = useQuery({
    queryKey: [zRoutes.get["/_private/user/api-keys"]],
    queryFn: async () => {
      return apiGet("/_private/user/api-keys", {});
    },
    staleTime: Infinity,
  });

  return useMemo(() => {
    if (result.isPending) {
      return { isLoading: true };
    }

    if (result.isError) {
      throw result.error;
    }

    return { isLoading: false, apiKeys: result.data };
  }, [result]);
}

export function useApiKeysStatut(): "none" | "actif-encrypted" | "actif-ready" | "expired" | "loading" {
  const result = useApiKeys();

  return useMemo(() => {
    if (result.isLoading) {
      return "loading";
    }

    if (result.apiKeys.length === 0) {
      return "none";
    }

    const lastCreatedApiKey = result.apiKeys.findLast((apiKey) => apiKey.value);
    if (lastCreatedApiKey) {
      return "actif-ready";
    }

    const now = Date.now();
    if (result.apiKeys.some((apiKey) => new Date(apiKey.expires_at).getTime() > now)) {
      return "actif-encrypted";
    }

    return "expired";
  }, [result]);
}
