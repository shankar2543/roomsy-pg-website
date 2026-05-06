import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const ALLOWED_FOLDERS = ["id-proofs", "pg-photos"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { data, folder: rawFolder } = req.body as { data: string; folder?: string };
  if (!data) return res.status(400).json({ error: "No file data provided" });

  const folder: AllowedFolder = ALLOWED_FOLDERS.includes(rawFolder as AllowedFolder)
    ? (rawFolder as AllowedFolder)
    : "id-proofs";

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: "Cloudinary credentials not configured" });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const body = new FormData();
  body.append("file", data);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("signature", signature);
  body.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body }
  );

  const result = await response.json();
  if (!response.ok) {
    return res.status(500).json({ error: result.error?.message ?? "Upload failed" });
  }
  return res.status(200).json({ url: result.secure_url });
}
