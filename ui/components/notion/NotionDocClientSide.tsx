"use client";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import dynamic from "next/dynamic";
import Image from "next/image";
import NextLink from "next/link";
import { ExtendedRecordMap } from "notion-types";
import { ReactNode, Suspense } from "react";
import { NotionRenderer } from "react-notion-x";

import { NOTION_PAGES } from "../breadcrumb/Breadcrumb";

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

  return `/notion/${normalisedId}`;
}

function PageLink(props: { href: string; children: ReactNode }) {
  return <NextLink href={props.href}>{props.children}</NextLink>;
}

export function NotionDocClientSide({ recordMap }: { recordMap: ExtendedRecordMap }) {
  const { isDark } = useIsDark();
  return (
    <Suspense>
      <NotionRenderer
        disableHeader={true}
        recordMap={recordMap}
        fullPage={true}
        darkMode={isDark}
        showTableOfContents
        components={{
          nextImage: Image,
          nextLink: NextLink,
          PageLink,
          Code,
          Collection,
          Equation,
          Modal,
        }}
        mapPageUrl={resolveNotionLink}
      />
    </Suspense>
  );
}
