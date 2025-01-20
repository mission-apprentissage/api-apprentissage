import type { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import { useMemo } from "react";
import type { IUserPublic } from "shared/models/user.model";
import { text } from "stream/consumers";

import type { WithLangAndT } from "@/app/i18n/settings";
import { PAGES } from "@/utils/routes.utils";

type GetNavigationItemsProps = WithLangAndT<{
  user: IUserPublic | null;
  pathname: string;
}>;

const getNavigationItems = ({ user, pathname, lang, t }: GetNavigationItemsProps): MainNavigationProps.Item[] => {
  const navigation: MainNavigationProps.Item[] = [
    {
      isActive: pathname === PAGES.static.home.getPath(lang),
      text: PAGES.static.home.getTitle(lang, t),
      linkProps: {
        href: PAGES.static.home.getPath(lang),
      },
    },
    {
      isActive: pathname.startsWith(PAGES.static.explorerApi.getPath(lang)),
      text: PAGES.static.explorerApi.getTitle(lang, t),
      linkProps: {
        href: PAGES.static.explorerApi.getPath(lang),
      },
    },
    {
      isActive: pathname.startsWith(PAGES.static.documentationTechnique.getPath(lang)),
      text: PAGES.static.documentationTechnique.getTitle(lang, t),
      linkProps: {
        href: PAGES.static.documentationTechnique.getPath(lang),
      },
    },
  ];

  if (user?.is_admin) {
    const adminMenuLinks = [
      {
        text: PAGES.static.adminOrganisations.getTitle(lang, t),
        isActive: pathname.startsWith(PAGES.static.adminOrganisations.getPath(lang)),
        linkProps: {
          href: PAGES.static.adminOrganisations.getPath(lang),
        },
      },
      {
        text: PAGES.static.adminUsers.getTitle(lang, t),
        isActive: pathname.startsWith(PAGES.static.adminUsers.getPath(lang)),
        linkProps: {
          href: PAGES.static.adminUsers.getPath(lang),
        },
      },
      {
        text: PAGES.static.adminImporters.getTitle(lang, t),
        isActive: pathname.startsWith(PAGES.static.adminImporters.getPath(lang)),
        linkProps: {
          href: PAGES.static.adminImporters.getPath(lang),
        },
      },
      {
        text: PAGES.static.adminProcessor.getTitle(lang, t),
        isActive: pathname.startsWith(PAGES.static.adminProcessor.getPath(lang)),
        linkProps: {
          href: PAGES.static.adminProcessor.getPath(lang),
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
