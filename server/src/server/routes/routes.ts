import type { Server } from "@/server/server";

import { userAdminRoutes } from "./_private/admin/user.routes";
import { authRoutes } from "./_private/auth.routes";
import { emailsRoutes } from "./_private/emails.routes";
import { userRoutes } from "./_private/user.routes";
import { certificationsRoutes } from "./certification.routes";
import { siretUaiRoutes } from "./experimental/siret.uai.routes";
import { healthcheckRoutes } from "./healthcheck.routes";

type RegisterRoutes = (opts: { server: Server }) => void;

export const registerRoutes: RegisterRoutes = ({ server }) => {
  healthcheckRoutes({ server });
  authRoutes({ server });
  userRoutes({ server });
  emailsRoutes({ server });
  userAdminRoutes({ server });
  certificationsRoutes({ server });
  siretUaiRoutes({ server });
};
