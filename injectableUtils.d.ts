import puppeteer from "puppeteer";

declare function getVisibleImadeIds(page: puppeteer.Page): Promise<string[]>;
declare function scroll(page: puppeteer.Page, y: number): Promise<boolean>;
declare function getViewportHeight(page: puppeteer.Page): Promise<number>;
