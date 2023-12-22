import { NotionAPI } from "notion-client";

import { Doc } from "@/app/components/NotionDoc";

import { NOTION_PAGES } from "../components/breadcrumb/Breadcrumb";

export const revalidate = 60;

const fetchData = async () => {
  const notion = new NotionAPI();
  const recordMap = await notion.getPage(NOTION_PAGES.documentation.notionId);
  return recordMap;
};

export default async function Home() {
  const recordMap = await fetchData();
  return <Doc recordMap={recordMap} />;
}
