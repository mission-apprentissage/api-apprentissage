import { Typography } from "@mui/material";

import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { PAGES } from "@/utils/routes.utils";

import UserList from "./components/UserList";

const AdminUsersPage = () => {
  return (
    <>
      <Breadcrumb pages={[PAGES.static.adminUsers]} />
      <Typography variant="h2" gutterBottom>
        Gestion des utilisateurs
      </Typography>
      <UserList />
    </>
  );
};

export default AdminUsersPage;
