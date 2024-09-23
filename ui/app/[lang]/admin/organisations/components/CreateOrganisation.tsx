"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { captureException } from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zRoutes } from "shared";
import type { IOrganisationCreate } from "shared/models/organisation.model";

import { apiPost } from "@/utils/api.utils";

const modal = createModal({
  id: "admin-create-organisation",
  isOpenedByDefault: false,
});

export function CreateOrganisation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (body: IOrganisationCreate) => {
      await apiPost("/_private/admin/organisations", { body });
    },
    onError: (error) => {
      console.error(error);
      captureException(error);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/_private/admin/organisations"] });
      modal.close();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<IOrganisationCreate>({
    resolver: zodResolver(zRoutes.post["/_private/admin/organisations"].body),
  });

  if (mutation.isError) {
    throw mutation.error;
  }

  return (
    <>
      <Button nativeButtonProps={modal.buttonProps}>Créer une organisation</Button>

      <modal.Component
        title="Créer une organisation"
        buttons={[
          {
            children: "Annuler",
            disabled: isSubmitting,
          },
          {
            type: "submit",
            onClick: handleSubmit(async (d) => mutation.mutateAsync(d)),
            children: "Créer",
            disabled: isSubmitting,
            doClosesModal: false,
          },
        ]}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(async (d) => mutation.mutateAsync(d))}
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Input
            label="Nom de l'organisation"
            hintText="Le nom de l'organisation ne pourra pas être modifié par la suite"
            state={errors?.nom ? "error" : "default"}
            stateRelatedMessage={errors?.nom?.message ?? "Erreur de validation"}
            nativeInputProps={register("nom", { required: false })}
          />
        </Box>
      </modal.Component>
    </>
  );
}
