import AWS from "aws-sdk";
import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";
import { pathExists } from "fs-extra";
import rc from "rc";

const config = rc("barnacle", {
  awsEndpoint: "",
  accessKey: "",
  secretKey: "",
  destinationBucket: "",
  destinationPath: "",
  cacheDir: ".barnacle-cache",
});

async function hash(file: string): Promise<string | undefined> {
  if (!(await pathExists(file))) {
    return;
  }
  const fileBuffer = await fs.readFile(file);
  const hashSum = createHash("sha1");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
}

async function getFilesToUpload(): Promise<string[]> {
  const downloadDirs = await fs.readdir(`./${config.cacheDir}`);
  const [lastDownloadDir, previousDownloadDir = ""] = downloadDirs
    .sort()
    .reverse();
  const lastFiles = await fs.readdir(
    path.join(`./${config.cacheDir}`, lastDownloadDir)
  );
  const files = await Promise.all<[string, boolean]>(
    lastFiles.map<Promise<[string, boolean]>>(async (file) => {
      const lastDownloadFile = path.join(
        `./${config.cacheDir}`,
        lastDownloadDir,
        file
      );
      const previousDownloadFile = path.join(
        `./${config.cacheDir}`,
        previousDownloadDir,
        file
      );
      const lastFileHash = await hash(lastDownloadFile);
      const previousFileHash = await hash(previousDownloadFile);
      return [lastDownloadFile, lastFileHash !== previousFileHash];
    })
  );
  return files.filter(([file, isNew]) => isNew).map<string>(([file]) => file);
}

export default async function uploadFiles() {
  const spacesEndpoint = new AWS.Endpoint(config.awsEndpoint);
  const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: config.accessKey,
    secretAccessKey: config.secretKey,
  });
  const files = await getFilesToUpload();

  console.log(`Found ${files.length} new images to upload.`);

  for (let i = 0; i < files.length; i++) {
    const content = await fs.readFile(files[i]);
    const fileName = path.basename(files[i]);

    console.log("Uploading image:", fileName);

    await new Promise((resolve, reject) => {
      s3.putObject(
        {
          Bucket: config.destinationBucket,
          Key: path.join(config.destinationPath, fileName),
          Body: content,
          ACL: "public-read",
          ContentType: "image/jpg",
        },
        (err, data) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          resolve(data);
        }
      );
    });
  }
}
