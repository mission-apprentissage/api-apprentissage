"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { Snackbar } from "@mui/material";
import { captureException } from "@sentry/nextjs";
import { jwtDecode } from "jwt-decode";
import { useSearchParams } from "next/navigation";
import { ComponentType, useEffect, useMemo, useState } from "react";
import { assertUnreachable } from "shared";
import { IUserPublic } from "shared/models/user.model";
import { IAccessToken } from "shared/routes/common.routes";

import { useAuth } from "../../context/AuthContext";
import { ApiError, apiPost } from "../../utils/api.utils";
import { LoginModal } from "./LoginModal";

type UseLoginToken =
  | {
      status: "defined";
      value: string;
    }
  | {
      status: "error";
      error: string;
    }
  | {
      status: "missing";
    };

function useLoginToken(): UseLoginToken {
  const token = useSearchParams().get("token") ?? null;

  return useMemo(() => {
    if (!token) {
      return { status: "missing" };
    }

    try {
      const decoded = jwtDecode<IAccessToken>(token);
      if (decoded.scopes.some((s) => s.path === "/_private/auth/login" && s.method === "post")) {
        return { status: "defined", value: token };
      }
      return { status: "missing" };
    } catch (error) {
      captureException(error);
      console.error(error);
      return {
        status: "error",
        error: "Le lien de connexion est invalide",
      };
    }
  }, [token]);
}

type UseLogin =
  | {
      status: "connected";
      user: IUserPublic;
    }
  | {
      status: "disconnected";
    }
  | {
      status: "loading";
    }
  | {
      status: "error";
      error: string;
    };

function useLogin() {
  const token = useLoginToken();
  const { user, setUser } = useAuth();
  const [status, setStatus] = useState<UseLogin>({ status: token.status === "missing" ? "disconnected" : "loading" });

  useEffect(() => {
    try {
      if (user) {
        setStatus((current) =>
          current.status === "connected" && current.user === user ? current : { status: "connected", user }
        );
        return;
      }

      const controller = new AbortController();

      switch (token.status) {
        case "defined":
          apiPost("/_private/auth/login", {
            headers: {
              authorization: `Bearer ${token.value}`,
            },
            body: null,
            signal: controller.signal,
          })
            .then((user) => {
              setUser(user);
              setStatus({ status: "connected", user });
            })
            .catch((error) => {
              setUser(null);
              if (!controller.signal.aborted) {
                console.error(error);
                if (error instanceof ApiError && error.context.statusCode < 500) {
                  setStatus({ status: "error", error: error.context.message });
                } else {
                  captureException(error);
                  setStatus({
                    status: "error",
                    error: "Une erreur est survenue lors de la connection. Veuillez réessayer ultérieurement.",
                  });
                }
              }
            });
          break;
        case "missing":
          setStatus({ status: "disconnected" });
          break;
        case "error":
          setStatus({ status: "error", error: token.error });
          break;
        default:
          assertUnreachable(token);
      }

      return () => {
        controller.abort();
      };
    } catch (error) {
      console.error(error);
      setStatus({
        status: "error",
        error: "Une erreur est survenue lors de la connection. Veuillez réessayer ultérieurement.",
      });
    }
  }, [token, user]);

  return status;
}

export function withAuth<P>(Component: ComponentType<P & { user: IUserPublic }>) {
  return function AuthComponent(props: P) {
    const status = useLogin();

    switch (status.status) {
      case "connected":
        return <Component {...props} user={status.user} />;
      case "disconnected":
        return <LoginModal />;
      case "loading":
        return null;
      case "error":
        return (
          <>
            <Snackbar open anchorOrigin={{ vertical: "top", horizontal: "center" }}>
              <Alert severity="error" description={status.error} small />
            </Snackbar>
            <LoginModal />
          </>
        );
      default:
        assertUnreachable(status);
    }
  };
}
