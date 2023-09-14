const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const keys = require("../config/keys");

const uploadToS3 = async (fileStream, fileName, bucketName) => {
  const s3Client = new S3Client({
    region: keys.awsRegion,
    credentials: {
      accessKeyId: keys.awsAccessId,
      secretAccessKey: keys.awsAccessSecret,
    },
  });

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: fileName,
      Body: fileStream,
    },
  });

  try {
    const result = await upload.done();
    console.log("Uploaded:", result);
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

module.exports = uploadToS3;
