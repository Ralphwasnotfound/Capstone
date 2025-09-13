import { Dropbox } from "dropbox";
import fs from 'fs'
import fetch from "node-fetch"
import dotenv from "dotenv"

dotenv.config()

const CLIENT_ID = process.env.DROPBOX_APP_KEY
const CLIENT_SECRET = process.env.DROPBOX_APP_SECRET
const REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN

async function getAccessToken() {
    const response = await fetch("https://api.dropbox.com/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: REFRESH_TOKEN,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        })
    })

    const data = await response.json()
    if(!data.access_token) throw new Error("Failed to get Dorpbox access token")
        return data.access_token
    }

    export async function uploadToDropBox(filePath, destPath) {
        const accessToken = await getAccessToken()
        const dbx = new Dropbox( {accessToken })

        const fileContent = fs.readFileSync(filePath)

        // Upload file
        const response = await dbx.filesUpload({
            path: `/${destPath}`,
            contents: fileContent,
            mode: "overwrite"
        })

        const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({
            path: response.result.path_lower,
        })

        return sharedLink.result.url.replace("?dl=0", "?raw=1")
    }