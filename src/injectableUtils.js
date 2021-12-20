/** @typedef {import('puppeteer').Page} Page; */

/**
 * @param {Page} page
 * @returns {Promise<string[]>}
 */
module.exports.getVisibleImadeIds = async function getVisibleImadeIds(page) {
  return page.evaluate(() => {
    return (
      Array.from(document.getElementsByClassName("image"))
        // @ts-ignore
        .map((imageElement) => imageElement.style.backgroundImage)
        .filter((backgroundImage) => Boolean(backgroundImage))
        .map((backgroundImage) => {
          const [, imageId] = backgroundImage.match(/assets\/(\w+)\/revisions/);
          return imageId;
        })
    );
  });
};

/**
 * @param {Page} page
 * @param {number} y
 * @returns {Promise<boolean>}
 */
module.exports.scroll = async function scroll(page, y) {
  return page.evaluate((y) => {
    let previousScrollPosition = window.scrollY;
    window.scrollBy(0, y);
    return previousScrollPosition === window.scrollY;
  }, y);
};

/**
 * @param {Page} page
 * @returns {Promise<number>}
 */
module.exports.getViewportHeight = async function getViewportHeight(page) {
  return page.evaluate(() => {
    return window.innerHeight;
  });
};
