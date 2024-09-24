import type { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import { useMemo } from "react";
import type { IUserPublic } from "shared/models/user.model";

import type { WithLangAndT } from "@/app/i18n/settings";
import { PAGES } from "@/utils/routes.utils";

type GetNavigationItemsProps = WithLangAndT<{
  user: IUserPublic | null;
  pathname: string;
}>;

const getNavigationItems = ({ user, pathname, lang, t }: GetNavigationItemsProps): MainNavigationProps.Item[] => {
  const navigation: MainNavigationProps.Item[] = [
    {
      isActive: pathname === PAGES.static.home.path,
      text: PAGES.static.home.getTitle(lang, t),
      linkProps: {
        href: PAGES.static.home.path,
      },
    },
    {
      isActive: pathname.startsWith(PAGES.static.explorerApi.path),
      text: PAGES.static.explorerApi.getTitle(lang, t),
      linkProps: {
        href: PAGES.static.explorerApi.path,
      },
    },
    {
      isActive: pathname.startsWith(PAGES.static.documentationTechnique.path),
      text: PAGES.static.documentationTechnique.getTitle(lang, t),
      linkProps: {
        href: PAGES.static.documentationTechnique.path,
      },
    },
  ];

  if (user?.is_admin) {
    const adminMenuLinks = [
      {
        text: PAGES.static.adminOrganisations.getTitle(lang, t),
        isActive: pathname.startsWith(PAGES.static.adminOrganisations.path),
        linkProps: {
          href: PAGES.static.adminOrganisations.path,
        },
      },
      {
        text: PAGES.static.adminUsers.getTitle(lang, t),
        isActive: pathname.startsWith(PAGES.static.adminUsers.path),
        linkProps: {
          href: PAGES.static.adminUsers.path,
        },
      },
      {
        text: PAGES.static.adminProcessor.getTitle(lang, t),
        isActive: pathname.startsWith(PAGES.static.adminProcessor.path),
        linkProps: {
          href: PAGES.static.adminProcessor.path,
        },
      },
    ];

    navigation.push({
      text: "Administration",
      isActive: adminMenuLinks.some((link) => link.isActive),
      menuLinks: adminMenuLinks,
    });
  }

  return navigation.map((item) => {
    const { menuLinks } = item;

    const menuLinkWithActive = menuLinks?.map((link) => ({ ...link, isActive: link.linkProps.href === pathname }));
    const isActive = item.isActive || menuLinkWithActive?.some((link) => link.isActive);

    return { ...item, isActive, menuLinks };
  }) as MainNavigationProps.Item[];
};

export const useNavigationItems = ({ user, pathname, lang, t }: GetNavigationItemsProps): MainNavigationProps.Item[] =>
  useMemo(() => getNavigationItems({ user, pathname, lang, t }), [user, pathname, t, lang]);
