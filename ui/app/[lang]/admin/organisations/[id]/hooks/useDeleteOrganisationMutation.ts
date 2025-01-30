import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { IDeleteRoutes, IParam } from "shared";
import { zRoutes } from "shared";
import type { IOrganisationInternal } from "shared/models/organisation.model";
import type { Jsonify } from "type-fest";

import { apiDelete } from "@/utils/api.utils";

export type IDeleteOrganisationInput = Jsonify<IParam<IDeleteRoutes["/_private/admin/organisations/:id"]>>;

export function useDeleteOrganisationMutation() {
  const queryClient = useQueryClient();
  const { push } = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: IDeleteOrganisationInput) => {
      await apiDelete("/_private/admin/organisations/:id", {
        params: data,
      });

      return data.id;
    },
    onSuccess: (id: string) => {
      queryClient.setQueriesData<IOrganisationInternal[]>(
        {
          queryKey: [zRoutes.get["/_private/admin/organisations"]],
        },
        (oldData): IOrganisationInternal[] => {
          return oldData ? oldData.filter((organisation) => organisation._id.toString() !== id) : [];
        }
      );
      push("/admin/organisations");
    },
  });

  return mutation;
}
