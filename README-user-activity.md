# User Activity Tracking System

This system tracks every user interaction with the application, providing valuable insights into user behavior and app usage patterns.

## Features

- Tracks all user interactions (button clicks, screen views, input changes, etc.)
- Records device information (platform, OS version, app version)
- Handles offline tracking with a queue system
- Provides easy-to-use hooks and components for React Native
- Stores data in MongoDB for easy querying and analysis

## Database Schema

The user activity data is stored in MongoDB with the following schema:

```typescript
{
  user_id: ObjectId,           // Required, foreign key to users
  timestamp: Date,             // Required, when the action occurred
  action_type: String,         // Type of action (e.g., "button_click", "navigation")
  action_details: {            // Details about the action
    // Varies based on action_type
    button_name?: String,
    screen_name?: String,
    input_name?: String,
    // ... other details
  },
  device_info: {               // Information about the user's device
    platform?: String,         // iOS, Android
    os_version?: String,       // Version of the operating system
    app_version?: String       // Version of the app
  }
}
```

## Backend API Endpoints

- `POST /api/user-activity` - Record a new user activity
- `GET /api/user-activity/:user_id` - Get user activities for a specific user
- `DELETE /api/user-activity/:user_id` - Delete user activities for a specific user (for data privacy)

## Frontend Usage

### Using the Context Provider

Wrap your application with the `UserActivityProvider`:

```jsx
// In App.tsx
import { UserActivityProvider } from './context/UserActivityContext';

function App() {
  const userId = "user_id_from_auth";
  
  return (
    <UserActivityProvider userId={userId}>
      {/* Your app components */}
    </UserActivityProvider>
  );
}
```

### Using the Hook

Use the `useUserActivity` hook in your components:

```jsx
import { useUserActivity } from '../context/UserActivityContext';

function MyComponent() {
  const { trackButton, trackScreen } = useUserActivity();
  const currentScreen = 'MyScreen';
  
  // Track a button click
  const handleButtonPress = () => {
    trackButton('submit_button', currentScreen, { 
      // Additional details
      form_valid: true 
    });
    
    // Your button logic
  };
  
  // Track screen view on component mount
  useEffect(() => {
    trackScreen(currentScreen);
  }, []);
  
  return (
    // Your component JSX
  );
}
```

### Using the Higher-Order Component

Wrap your component with the `withActivityTracking` HOC:

```jsx
import { withActivityTracking } from '../utils/withActivityTracking';

function MyComponent(props) {
  // The HOC provides trackButton and trackInput props
  const { trackButton } = props;
  
  const handleButtonPress = () => {
    trackButton('submit_button', { 
      // Additional details
      form_valid: true 
    });
    
    // Your button logic
  };
  
  return (
    // Your component JSX
  );
}

// Wrap the component with tracking
export default withActivityTracking(MyComponent, 'MyScreen');
```

## Types of Actions Tracked

- `screen_view` - When a user views a screen
- `button_click` - When a user clicks a button
- `user_input` - When a user interacts with an input field
- `app_state_change` - When the app changes state (active, background, inactive)
- `back_button_press` - When the user presses the device's back button
- Custom actions - You can define your own action types as needed

## Data Analysis

The collected data can be used for:

- User behavior analysis
- Feature usage statistics
- Identifying pain points in the user journey
- A/B testing effectiveness
- Performance monitoring
- Crash analysis

## Privacy Considerations

- Ensure users are informed about data collection
- Provide options to opt out of tracking
- Implement data retention policies
- Use the DELETE endpoint to comply with data deletion requests
- Do not track sensitive personal information

## Installation

1. Install required packages:

```bash
# Backend
npm install --save mongoose express

# Frontend
npm install --save react-native-device-info
```

2. Set up the MongoDB connection in your backend
3. Import and use the tracking components in your frontend

## Contributing

Feel free to contribute to this project by submitting issues or pull requests. 