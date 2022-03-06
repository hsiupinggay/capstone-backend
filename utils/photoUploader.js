/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/*
 * ========================================================
 * ========================================================
 *
 *                      Imports
 *
 * ========================================================
 * ========================================================
 */
const S3 = require('aws-sdk/clients/s3');
const util = require('util');
const fs = require('fs');
require('dotenv').config();

const unlinkFile = util.promisify(fs.unlink);

/*
 * ========================================================
 * ========================================================
 *
 *           Retrieve S3 fields from env file
 *
 * ========================================================
 * ========================================================
 */
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

/*
 * ========================================================
 * ========================================================
 *
 *     Helper function to upload an image to S3 Bucket
 *
 * ========================================================
 * ========================================================
 */
function uploadFile(file) {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
}

/*
 * ========================================================
 * ========================================================
 *
 *       Function for renaming and storing image in s3
 *         and getting image link to store in DB
 *
 * ========================================================
 * ========================================================
 */
const handleImage = async (image) => {
  // Rename image
  fs.rename(
    `./public/uploads/${image.filename}`,
    `./public/uploads/${image.originalname}`,
    () => {
      console.log('mandatory callback');
    },
  );
  image.filename = `${image.originalname}`;
  image.path = `./public/uploads/${image.originalname}`;

  // Upload image to AWS S3 bucket
  const uploadedImage = await uploadFile(image);
  // Get image URL
  const imageURL = uploadedImage.Location;
  // Delete image from upload directory after uploading to S3
  await unlinkFile(image.path);

  return imageURL;
};

module.exports = handleImage;
