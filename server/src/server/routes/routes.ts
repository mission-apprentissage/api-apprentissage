import type { Server } from "../server";
import { userAdminRoutes } from "./admin/user.routes";
import { authRoutes } from "./auth.routes";
import { emailsRoutes } from "./emails.routes";
import { healthcheckRoutes } from "./healthcheck.routes";
import { userRoutes } from "./user.routes";

type RegisterRoutes = (opts: { server: Server }) => void;

export const registerRoutes: RegisterRoutes = ({ server }) => {
  healthcheckRoutes({ server });
  authRoutes({ server });
  userRoutes({ server });
  emailsRoutes({ server });
  userAdminRoutes({ server });
};
