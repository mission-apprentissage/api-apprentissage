import { Breadcrumb as DSFRBreadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { FC } from "react";

import { IPage, PAGES } from "@/utils/routes.utils";

interface Props {
  pages: IPage[];
}

const Breadcrumb: FC<Props> = ({ pages }) => {
  const rest = [...pages];
  const currentPage = rest.pop();

  return (
    <DSFRBreadcrumb
      currentPageLabel={currentPage?.title}
      homeLinkProps={{
        href: PAGES.static.home.path,
      }}
      segments={rest.map((page) => ({
        label: page.title,
        linkProps: {
          href: page.path,
        },
      }))}
    />
  );
};

export default Breadcrumb;
