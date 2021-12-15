import AWS from "aws-sdk";
import { promises as fs } from "fs";
import path from "path";
import { config } from "dotenv";
import { createHash } from "crypto";
import { pathExists } from "fs-extra";

config();

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
  const downloadDirs = await fs.readdir("./downloads");
  const [lastDownloadDir, previousDownloadDir = ""] = downloadDirs
    .sort()
    .reverse();
  const lastFiles = await fs.readdir(path.join("./downloads", lastDownloadDir));
  const files = await Promise.all<[string, boolean]>(
    lastFiles.map<Promise<[string, boolean]>>(async (file) => {
      const lastDownloadFile = path.join("./downloads", lastDownloadDir, file);
      const previousDownloadFile = path.join(
        "./downloads",
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

(async function uploadFiles() {
  const spacesEndpoint = new AWS.Endpoint(process.env.AWS_ENDPOINT || "");
  const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.ACCESS_KEY || "",
    secretAccessKey: process.env.SECRET_KEY || "",
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
          Bucket: process.env.DESTINATION_BUCKET || "",
          Key: path.join(process.env.DESTINATION_PATH || "", fileName),
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
})();
