import getApiClient from "../client";

const legifranceClient = getApiClient(
  {
    baseURL: "https://www.legifrance.gouv.fr",
  },
  { cache: false }
);

export const fetchConventionCollective = async (Kali: string) => {
  try {
    const { data } = await legifranceClient.get(`/conv_coll/id/${Kali}`);

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchAjaxSearchConventionCollective = async ({
  etat_juridique,
  page,
}: {
  etat_juridique: string;
  page: number;
}) => {
  try {
    const { data } = await legifranceClient.get(
      `/listeIdcc/ajax?facetteTexteBase=TEXTE_BASE&facetteEtat=${etat_juridique}&sortValue=DATE_UPDATE&pageSize=500&page=${page}&tab_selection=all`
    );

    return data;
  } catch (error) {
    console.log(error);
  }
};
