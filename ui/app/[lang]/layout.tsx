import "react-notion-x/src/styles.css";

import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { createGetHtmlAttributes, DsfrHeadBase } from "@codegouvfr/react-dsfr/next-app-router/server-only-index";
import { Box } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { captureException } from "@sentry/nextjs";
import { dir } from "i18next";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import type { ISessionJson } from "shared/routes/_private/auth.routes";

import { DsfrProvider, StartDsfrOnHydration } from "./DsfrProvider";
import NotFoundPage from "./not-found";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import { languages } from "@/app/i18n/settings";
import { StartIntl } from "@/app/i18n/StartIntl";
import Footer from "@/components/Footer";
import { Header } from "@/components/header/Header";
import { AuthContextProvider } from "@/context/AuthContext";
import { defaultColorScheme } from "@/theme/defaultColorScheme";
import type { ApiError } from "@/utils/api.utils";
import { apiGet } from "@/utils/api.utils";

const { getHtmlAttributes } = createGetHtmlAttributes({ defaultColorScheme });

async function getSession(): Promise<ISessionJson | null> {
  try {
    const session = await apiGet(`/_private/auth/session`, {}, { cache: "no-store" });
    return session;
  } catch (error) {
    if ((error as ApiError).context?.statusCode !== 401) {
      captureException(error);
    }

    return null;
  }
}
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon.svg" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  title: "Espace développeurs La bonne alternance",
  description: "Un service de la Mission Apprentissage",
};

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: PropsWithChildren<PropsWithLangParams>) {
  const { lang: requestedLang } = await params;
  const session = await getSession();

  const lang = languages.includes(requestedLang) ? requestedLang : languages[0];

  return (
    <html {...getHtmlAttributes({ lang })} dir={dir(lang)}>
      <head>
        <StartIntl lang={lang} />
        <DsfrHeadBase
          Link={Link}
          preloadFonts={[
            //"Marianne-Light",
            //"Marianne-Light_Italic",
            "Marianne-Regular",
            //"Marianne-Regular_Italic",
            "Marianne-Medium",
            //"Marianne-Medium_Italic",
            "Marianne-Bold",
            //"Marianne-Bold_Italic",
            //"Spectral-Regular",
            //"Spectral-ExtraBold"
          ]}
        />
      </head>
      <body>
        <AppRouterCacheProvider>
          <AuthContextProvider initialSession={session ?? null}>
            <DsfrProvider lang={lang}>
              <StartDsfrOnHydration />
              <MuiDsfrThemeProvider>
                <Header lang={lang} />
                <Box
                  sx={{
                    minHeight: "60vh",
                    color: fr.colors.decisions.text.default.grey.default,
                  }}
                >
                  {lang === requestedLang ? children : <NotFoundPage />}
                </Box>
                <Footer lang={lang} />
              </MuiDsfrThemeProvider>
            </DsfrProvider>
          </AuthContextProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
