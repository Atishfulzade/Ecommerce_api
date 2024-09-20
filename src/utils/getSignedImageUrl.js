import { GetObjectCommand } from "@aws-sdk/client-s3"; // Make sure to import necessary classes
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // Import the correct function to generate signed URLs
import { s3Client } from "../utils/s3_configuration.js"; // Import your S3 client configuration

export const getSignedImageUrl = async (req, res) => {
  const { key } = req.params; // Get S3 object key from request params

  // Ensure the key includes the 'uploads/' directory
  const fullKey = `uploads/${key}`;

  try {
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fullKey, // Use fullKey with uploads prefix
      }),
      { expiresIn: 3600 } // Adjust expiration time as needed
    );

    res.json({ signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({
      message: "Failed to generate signed URL",
      error: error.message,
    });
  }
};
