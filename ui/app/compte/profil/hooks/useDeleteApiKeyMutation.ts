import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IDeleteRoutes, IParam, zRoutes } from "shared";
import { IApiKeyPrivateJson } from "shared/models/user.model";
import { Jsonify } from "type-fest";

import { apiDelete } from "@/utils/api.utils";

export type IDeleteApiKeyInput = Jsonify<IParam<IDeleteRoutes["/_private/user/api-key/:id"]>>;

export function useDeleteApiKeyMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: IDeleteApiKeyInput) => {
      await apiDelete("/_private/user/api-key/:id", {
        params: data,
      });

      return data.id;
    },
    onSuccess: (id: string) => {
      queryClient.setQueriesData<IApiKeyPrivateJson[]>(
        {
          queryKey: [zRoutes.get["/_private/user/api-keys"]],
        },
        (oldData): IApiKeyPrivateJson[] => {
          return oldData ? oldData.filter((apiKey) => apiKey._id !== id) : [];
        }
      );
    },
  });

  return mutation;
}