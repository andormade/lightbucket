import rc from "rc";
import { execSync } from "node:child_process";

const config = rc("lightbucket", {
  adobeShareId: "",
  cacheDir: ".lightbucket-cache",
});

const downloadPath = `./${config.cacheDir}/${new Date().getTime()}`;

export default () => {
  execSync(
    `npx lightroom-gallery-downloader ${downloadPath} ${config.adobeShareId}`,
    { stdio: "inherit" }
  );
};
