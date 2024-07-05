// import "./globals.css";
import "react-notion-x/src/styles.css";

import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { DsfrProvider } from "@codegouvfr/react-dsfr/next-appdir/DsfrProvider";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import { Box } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { captureException } from "@sentry/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { IUserPublic } from "shared/models/user.model";

import Footer from "@/components/Footer";
import { Header } from "@/components/header/Header";
import { AuthContextProvider } from "@/context/AuthContext";
import { defaultColorScheme } from "@/theme/defaultColorScheme";
import { ApiError, apiGet } from "@/utils/api.utils";

import { StartDsfr } from "./StartDsfr";
import { StartIntl } from "./StartIntl";

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

export const metadata: Metadata = {
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon.svg" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  title: "API Apprentissage",
  description: "Un service de la Mission Apprentissage",
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await getSession();
  const lang = "fr";
  return (
    <html {...getHtmlAttributes({ defaultColorScheme, lang })}>
      <head>
        <StartDsfr />
        <StartIntl />
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
                <Header />
                <Box
                  sx={{
                    minHeight: "60vh",
                    color: fr.colors.decisions.text.default.grey.default,
                  }}
                >
                  {children}
                </Box>
                <Footer />
              </MuiDsfrThemeProvider>
            </DsfrProvider>
          </AuthContextProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
