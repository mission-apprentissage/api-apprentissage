import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IBody, IPostRoutes, zRoutes } from "shared";
import { IApiKeyPrivateJson } from "shared/models/user.model";
import { Jsonify } from "type-fest";

import { apiPost } from "@/utils/api.utils";

export type ICreateApiKeyInput = Jsonify<IBody<IPostRoutes["/_private/user/api-key"]>>;

export function useCreateApiKeyMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ICreateApiKeyInput) => {
      const result = await apiPost("/_private/user/api-key", {
        body: data,
      });
      return result;
    },
    onSuccess: (data: IApiKeyPrivateJson) => {
      queryClient.setQueriesData<IApiKeyPrivateJson[]>(
        {
          queryKey: [zRoutes.get["/_private/user/api-keys"]],
        },
        (oldData): IApiKeyPrivateJson[] => {
          return oldData ? [...oldData, data] : [data];
        }
      );
    },
  });

  return mutation;
}
