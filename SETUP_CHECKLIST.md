# 🚀 Quick Start Guide

## Current Status
✅ Application is set up with Google Drive integration
⚠️ You need to complete Google Cloud setup to enable file uploads

## What's Working Now
- Login system
- Expense tracker UI
- Database (SQLite)
- File upload form

## What Needs Setup (5 minutes)
Google Drive API credentials - Follow `GOOGLE_DRIVE_SETUP.md`

## Steps to Complete Setup:

### 1. Set up Google Cloud (First Time Only)
```bash
# Open the setup guide
open GOOGLE_DRIVE_SETUP.md
```

Follow the instructions to:
- Create Google Cloud project
- Enable Drive API
- Create service account
- Download credentials JSON
- Add service account email to your Drive folder as Editor

### 2. Add Credentials to .env
```bash
# Copy the JSON content from downloaded file
# Add to .env file:
GOOGLE_SERVICE_ACCOUNT_KEY='paste-your-json-here'
```

### 3. Restart Server
```bash
npm run dev
```

## 📁 Your Drive Folder
All files will upload to: https://drive.google.com/drive/folders/136j62fGm8lnQQTyt0-9q3gvXr1kIgGl-

## Need Help?
- Check `GOOGLE_DRIVE_SETUP.md` for detailed setup
- Test with a small file first
- Files are viewable by anyone with the link

---

## Alternative: Skip Google Drive for Now
If you want to test without Google Drive:
1. Comment out the Google Drive code
2. Files will save locally (works for testing)
3. Add Google Drive later when ready
