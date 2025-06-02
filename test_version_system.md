# Testing the Version Update System

This guide will help you test the version checking system to ensure it works correctly.

## Test Scenarios

### 1. Test Update Required Flow

**Setup:**
1. In `backend/src/controllers/version.controller.ts`, set:
   ```typescript
   const LATEST_APP_VERSION = "1.0.1";
   ```

2. In `frontend/package.json`, ensure version is:
   ```json
   "version": "1.0.0"
   ```

**Expected Result:**
- App shows loading screen briefly
- Update screen appears with dark theme
- Shows current version: 1.0.0, latest version: 1.0.1
- Download and Copy buttons are visible
- User cannot access main app

### 2. Test Copy Functionality

**Steps:**
1. Trigger update screen (from Test 1)
2. Tap "Copy Download Link" button
3. Check for alert: "Link Copied"
4. Green checkmark should appear briefly
5. Try pasting in another app to verify clipboard

**Expected Result:**
- Alert shows "The download link has been copied to your clipboard"
- Green success message appears for 3 seconds
- Link is actually copied to device clipboard

### 3. Test App Up-to-Date Flow

**Setup:**
1. In `backend/src/controllers/version.controller.ts`, set:
   ```typescript
   const LATEST_APP_VERSION = "1.0.0";
   ```

2. In `frontend/package.json`, ensure version is:
   ```json
   "version": "1.0.0"
   ```

**Expected Result:**
- App shows loading screen briefly
- App proceeds to registration/main app normally
- No update screen is shown

### 4. Test Network Error Handling

**Setup:**
1. Turn off internet or change API base URL to invalid
2. Start the app

**Expected Result:**
- App shows loading screen briefly
- App proceeds to registration/main app (graceful degradation)
- Error logged to console but app continues

### 5. Test Retry Functionality

**Setup:**
1. Trigger update screen
2. Tap "Check Again" button

**Expected Result:**
- Loading state briefly
- Version check runs again
- Either shows update screen again or proceeds to app

## API Testing with cURL

### Test Version Check Endpoint

```bash
# Test with outdated version
curl -X POST http://localhost:3000/api/version/check \
  -H "Content-Type: application/json" \
  -d '{"app_version": "1.0.0"}'

# Expected response when update required:
{
  "success": true,
  "isLatest": false,
  "message": "App update required",
  "currentVersion": "1.0.0",
  "latestVersion": "1.0.1",
  "downloadUrl": "https://your-domain.com/app-releases/latest.apk",
  "updateMessage": "A new version of the app is available..."
}
```

```bash
# Test with current version
curl -X POST http://localhost:3000/api/version/check \
  -H "Content-Type: application/json" \
  -d '{"app_version": "1.0.1"}'

# Expected response when up to date:
{
  "success": true,
  "isLatest": true,
  "message": "App is up to date",
  "currentVersion": "1.0.1",
  "latestVersion": "1.0.1"
}
```

### Test Latest Version Endpoint

```bash
curl http://localhost:3000/api/version/latest

# Expected response:
{
  "success": true,
  "latestVersion": "1.0.1",
  "downloadUrl": "https://your-domain.com/app-releases/latest.apk"
}
```

## Visual Verification

### Dark Theme Elements
- [ ] Background is dark (#121212)
- [ ] Card background is dark (#1E1E1E)
- [ ] Text is light colored
- [ ] Buttons have proper contrast
- [ ] Notice box has orange accent

### Functionality
- [ ] Download button opens link
- [ ] Copy button copies to clipboard
- [ ] Copy button shows success message
- [ ] Retry button triggers new version check
- [ ] Loading states work properly

## Troubleshooting

### Update Screen Not Showing
- Verify backend version > frontend version
- Check API endpoint is accessible
- Check console for errors

### Copy Not Working
- Verify clipboard package is installed
- Check device permissions
- Test on different devices/emulators

### App Crashes
- Check React Native version compatibility
- Verify all imports are correct
- Check for syntax errors in new files

## Production Deployment Checklist

Before deploying to production:

1. [ ] Update `LATEST_APK_URL` to real download URL
2. [ ] Update `API_BASE_URL` to production endpoint
3. [ ] Test on real devices
4. [ ] Verify APK hosting works
5. [ ] Test clipboard on iOS and Android
6. [ ] Update version numbers consistently 