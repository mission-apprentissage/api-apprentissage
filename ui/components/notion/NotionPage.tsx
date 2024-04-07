import { NotionAPI } from "notion-client";

import { NotionDocClientSide } from "./NotionDocClientSide";

const notion = new NotionAPI();

export default async function NotionPage({ pageId }: { pageId: string }) {
  const recordMap = await notion.getPage(pageId);
  return <NotionDocClientSide recordMap={recordMap} />;
}
