import "./overwride.css";

import acceptLanguage from "accept-language";
import { headers } from "next/headers";

import type { PropsWithLangParams } from "@/app/i18n/settings";

import RedocPageClient from "./components/redoc";

acceptLanguage.languages(["fr", "en"]);

export default function RedocPage({ params: { lang } }: PropsWithLangParams) {
  const nonce = headers().get("x-nonce") ?? "";

  return <RedocPageClient nonce={nonce} lang={lang} />;
}
