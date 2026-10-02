# Google Drive Upload Fix & Setup Guide

## Why did the error happen?
You saw this error:
> `Service Accounts do not have storage quota. Leverage shared drives or use OAuth delegation instead.`

**Root Cause:**
Google Service Accounts (`service-account.json`) are assigned **0 GB** storage quota by Google. When uploading files to a personal Google Drive account (`@gmail.com`), Google treats the Service Account as the file owner, rejecting the upload with quota 0.

---

## Solution 1: Google Drive Link (Available right now in the modal!)
In the "Upload Document" modal, you can now toggle between:
1. **Upload File**
2. **Google Drive Link** (رابط جوجل درايف)

If you have the file:
1. Upload it to your Google Drive folder (`MJO_Documents`).
2. Right-click the file -> **Share** -> Change general access to **"Anyone with the link can view"** (أي شخص لديه الرابط).
3. Copy the link (e.g. `https://drive.google.com/file/d/1abc.../view`).
4. Select **Google Drive Link** in the website modal, paste the link, and click **Save & Publish**.
It will save and work immediately!

---

## Solution 2: Automated Direct File Upload via Google Apps Script (Recommended)
To allow visitors / admins to upload `.pdf`, `.docx`, `.pptx` directly through the website without pasting links, follow these 1-minute steps:

### Step 1: Open Google Apps Script
Go to [https://script.google.com](https://script.google.com) while signed in to `gabinajour01@gmail.com` (or whichever Google account owns your folder).

### Step 2: Create a New Project
1. Click **+ New project**.
2. Replace all the code in the editor with this:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var defaultFolderId = "1XJ4UxTw62nx4ynJ7i1Y5NABOrBML4kWx"; // MJO_Documents folder
    var folderId = data.folderId || defaultFolderId;
    var folder = DriveApp.getFolderById(folderId);

    var decoded = Utilities.base64Decode(data.base64);
    var blob = Utilities.newBlob(
      decoded,
      data.mimeType || 'application/octet-stream',
      data.fileName || 'document'
    );
    var file = folder.createFile(blob);

    // Set permission so visitors can view/download
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    var fileUrl = "https://drive.google.com/file/d/" + fileId + "/view";

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileId: fileId,
      fileUrl: fileUrl
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 3: Deploy as Web App
1. At the top right, click **Deploy** -> **New deployment**.
2. Click the gear icon (⚙️) next to "Select type" and select **Web app**.
3. Fill in:
   - **Description:** MJO Drive Uploader
   - **Execute as:** `Me (gabinajour01@gmail.com)` *(Important! This uses your 15GB drive quota)*
   - **Who has access:** `Anyone` *(Important! Allows the Next.js server to send uploads)*
4. Click **Deploy**.
5. Grant permissions when prompted (Click *Advanced* -> *Go to Untitled project (unsafe)* -> *Allow*).
6. Copy the **Web App URL** (looks like `https://script.google.com/macros/s/.../exec`).

### Step 4: Add to `.env.local`
Add this line to your `.env.local` file:
```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Restart your dev server or it will automatically reload. From then on, all direct file uploads will work seamlessly with your Google Drive folder!
