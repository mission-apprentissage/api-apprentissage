"use client";
import { RedocStandalone } from "redoc";

import { publicConfig } from "../../config.public";

export const revalidate = 3_600;

export default function RedocPage() {
  return (
    <RedocStandalone
      specUrl={`${publicConfig.apiEndpoint}/documentation/json`}
      options={{
        sortPropsAlphabetically: true,
        sortEnumValuesAlphabetically: true,
        sortOperationsAlphabetically: true,
        sortTagsAlphabetically: true,
        menuToggle: true,
        hideSchemaTitles: false,
        theme: {
          spacing: {
            sectionHorizontal: 20,
            sectionVertical: 5,
          },
          sidebar: {
            width: "0px",
          },
          typography: {
            headings: {
              fontFamily: "inherit",
              fontWeight: "bold",
              lineHeight: "1.15",
            },
          },
        },
        nonce: "random",
      }}
    />
  );
}
