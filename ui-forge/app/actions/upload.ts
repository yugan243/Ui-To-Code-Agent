'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(base64Image: string) {
  try {
    // Upload the base64 string directly to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'ui-forge', // Keeps your cloud organized
      resource_type: 'image',
    });

    // Return the permanent URL
    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error("Upload failed:", error);
    return { success: false, error: "Image upload failed" };
  }
}