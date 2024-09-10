import { Container } from "@mui/material";

import NotFoundPage from "@/app/not-found";
import NotionPage from "@/components/notion/NotionPage";
import type { INotionPage, IPages } from "@/utils/routes.utils";
import { PAGES } from "@/utils/routes.utils";

export const revalidate = 3_600;

type DocPageProps = {
  params: {
    slug: string[];
  };
};

export default async function DocPage(props: DocPageProps) {
  const path = `/doc/${props.params.slug.join("/")}`;
  const page: INotionPage | null =
    Object.values((PAGES as IPages).notion).find((p: INotionPage) => {
      return p.path === path;
    }) ?? null;

  if (!page) {
    return <NotFoundPage />;
  }

  return (
    <Container maxWidth="xl">
      <NotionPage pageId={page.notionId} />
    </Container>
  );
}
