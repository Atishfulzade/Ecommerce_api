import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Set up multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to handle image upload, conversion to WebP, and upload to S3
export const uploadImageToS3 = async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Convert the image buffer to WebP format using sharp
      const webpImageBuffer = await sharp(req.file?.buffer).webp().toBuffer();

      // Generate a unique key for the uploaded file
      const uniqueKey = `uploads/${uuidv4()}.webp`;

      // Define S3 upload parameters
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueKey, // Use the generated key
        Body: webpImageBuffer,
        ContentType: "image/webp",
      };

      // Upload the converted image to S3 using AWS SDK v3
      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      // Generate a signed URL for the uploaded image using the same key
      const getcommand = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueKey,
      });
      const signedUrl = await getSignedUrl(s3Client, getcommand, {
        expiresIn: 3600,
      });

      // Attach the signed URL to the request object
      req.uploadedFileUrl = signedUrl;

      // Pass control to the next middleware
      next();
    } catch (conversionError) {
      console.log(conversionError);

      res.status(500).json({ error: conversionError.message });
    }
  });
};

export const uploadImagesToS3 = async (req, res, next) => {
  upload.array("images", 10)(req, res, async (err) => {
    // Allow up to 10 images
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      const uploadResults = await Promise.all(
        req.files.map(async (file) => {
          // Convert the image buffer to WebP format using sharp
          const webpImageBuffer = await sharp(file.buffer).webp().toBuffer();

          // Generate a unique key for the uploaded file
          const uniqueKey = `uploads/${uuidv4()}.webp`;

          // Define S3 upload parameters
          const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: uniqueKey, // Use the generated key
            Body: webpImageBuffer,
            ContentType: "image/webp",
          };

          // Upload the converted image to S3 using AWS SDK v3
          const command = new PutObjectCommand(uploadParams);
          await s3Client.send(command);

          // Generate a signed URL for the uploaded image using the same key
          const getcommand = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: uniqueKey,
          });
          const signedUrl = await getSignedUrl(s3Client, getcommand, {
            expiresIn: 3600,
          });

          return signedUrl;
        })
      );

      // Attach the signed URLs to the request object
      req.uploadedFilesUrls = uploadResults;

      // Pass control to the next middleware
      next();
    } catch (conversionError) {
      console.log(conversionError);
      res.status(500).json({ error: conversionError.message });
    }
  });
};
