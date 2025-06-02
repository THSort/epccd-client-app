# App Version Update System

This document explains how to use the automated version checking system that ensures users always have the latest version of your app.

## How It Works

1. **On App Startup**: The app checks its current version against the backend's latest version
2. **Version Comparison**: If versions don't match, the user is blocked from using the app
3. **Update Screen**: Users see a screen with download link and explanation
4. **Forced Update**: Users cannot access the app until they update

## Backend Configuration

### 1. Update Version Information

Edit `backend/src/controllers/version.controller.ts`:

```typescript
// Update these values whenever you release a new version
const LATEST_APP_VERSION = "1.0.1"; // Change this to your new version
const LATEST_APK_URL = "https://your-domain.com/app-releases/latest.apk"; // Your APK download URL
```

### 2. API Endpoints

The system provides two endpoints:

- `POST /api/version/check` - Check if a version is latest
- `GET /api/version/latest` - Get latest version info

## Frontend Configuration

### 1. Update App Version

When you make changes to your app, update `frontend/package.json`:

```json
{
  "name": "lahore_aqi_monitoring",
  "version": "1.0.1", // Update this to match backend
  "private": true,
  // ...
}
```

### 2. App Flow

The app follows this flow:

1. **Version Check** → Loading screen while checking version
2. **Update Required?** → Show update screen if version mismatch
3. **Registration** → Show registration if no user ID
4. **Main App** → Show main app if everything is valid

## Release Process

### Step 1: Make Your Changes
- Develop your new features/fixes
- Test thoroughly

### Step 2: Update Version Numbers
1. Update `frontend/package.json` version
2. Update `backend/src/controllers/version.controller.ts`:
   - `LATEST_APP_VERSION`
   - `LATEST_APK_URL` (if URL changes)

### Step 3: Build and Deploy
1. Build your React Native app:
   ```bash
   cd frontend
   npx react-native run-android --variant=release
   ```

2. Upload APK to your hosting service
3. Update the APK URL in the backend controller if needed
4. Deploy backend changes

### Step 4: Users Get Automatic Updates
- Existing users will be prompted to update when they open the app
- They cannot use the app until they download and install the new version

## API Response Examples

### Version Check Request
```javascript
POST /api/version/check
{
  "app_version": "1.0.0"
}
```

### Response (Update Required)
```javascript
{
  "success": true,
  "isLatest": false,
  "message": "App update required",
  "currentVersion": "1.0.0",
  "latestVersion": "1.0.1",
  "downloadUrl": "https://your-domain.com/app-releases/latest.apk",
  "updateMessage": "A new version of the app is available. Please update to continue using the app with the latest features and bug fixes."
}
```

### Response (Up to Date)
```javascript
{
  "success": true,
  "isLatest": true,
  "message": "App is up to date",
  "currentVersion": "1.0.1",
  "latestVersion": "1.0.1"
}
```

## Customizing the Update Screen

The update screen is located at `frontend/screens/update-screen/update-screen.tsx`. You can customize:

- Visual design and styling
- Update message text
- Button labels
- Icons and branding

## Error Handling

- **Network Errors**: If version check fails, app continues normally (graceful degradation)
- **Invalid URLs**: Update screen shows error message if download URL is invalid
- **API Errors**: Logged to console, app continues with fallback behavior

## Testing

### Test Update Flow
1. Set backend version to "1.0.1"
2. Set frontend version to "1.0.0" 
3. Start the app
4. You should see the update screen

### Test Current Version
1. Set both backend and frontend versions to "1.0.0"
2. Start the app
3. Should proceed to normal app flow

## Security Considerations

- Always use HTTPS for APK download URLs
- Consider implementing APK signature verification
- Monitor download links for availability
- Use secure hosting for APK files

## Troubleshooting

### Users Not Seeing Update Prompt
- Check backend version controller values
- Verify API endpoints are accessible
- Check network connectivity
- Review console logs for errors

### Download Link Not Working
- Verify APK URL is correct and accessible
- Check file permissions on hosting server
- Test URL in browser directly
- Ensure HTTPS is used for production

### App Not Starting After Update
- Verify new APK is properly signed
- Check for breaking changes in app code
- Test on multiple devices
- Review crash logs

## Advanced Features

### Version History Tracking
You could extend this system to:
- Track version adoption rates
- Store version history in database
- Show release notes to users
- Implement staged rollouts

### Conditional Updates
Modify the logic to:
- Allow certain versions to skip updates
- Implement minimum required versions
- Show different messages for different update types 