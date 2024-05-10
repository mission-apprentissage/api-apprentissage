import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import { useMemo } from "react";
import { IUserPublic } from "shared/models/user.model";

import { PAGES } from "@/utils/routes.utils";

interface GetNavigationItemsProps {
  user: IUserPublic | null;
  pathname: string;
}

const getNavigationItems = ({ user, pathname }: GetNavigationItemsProps): MainNavigationProps.Item[] => {
  let navigation: MainNavigationProps.Item[] = [
    {
      isActive: pathname === PAGES.static.home.path,
      text: PAGES.static.home.title,
      linkProps: {
        href: PAGES.static.home.path,
      },
    },
    {
      isActive: pathname.startsWith(PAGES.static.catalogueDesDonnees.path),
      text: PAGES.static.catalogueDesDonnees.title,
      linkProps: {
        href: PAGES.static.catalogueDesDonnees.path,
      },
    },
    {
      isActive: pathname.startsWith(PAGES.static.documentationTechnique.path),
      text: PAGES.static.documentationTechnique.title,
      linkProps: {
        href: PAGES.static.documentationTechnique.path,
      },
    },
  ];

  if (user?.is_admin) {
    const adminMenuLinks = [
      {
        text: PAGES.static.adminUsers.title,
        isActive: pathname.startsWith(PAGES.static.adminUsers.path),
        linkProps: {
          href: PAGES.static.adminUsers.path,
        },
      },
    ];

    navigation = [
      ...navigation,
      {
        text: "Administration",
        isActive: adminMenuLinks.some((link) => link.isActive),
        menuLinks: adminMenuLinks,
      },
    ];
  }

  return navigation.map((item) => {
    const { menuLinks } = item;

    const menuLinkWithActive = menuLinks?.map((link) => ({ ...link, isActive: link.linkProps.href === pathname }));
    const isActive = item.isActive || menuLinkWithActive?.some((link) => link.isActive);

    return { ...item, isActive, menuLinks };
  }) as MainNavigationProps.Item[];
};

export const useNavigationItems = ({ user, pathname }: GetNavigationItemsProps): MainNavigationProps.Item[] =>
  useMemo(() => getNavigationItems({ user, pathname }), [user, pathname]);
