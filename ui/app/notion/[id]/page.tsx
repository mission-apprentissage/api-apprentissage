import NotionPage from "../../components/notion/NotionPage";

export const revalidate = 300;

export default async function Page({ params: { id } }: { params: { id: string } }) {
  return <NotionPage pageId={id} />;
}
