import { Dropbox } from "dropbox";
import fs from 'fs'
import { DROPBOX_ACCESS_TOKEN } from "../config/dropbox.js";

const ACCESS_TOKEN = DROPBOX_ACCESS_TOKEN

const dbx = new Dropbox({ accessToken: ACCESS_TOKEN })

export async function uploadToDropBox(filePath, destPath) {
    const fileContent = fs.readFileSync(filePath)

    const response = await dbx.filesUpload({
        path: `/${destPath}`,
        contents: fileContent,
        mode: 'overwrite'
    })

    const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({
        path: response.result.path_lower
    })

    return sharedLink.result.url.replace('?dl=0', '?raw=1')
}