import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { IDeleteRoutes, IParam } from "shared";
import { zRoutes } from "shared";
import type { IOrganisationInternal } from "shared/models/organisation.model";
import type { Jsonify } from "type-fest";

import { apiDelete } from "@/utils/api.utils";

export type IDeleteOrganisationInput = Jsonify<IParam<IDeleteRoutes["/_private/admin/organisations/:id"]>>;

export function useDeleteOrganisation() {
  const queryClient = useQueryClient();
  const { push } = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: IDeleteOrganisationInput) => {
      await apiDelete("/_private/admin/organisations/:id", { params: data });
      return data.id;
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: [zRoutes.get["/_private/admin/organisations"]] });

      const previousOrganisations = queryClient.getQueryData<IOrganisationInternal[]>([
        zRoutes.get["/_private/admin/organisations"],
      ]);

      queryClient.setQueryData<IOrganisationInternal[]>([zRoutes.get["/_private/admin/organisations"]], (oldData) =>
        oldData ? oldData.filter((organisation) => organisation._id.toString() !== data.id) : []
      );

      return { previousOrganisations };
    },
    onError: (_error, _data, context) => {
      if (context?.previousOrganisations) {
        queryClient.setQueryData([zRoutes.get["/_private/admin/organisations"]], context.previousOrganisations);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [zRoutes.get["/_private/admin/organisations"]] });
    },
    onSuccess: () => {
      push("/admin/organisations");
    },
  });

  return mutation;
}
