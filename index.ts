import puppeteer from "puppeteer";

const delay = (delay: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delay));

const MENU_BUTTON_SELECTOR =
  "._-_-_-app-assets-javascripts-_viewer-oneup-views-loupe_tridot_menu--loupe_tridot_menu--LvOmg";
const DOWNLOAD_BUTTON_SELECTOR = ".MenuItem-1pj3kGstddgF9fLQXGOYJ8";
const CLOSE_BUTTON_SELECTOR = ".close";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://adobe.ly/2Z1UQw8");
  await page.waitForSelector(".image");
  let images = await page.$$(".image");
  for (let i = 0; i < images.length; i++) {
    images = await page.$$(".image");
    await images[i].click();
    await delay(1000);
    await page.waitForSelector(MENU_BUTTON_SELECTOR);
    await page.click(MENU_BUTTON_SELECTOR);
    await page.waitForSelector(DOWNLOAD_BUTTON_SELECTOR);

    // @ts-ignore
    await page._client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: "./downloads",
    });

    console.log("Started downloading image:", i);
    await page.click(DOWNLOAD_BUTTON_SELECTOR);
    await page.click(CLOSE_BUTTON_SELECTOR);
  }
  await delay(10000);
  await browser.close();
})();
