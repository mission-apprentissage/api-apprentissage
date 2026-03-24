import { captureException } from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IDeleteRoutes, IParam } from "shared";
import type { Jsonify } from "type-fest";

import { apiDelete } from "@/utils/api.utils";

export type IDeleteUserInput = Jsonify<IParam<IDeleteRoutes["/_private/admin/users/:id"]>>;

export function useDeleteUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: IDeleteUserInput) => {
      await apiDelete("/_private/admin/users/:id", { params: data });
      return data.id;
    },
    onError: (error) => {
      captureException(error);
      console.error(error);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/_private/admin/users"] });
    },
  });

  return mutation;
}
