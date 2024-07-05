import { Typography } from "@mui/material";
import { FC } from "react";
import { IUserPublic } from "shared/models/user.model";

import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import InfoDetails from "@/components/infoDetails/InfoDetails";
import { formatDate } from "@/utils/date.utils";
import { PAGES } from "@/utils/routes.utils";

interface Props {
  user: IUserPublic;
}

const UserView: FC<Props> = ({ user }) => {
  return (
    <>
      <Breadcrumb pages={[PAGES.static.adminUsers, PAGES.dynamic.adminUserView(user._id)]} />
      <Typography variant="h2" gutterBottom>
        Fiche utilisateur
      </Typography>

      <InfoDetails
        data={user}
        rows={{
          _id: {
            header: () => "Identifiant",
          },
          email: {
            header: () => "Email",
          },
          is_admin: {
            header: () => "Administrateur",
            cell: ({ is_admin }) => (is_admin ? "Oui" : "Non"),
          },
          has_api_key: {
            header: () => "Clé d'API générée",
            cell: ({ has_api_key }) => (has_api_key ? "Oui" : "Non"),
          },
          api_key_used_at: {
            header: () => "Dernière utilisation API",
            cell: ({ api_key_used_at }) => {
              return api_key_used_at ? formatDate(api_key_used_at, "PPP à p") : "Jamais";
            },
          },
        }}
      />
    </>
  );
};

export default UserView;
