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

// Middleware to handle image upload, conversion to WebP, and upload to S3
export const uploadImageToS3 = async (req, res, next) => {
  console.log("Upload Image Middleware Started");

  // Use multer to process the file upload
  upload.single("profileImage")(req, res, async (err) => {
    console.log("Multer Error:", err);
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);
    if (err) {
      console.error("Upload error:", err);
      return res
        .status(500)
        .json({ error: "Image upload failed", details: err.message });
    }

    console.log("Multer processed file:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Convert the image buffer to WebP format using sharp
      const webpImageBuffer = await sharp(req.file.buffer).webp().toBuffer();

      // Generate a unique key for the uploaded file
      const uniqueKey = `uploads/${uuidv4()}.webp`;

      // Define S3 upload parameters
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueKey,
        Body: webpImageBuffer,
        ContentType: "image/webp",
      };

      // Upload the converted image to S3
      const uploadCommand = new PutObjectCommand(uploadParams);
      await s3Client.send(uploadCommand);

      // Generate a signed URL for the uploaded image
      const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueKey,
      });
      const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
        expiresIn: 3600,
      });

      // Attach the signed URL to the request object
      req.uploadedFileUrl = signedUrl;

      // Pass control to the next middleware
      next();
    } catch (conversionError) {
      console.error("Image conversion/upload error:", conversionError);
      res.status(500).json({
        error: "Image processing or upload failed",
        details: conversionError.message,
      });
    }
  });
};

// Middleware to handle multiple image uploads, conversion to WebP, and upload to S3
export const uploadImagesToS3 = async (req, res, next) => {
  console.log("Upload Images Middleware Started");

  upload.array("product_images", 8)(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res
        .status(500)
        .json({ error: "Images upload failed", details: err.message });
    }

    console.log("Multer processed files:", req.files);

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
            Key: uniqueKey,
            Body: webpImageBuffer,
            ContentType: "image/webp",
          };

          // Upload the converted image to S3
          const uploadCommand = new PutObjectCommand(uploadParams);
          await s3Client.send(uploadCommand);

          // Generate a signed URL for the uploaded image
          const getObjectCommand = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: uniqueKey,
          });
          const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
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
      console.error("Image conversion/upload error:", conversionError);
      res.status(500).json({
        error: "Image processing or upload failed",
        details: conversionError.message,
      });
    }
  });
};
