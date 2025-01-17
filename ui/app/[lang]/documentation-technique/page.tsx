import "./overwride.css";

import acceptLanguage from "accept-language";
import { headers } from "next/headers";

import type { PropsWithLangParams } from "@/app/i18n/settings";

import RedocPageClient from "./components/redoc";

acceptLanguage.languages(["fr", "en"]);

export default async function RedocPage({ params }: PropsWithLangParams) {
  const { lang } = await params;
  const h = await headers();
  const nonce = h.get("x-nonce") ?? "";

  return <RedocPageClient nonce={nonce} lang={lang} />;
}
