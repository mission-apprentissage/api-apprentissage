"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ExtendedRecordMap } from "notion-types";
import { Suspense } from "react";
import { NotionRenderer } from "react-notion-x";

import { NOTION_PAGES } from "./breadcrumb/Breadcrumb";

const Code = dynamic(() => import("react-notion-x/build/third-party/code").then((m) => m.Code));
const Collection = dynamic(() => import("react-notion-x/build/third-party/collection").then((m) => m.Collection));
const Equation = dynamic(() => import("react-notion-x/build/third-party/equation").then((m) => m.Equation));
const Modal = dynamic(() => import("react-notion-x/build/third-party/modal").then((m) => m.Modal), { ssr: false });

function resolveNotionLink(id: string) {
  const normalisedId = id.replaceAll("-", "");
  const page = Object.values(NOTION_PAGES).find(({ notionId }) => notionId === normalisedId);

  if (page) {
    return page.path;
  }

  return `https://mission-apprentissage.notion.site/${normalisedId}`;
}

export const Doc = ({ recordMap }: { recordMap: ExtendedRecordMap }) => {
  return (
    <Suspense>
      <NotionRenderer
        pageTitle={false}
        disableHeader={true}
        recordMap={recordMap}
        fullPage={true}
        darkMode={false}
        components={{
          nextImage: Image,
          nextLink: Link,
          Code,
          Collection,
          Equation,
          Modal,
        }}
        mapPageUrl={resolveNotionLink}
      />
    </Suspense>
  );
};
