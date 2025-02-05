import { captureException } from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { IDeleteRoutes, IParam } from "shared";
import { zRoutes } from "shared";
import type { Jsonify } from "type-fest";

import { apiDelete } from "@/utils/api.utils";

export type IDeleteOrganisationInput = Jsonify<IParam<IDeleteRoutes["/_private/admin/organisations/:id"]>>;

export function useDeleteOrganisation() {
  const queryClient = useQueryClient();
  const { push, refresh } = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: IDeleteOrganisationInput) => {
      await apiDelete("/_private/admin/organisations/:id", { params: data });
      return data.id;
    },
    onError: (error) => {
      captureException(error);
      console.error(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [zRoutes.get["/_private/admin/organisations"]] });
    },
    onSuccess: () => {
      push("/admin/organisations");
      refresh();
    },
  });

  return mutation;
}
