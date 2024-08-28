import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

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
export const uploadImagesToS3 = async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Convert the image buffer to WebP format using sharp
      const webpImageBuffer = await sharp(req.file.buffer).webp().toBuffer();

      // Define S3 upload parameters
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${uuidv4()}.webp`, // Generate a unique file name
        Body: webpImageBuffer,
        ContentType: "image/webp",
        ACL: "public-read", // Make the file publicly readable (optional)
      };

      // Upload the converted image to S3 using AWS SDK v3
      const command = new PutObjectCommand(uploadParams);
      const response = await s3Client.send(command);

      // Successfully uploaded
      res.status(200).json({
        message: "File uploaded and converted to WebP successfully",
        fileLocation: `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`,
      });
    } catch (conversionError) {
      res.status(500).json({ error: conversionError.message });
    }
  });
};
