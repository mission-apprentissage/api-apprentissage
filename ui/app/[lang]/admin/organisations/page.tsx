import { Typography } from "@mui/material";

import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { PAGES } from "@/utils/routes.utils";

import OrganisationList from "./components/OrganisationList";

export default function AdminOrganisationPage() {
  return (
    <>
      <Breadcrumb pages={[PAGES.static.adminOrganisations]} />
      <Typography variant="h2" gutterBottom>
        {PAGES.static.adminOrganisations.title}
      </Typography>
      <OrganisationList />
    </>
  );
}
