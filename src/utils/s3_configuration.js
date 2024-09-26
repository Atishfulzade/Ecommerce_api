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
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Set up multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to handle single image upload (profile image), conversion, and upload to S3
export const uploadImageToS3 = async (req, res, next) => {
  console.log("Upload Image Middleware Started");
  console.log(req.file);

  upload.single("profileImage")(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res
        .status(500)
        .json({ error: "Image upload failed", details: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const webpImageBuffer = await sharp(req.file.buffer).webp().toBuffer();
      const uniqueKey = `uploads/${uuidv4()}.webp`;

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueKey,
        Body: webpImageBuffer,
        ContentType: "image/webp",
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      // Store the uniqueKey instead of the signed URL
      req.uploadedFileKey = uniqueKey;

      next();
    } catch (conversionError) {
      console.error("Image processing/upload error:", conversionError);
      res.status(500).json({
        error: "Image processing or upload failed",
        details: conversionError.message,
      });
    }
  });
};

// For multiple images, store the keys:
export const uploadImagesToS3 = async (req, res, next) => {
  console.log("Upload Images Middleware Started");

  upload.array("product_images", 8)(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res
        .status(500)
        .json({ error: "Images upload failed", details: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      const uploadResults = await Promise.all(
        req.files.map(async (file) => {
          const webpImageBuffer = await sharp(file.buffer).webp().toBuffer();
          const uniqueKey = `uploads/${uuidv4()}.webp`;

          const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: uniqueKey,
            Body: webpImageBuffer,
            ContentType: "image/webp",
          };

          await s3Client.send(new PutObjectCommand(uploadParams));

          // Store uniqueKey (object key) instead of the signed URL
          return uniqueKey;
        })
      );

      req.uploadedFilesKeys = uploadResults;

      next();
    } catch (conversionError) {
      console.error("Image processing/upload error:", conversionError);
      res.status(500).json({
        error: "Image processing or upload failed",
        details: conversionError.message,
      });
    }
  });
};
