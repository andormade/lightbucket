#!/usr/bin/env node

import download from "./download";
import uploadFiles from "./upload";

(async () => {
  download();
  await uploadFiles();
})();
