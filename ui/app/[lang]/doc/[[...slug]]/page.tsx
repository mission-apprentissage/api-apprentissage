import { Container } from "@mui/material"
import { notFound } from "next/navigation"

import NotionPage from "@/components/notion/NotionPage"
import type { INotionPage, IPages } from "@/utils/routes.utils"
import { PAGES } from "@/utils/routes.utils"

export const revalidate = 3_600

type DocPageProps = {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function DocPage(props: DocPageProps) {
  const { slug } = await props.params
  const path = `/doc/${(slug ?? []).join("/")}`
  const page: INotionPage | null =
    Object.values((PAGES as IPages).notion).find((p: INotionPage) => {
      return p.getPath("fr") === path
    }) ?? null

  if (!page) {
    // `notFound()` rend `app/[lang]/not-found.tsx` avec un vrai statut 404. Rendre le composant
    // directement renverrait un 200 — mis en cache une heure par `revalidate` — et, s'agissant du
    // 404 racine, imbriquerait un second `<html>` dans celui de `app/[lang]/layout.tsx`.
    notFound()
  }

  return (
    <Container maxWidth="xl">
      <NotionPage pageId={page.notionId} />
    </Container>
  )
}
