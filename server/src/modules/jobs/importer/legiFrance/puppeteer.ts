import puppeteer, { Page } from "puppeteer";

import { sleep } from "../../../../common/utils/asyncUtils";

export const initPuppeteer = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  return { browser, page };
};

async function waitForEvent(page: Page, eventName: string) {
  return page.evaluate((event: string) => {
    return new Promise((resolve, _) => {
      document.addEventListener(event, resolve);
    });
  }, eventName);
}

export const waitPageLoad = async (page: Page) => {
  await Promise.race([waitForEvent(page, "load"), sleep(8000)]);
};

export const gotoUrl = async ({ page, url }: { page: Page; url: string }): Promise<void> => {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });
  await waitPageLoad(page);
};
