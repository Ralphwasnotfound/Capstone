import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Step 1: Redirect user to Dropbox for authorization
router.get("/auth/dropbox", (req, res) => {
  const authUrl = new URL("https://www.dropbox.com/oauth2/authorize");
  authUrl.searchParams.set("client_id", process.env.DROPBOX_APP_KEY);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", process.env.DROPBOX_REDIRECT_URI);
  authUrl.searchParams.set("token_access_type", "offline"); // allows refresh token

  res.redirect(authUrl.toString());
});

// Step 2: Handle Dropbox callback and exchange code for access token
router.get("/auth/dropbox/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) return res.status(400).send("Missing authorization code.");

  try {
    // POST request to Dropbox to exchange code for tokens
    const response = await fetch("https://api.dropbox.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: process.env.DROPBOX_APP_KEY,
        client_secret: process.env.DROPBOX_APP_SECRET,
        redirect_uri: process.env.DROPBOX_REDIRECT_URI,
      }),
    });

    const data = await response.json();

    // This will log the access_token and refresh_token immediately
    console.log("Dropbox tokens received:", data);

    // Send a response to the browser so you know it worked
    res.json(data)
    
  } catch (err) {
    console.error("Dropbox auth error:", err);
    res.status(500).send("Failed to authenticate with Dropbox.");
  }
});

export default router;
