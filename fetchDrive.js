const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

async function fetchGoogleDriveAttachments() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const drive = google.drive({ version: "v3", auth });
  const res = await drive.files.list({
    q: "(name contains 'CV' or name contains 'cv') and mimeType = 'application/pdf' and trashed = false",
    fields: "files(id, name, mimeType)",
  });

  const files = res.data.files;
  if (files.length) {
    for (const file of files) {
      const filePath = path.join("downloads", file.name);
      const dest = fs.createWriteStream(filePath);
      await drive.files
        .get({ fileId: file.id, alt: "media" }, { responseType: "stream" })
        .then((res) => {
          res.data.pipe(dest);
          console.log(`Downloaded: ${file.name}`);
        });
    }
  } else {
    console.log("No files found.");
  }
}

fetchGoogleDriveAttachments();