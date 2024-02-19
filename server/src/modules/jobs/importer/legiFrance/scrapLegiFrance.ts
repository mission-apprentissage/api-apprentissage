import { unlink, writeFile } from "node:fs/promises";

import parentLogger from "@/common/logger";

import { fetchAjaxSearchConventionCollective } from "../../../../common/apis/legiFrance/legifrance";
import { getStaticFilePath } from "../../../../common/utils/getStaticFilePath";
import { gotoUrl, initPuppeteer } from "./puppeteer";

const logger = parentLogger.child({ module: "import:legifrance" });

export async function runLegiFranceImporter() {
  logger.info("Geting legifrance ...");

  const { browser, page } = await initPuppeteer();

  const categories = [
    {
      etat_juridique: "VIGUEUR_ETEN",
      pages: 2,
    },
    {
      etat_juridique: "VIGUEUR_NON_ETEN",
      pages: 1,
    },
    {
      etat_juridique: "ABROGE",
      pages: 1,
    },
    {
      etat_juridique: "MODIFIE",
      pages: 1,
    },
    {
      etat_juridique: "PERIME",
      pages: 1,
    },
    {
      etat_juridique: "DENONCE",
      pages: 1,
    },
    {
      etat_juridique: "REMPLACE",
      pages: 1,
    },
  ];
  const results = new Map();
  for (const categorie of categories) {
    console.log(categorie);
    const categorieResults = new Map();
    for (let pagecount = 1; pagecount <= categorie.pages; pagecount++) {
      const { content, nbResult } = await fetchAjaxSearchConventionCollective({
        etat_juridique: categorie.etat_juridique,
        page: pagecount,
      });
      console.log({ nbResult }); // content

      await writeFile(getStaticFilePath("./page.html"), content);

      await gotoUrl({ page, url: `file://${getStaticFilePath("./page.html")}` });

      const elements = await page.$$(".h4.code-title-convention");

      for (const elementHandle of elements) {
        let value = await elementHandle.evaluate((el: any) => el.textContent);
        value = value.trim().replace("IDCC", "");
        const code = value.trim();

        const grandParentElement = await page.evaluateHandle((node) => {
          return node.parentElement?.parentElement ?? null;
        }, elementHandle);
        // @ts-expect-error
        const link = await grandParentElement.$(":scope > h2 > div:nth-child(2) > a");
        const rawHref = await (await link.getProperty("href")).jsonValue();
        const match = RegExp(/file:\/\/(.*)\?origin/).exec(rawHref);

        categorieResults.set(code, {
          etat_juridique: categorie.etat_juridique,
          code: value.trim(),
          // @ts-expect-error
          url: `https://www.legifrance.gouv.fr${match[1]}`,
        });
      }
    }
    categorieResults.forEach((categorieResult) => {
      const result = results.get(categorieResult.code);
      if (!result) {
        results.set(categorieResult.code, [categorieResult]);
      } else {
        results.set(categorieResult.code, [...result, categorieResult]);
      }
    });
  }
  const resultsObj = Object.fromEntries(results);
  // console.log(resultsObj);
  console.log(Object.keys(resultsObj).length);
  await writeFile(getStaticFilePath("./results.json"), JSON.stringify(resultsObj, null, 2));

  await unlink(getStaticFilePath("./page.html"));
  await browser.close();
}
