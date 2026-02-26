# 🔐 Google Drive Setup Instructions

Follow these steps to enable Google Drive integration:

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it something like "Climitra Internal Portal"

## 2. Enable Google Drive API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click **Enable**

## 3. Create Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Name it "climitra-portal-drive"
4. Click **Create and Continue**
5. Skip role assignment (optional)
6. Click **Done**

## 4. Generate Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** > **Create New Key**
4. Choose **JSON** format
5. Click **Create** - a JSON file will download

## 5. Configure Application

1. Open the downloaded JSON file
2. Copy the ENTIRE content
3. Open your `.env` file
4. Add this line (paste the JSON as a single line):

```
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'
```

## 6. Share Drive Folder with Service Account

1. Open the JSON key file
2. Find the `client_email` field (looks like: `something@project.iam.gserviceaccount.com`)
3. Go to your Google Drive folder
4. Click **Share**
5. Add the service account email
6. Give it **Editor** permission
7. Click **Send**

## 7. Restart Development Server

```bash
npm run dev
```

## ✅ Done!

Files uploaded through the portal will now be stored in your Google Drive folder!

---

## 📁 Current Folder

Your shared folder ID: `136j62fGm8lnQQTyt0-9q3gvXr1kIgGl-`

Anyone with the link can view files in this folder.
