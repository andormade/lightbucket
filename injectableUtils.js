module.exports.getVisibleImadeIds = async function getVisibleImadeIds(page) {
  return page.evaluate(() => {
    return Array.from(document.getElementsByClassName("image"))
      .map((imageElement) => imageElement.style.backgroundImage)
      .filter((backgroundImage) => Boolean(backgroundImage))
      .map((backgroundImage) => {
        const [, imageId] = backgroundImage.match(/assets\/(\w+)\/revisions/);
        return imageId;
      });
  });
};

module.exports.scroll = async function scroll(page, y) {
  return page.evaluate((y) => {
    let previousScrollPosition = window.scrollY;
    window.scrollBy(0, y);
    return previousScrollPosition === window.scrollY;
  }, y);
};

module.exports.getViewportHeight = async function getViewportHeight(page) {
  return page.evaluate(() => {
    return window.innerHeight;
  });
};
