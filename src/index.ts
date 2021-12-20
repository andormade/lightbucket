#!/usr/bin/env node

import download from "./download";
import uploadFiles from "./upload";

(async () => {
  await download();
  await uploadFiles();
})();
