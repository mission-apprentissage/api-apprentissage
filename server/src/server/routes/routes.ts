import { importerAdminRoutes } from "./_private/admin/importer.routes.js";
import { organisationAdminRoutes } from "./_private/admin/organisations.routes.js";
import { processorAdminRoutes } from "./_private/admin/processor.admin.routes.js";
import { userAdminRoutes } from "./_private/admin/user.routes.js";
import { authRoutes } from "./_private/auth.routes.js";
import { emailsRoutes } from "./_private/emails.routes.js";
import { simulateurRoutes } from "./_private/simulateur/simulateur.routes.js";
import { userRoutes } from "./_private/user.routes.js";
import { certificationsRoutes } from "./certification.routes.js";
import { sourceAcceRoutes } from "./experimental/sources/acce.routes.js";
import { formationRoutes } from "./formations/formations.routes.js";
import { geographieRoutes } from "./geographie.route.js";
import { healthcheckRoutes } from "./healthcheck.routes.js";
import { jobRoutes } from "./job/job.routes.js";
import { organismeRoutes } from "./organisme.routes.js";
import type { Server } from "@/server/server.js";

type RegisterRoutes = (opts: { server: Server }) => void;

export const registerRoutes: RegisterRoutes = ({ server }) => {
  healthcheckRoutes({ server });
  authRoutes({ server });
  userRoutes({ server });
  emailsRoutes({ server });
  userAdminRoutes({ server });
  organisationAdminRoutes({ server });
  processorAdminRoutes({ server });
  certificationsRoutes({ server });
  organismeRoutes({ server });
  sourceAcceRoutes({ server });
  simulateurRoutes({ server });
  jobRoutes({ server });
  formationRoutes({ server });
  geographieRoutes({ server });
  importerAdminRoutes({ server });
};
