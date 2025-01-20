import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/utils/api.utils";

export function useImporterStatus() {
  return useQuery({
    queryKey: ["/_private/importers/status"],
    queryFn: async () => {
      return apiGet("/_private/importers/status", {});
    },
  });
}
