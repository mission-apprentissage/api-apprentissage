import { headers } from "next/headers";

import RedocPageClient from "./components/redoc";

export default function RedocPage() {
  const nonce = headers().get("x-nonce") ?? "";

  return <RedocPageClient nonce={nonce} />;
}
