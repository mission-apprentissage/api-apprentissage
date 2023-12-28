import { NOTION_PAGES } from "../../components/breadcrumb/Breadcrumb";
import NotionPage from "../../components/notion/NotionPage";

export const revalidate = 3_600;

export default async function Rncp() {
  return <NotionPage pageId={NOTION_PAGES.formations_apprentissage_rncp.notionId} />;
}
