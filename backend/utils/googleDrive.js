/*
 * Google Drive backup helper (OAuth2 / personal account).
 *
 * Hybrid storage: files are always saved to local disk and served from /uploads.
 * In addition, when Drive credentials are configured, each upload is pushed to the
 * owner's Google Drive as a backup. Drive is best-effort — if it's not configured
 * or a call fails, uploads still succeed locally.
 *
 * Required .env vars (see .env.example):
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN        (obtain once via: npm run google-auth)
 *   GOOGLE_REDIRECT_URI         (optional, default below — must match the OAuth client)
 *   GOOGLE_DRIVE_FOLDER_ID      (optional — target folder; falls back to Drive root)
 */
const fs = require('fs');
const { google } = require('googleapis');

const DEFAULT_REDIRECT = 'http://localhost:5001/api/upload/google/callback';

const isConfigured = () =>
  !!(process.env.GOOGLE_CLIENT_ID &&
     process.env.GOOGLE_CLIENT_SECRET &&
     process.env.GOOGLE_REFRESH_TOKEN);

/* Build an OAuth2 client. `withRefresh` attaches the stored refresh token so the
   client can mint access tokens on its own (used for uploads). */
const getOAuthClient = (withRefresh = true) => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || DEFAULT_REDIRECT,
  );
  if (withRefresh && process.env.GOOGLE_REFRESH_TOKEN) {
    client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  }
  return client;
};

/*
 * Upload a local file to Drive and make it link-readable.
 * Returns { id, link } on success, or null if Drive is unconfigured / fails.
 */
const uploadToDrive = async ({ filePath, filename, mimetype }) => {
  if (!isConfigured()) return null;
  try {
    const auth  = getOAuthClient();
    const drive = google.drive({ version: 'v3', auth });

    const requestBody = { name: filename };
    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      requestBody.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
    }

    const { data: file } = await drive.files.create({
      requestBody,
      media: { mimeType: mimetype, body: fs.createReadStream(filePath) },
      fields: 'id, webViewLink',
    });

    // Make it readable by anyone with the link (so it can be referenced if needed)
    await drive.permissions.create({
      fileId: file.id,
      requestBody: { role: 'reader', type: 'anyone' },
    }).catch(() => {});

    return { id: file.id, link: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view` };
  } catch (err) {
    console.error('[googleDrive] upload failed:', err.message);
    return null;
  }
};

/* Delete the Drive backup for a file (best-effort). */
const deleteFromDrive = async (fileId) => {
  if (!isConfigured() || !fileId) return;
  try {
    const drive = google.drive({ version: 'v3', auth: getOAuthClient() });
    await drive.files.delete({ fileId });
  } catch (err) {
    console.error('[googleDrive] delete failed:', err.message);
  }
};

module.exports = { isConfigured, getOAuthClient, uploadToDrive, deleteFromDrive, DEFAULT_REDIRECT };
