import puppeteer from "puppeteer";
import {
  getViewportHeight,
  getVisibleImadeIds,
  scroll,
} from "./injectableUtils";

const delay = (delay: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delay));

const ADOBE_SHARE_ID = "6892a9cafe934a238ba5b3984628e6f2";

function getDownloadLink(assetId: string): string {
  return (
    "https://dl.lightroom.adobe.com/spaces/" +
    ADOBE_SHARE_ID +
    "/assets/" +
    assetId
  );
}

async function collectImageIds(page: puppeteer.Page): Promise<string[]> {
  const imageIds = new Set<string>([]);
  let reachedTheEnd = false;
  const scrollSize = Math.ceil((await getViewportHeight(page)) / 2);

  while (!reachedTheEnd) {
    await delay(1000);
    const visibleImageIds = await getVisibleImadeIds(page);
    visibleImageIds.forEach((imageId) => {
      imageIds.add(imageId);
    });
    reachedTheEnd = await scroll(page, scrollSize);
  }

  return Array.from(imageIds);
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://adobe.ly/2Z1UQw8");
  await page.waitForSelector(".image");

  await delay(2000);

  const images = await collectImageIds(page);

  // @ts-ignore
  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: "./downloads",
  });

  for (let i = 0; i < images.length; i++) {
    const imagePermalink = getDownloadLink(images[i]);
    await page.evaluate((link) => {
      location.href = link;
    }, imagePermalink);
    await delay(1000);
  }

  await delay(10000);
  await browser.close();
})();
