import AWS from "aws-sdk";
import { promises as fs } from "fs";
import path from "path";
import { config } from "dotenv";

config();

(async function uploadFiles() {
  const spacesEndpoint = new AWS.Endpoint(process.env.AWS_ENDPOINT || "");
  const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.ACCESS_KEY || "",
    secretAccessKey: process.env.SECRET_KEY || "",
  });
  const files = await fs.readdir("./downloads");
  for (let i = 0; i < files.length; i++) {
    const content = await fs.readFile("./downloads/" + files[i]);
    await new Promise((resolve, reject) => {
      s3.putObject(
        {
          Bucket: process.env.DESTINATION_BUCKET || "",
          Key: path.join((process.env.DESTINATION_PATH || "") + files[i]),
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
