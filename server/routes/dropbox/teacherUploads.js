import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Dropbox credentials from .env
const REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN;
const CLIENT_ID = process.env.DROPBOX_APP_KEY;
const CLIENT_SECRET = process.env.DROPBOX_APP_SECRET;

// Function to get a fresh access token using the refresh token
async function getAccessToken() {
  const response = await fetch("https://api.dropbox.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const data = await response.json();
  if (!data.access_token) throw new Error("Failed to get access token from Dropbox");
  return data.access_token;
}

// Upload file
router.post("/upload", async (req, res) => {
  const { filename, content } = req.body;

  try {
    const accessToken = await getAccessToken(); // refresh token before uploading

    const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Dropbox-API-Arg": JSON.stringify({
          path: `/teacher_uploads/${filename}`,
          mode: "add",
          autorename: true,
        }),
        "Content-Type": "application/octet-stream",
      },
      body: content,
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Failed to upload file.");
  }
});

export default router;
