import "./overwride.css";

import acceptLanguage from "accept-language";
import { headers } from "next/headers";

import RedocPageClient from "./components/redoc";

acceptLanguage.languages(["fr", "en"]);

export default function RedocPage() {
  const nonce = headers().get("x-nonce") ?? "";

  const locale = acceptLanguage.get(headers().get("accept-language") ?? "");

  return <RedocPageClient nonce={nonce} locale={locale ?? "fr"} />;
}
