import { ElementHandle, Page } from "puppeteer";

import parentLogger from "@/common/logger";

import { getStaticFilePath } from "../../../../common/utils/getStaticFilePath";
import { gotoUrl, initPuppeteer } from "./puppeteer";

const logger = parentLogger.child({ module: "convention" });

async function getLinkElementDetails(element: ElementHandle<HTMLAnchorElement>) {
  return {
    href: await (await element.getProperty("href")).jsonValue(),
    text: await element.evaluate((el: any) => el.textContent),
  };
}

async function convertToPdf({ page, href, text, code }: { page: Page; href: string; text: string; code: string }) {
  await gotoUrl({ page, url: href });
  await page.pdf({
    path: getStaticFilePath(`./${code}/${text.replaceAll(" ", "_")}.pdf`),
    // margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
    printBackground: true,
    format: "A4",
  });
}

export async function runConventionToPDF() {
  logger.info("Convention to pdf...");

  const { browser, page } = await initPuppeteer();

  await gotoUrl({ page, url: `https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000005635917` });

  const listeSommaire = await page.$("#liste-sommaire");
  const lis = await listeSommaire.$$(":scope > li");

  const baseLinkElement = await lis[0].$(":scope > a");
  const textDeBase = await getLinkElementDetails(baseLinkElement);

  const textAttachesLis = await lis[1].$$(":scope > ul > li");
  const textAttaches = [];
  for (const textAttachesLi of textAttachesLis) {
    if (!(await textAttachesLi.evaluate((el: any) => el.style.display === "none")))
      textAttaches.push(await getLinkElementDetails(await textAttachesLi.$(":scope > a")));
  }

  const textSalairesLis = await lis[2].$$(":scope > ul > li");
  const textSalaires = [];
  for (const textSalairesLi of textSalairesLis) {
    if (!(await textSalairesLi.evaluate((el: any) => el.style.display === "none")))
      textSalaires.push(await getLinkElementDetails(await textSalairesLi.$(":scope > a")));
  }

  await convertToPdf({ page, code: "1671", ...textDeBase });

  for (const textAttache of textAttaches) {
    await convertToPdf({ page, code: "1671", ...textAttache });
  }

  for (const textSalaire of textSalaires) {
    await convertToPdf({ page, code: "1671", ...textSalaire });
  }

  await browser.close();
}
