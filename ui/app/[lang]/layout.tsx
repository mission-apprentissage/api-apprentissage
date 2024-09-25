import "react-notion-x/src/styles.css";

import { fr } from "@codegouvfr/react-dsfr";
// eslint-disable-next-line import/no-named-as-default
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import { Box } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { captureException } from "@sentry/nextjs";
import { dir } from "i18next";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import type { IUserPublic } from "shared/models/user.model";

import type { PropsWithLangParams } from "@/app/i18n/settings";
import { languages } from "@/app/i18n/settings";
import { StartIntl } from "@/app/i18n/StartIntl";
import Footer from "@/components/Footer";
import { Header } from "@/components/header/Header";
import { AuthContextProvider } from "@/context/AuthContext";
import { defaultColorScheme } from "@/theme/defaultColorScheme";
import type { ApiError } from "@/utils/api.utils";
import { apiGet } from "@/utils/api.utils";

import NotFoundPage from "./not-found";
import { StartDsfr } from "./StartDsfr";

async function getSession(): Promise<IUserPublic | undefined> {
  try {
    const session: IUserPublic = await apiGet(`/_private/auth/session`, {}, { cache: "no-store" });
    return session;
  } catch (error) {
    if ((error as ApiError).context?.statusCode !== 401) {
      captureException(error);
    }

    return;
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
  title: "API Apprentissage",
  description: "Un service de la Mission Apprentissage",
};

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params: { lang: requestedLang },
}: PropsWithChildren<PropsWithLangParams>) {
  const session = await getSession();

  const lang = languages.includes(requestedLang) ? requestedLang : languages[0];

  return (
    <html {...getHtmlAttributes({ defaultColorScheme, lang })} dir={dir(lang)}>
      <head>
        <StartDsfr />
        <StartIntl lang={lang} />
        <DsfrHead
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
          <AuthContextProvider initialUser={session ?? null}>
            <DsfrProvider lang={lang}>
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
