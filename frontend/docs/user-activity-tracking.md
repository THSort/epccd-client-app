# User Activity Tracking Guidelines

This document provides guidelines for consistently tracking user interactions in the application.

## Overview

We track user interactions to understand how users engage with our application, identify pain points, and improve the user experience. All tracking data is stored in the database via the backend's `/api/user-activity` endpoint.

## Components

We have several tracking components to ensure consistent tracking:

- `TrackableButton`: Use for all button clicks
- `TrackableInput`: Use for text input fields
- `TrackableTouchable`: Use for any touchable elements that aren't buttons

## Constants

To ensure consistent naming across the app, use the constants in `frontend/utils/trackingConstants.ts`:

- `ACTION_TYPES`: Standard action types (button_click, screen_view, etc.)
- `ELEMENT_NAMES`: Standard names for UI elements (buttons, inputs, etc.)
- `SCREEN_NAMES`: Standard screen names for consistent tracking

## Implementation Guidelines

### For Buttons

```jsx
import { TrackableButton, ELEMENT_NAMES, SCREEN_NAMES } from '../components/tracking';

// In your component:
<TrackableButton
  buttonName={ELEMENT_NAMES.BTN_VIEW_DETAILED_REPORT}
  screenName={SCREEN_NAMES.HOME}
  onPress={() => navigation.navigate('Details')}
>
  <Text>View Details</Text>
</TrackableButton>
```

### For Inputs

```jsx
import { TrackableInput, ELEMENT_NAMES, SCREEN_NAMES } from '../components/tracking';

// In your component:
<TrackableInput
  inputName={ELEMENT_NAMES.INP_NAME}
  screenName={SCREEN_NAMES.REGISTRATION}
  value={name}
  onChangeText={setName}
  placeholder="Enter your name"
/>
```

### For Other Touchable Elements

```jsx
import { TrackableTouchable, ELEMENT_NAMES, SCREEN_NAMES, ACTION_TYPES } from '../components/tracking';

// In your component:
<TrackableTouchable
  actionName={ELEMENT_NAMES.TOG_CHART_DISPLAY}
  actionType={ACTION_TYPES.TOGGLE}
  screenName={SCREEN_NAMES.HISTORY}
  onPress={() => toggleSomething()}
>
  <Icon name="toggle" />
</TrackableTouchable>
```

## Naming Conventions

### Element Names

- Buttons: Start with `btn_` (e.g., `btn_submit`)
- Inputs: Start with `inp_` (e.g., `inp_email`)  
- Selection elements: Start with `sel_` (e.g., `sel_location`)
- Toggles: Start with `tog_` (e.g., `tog_notification`)

### Action Types

Use the predefined action types from `ACTION_TYPES` constant:

- `button_click`: For button interactions
- `screen_view`: For screen views
- `user_input`: For user text inputs
- `navigation`: For navigation actions
- `selection`: For selection actions
- `toggle`: For toggle actions

## Database Structure

User activities are stored in the database with the following structure:

```typescript
{
  user_id: string;
  timestamp: Date;
  action_type: string;
  action_details: {
    // Varies based on action type
    button_name?: string;
    screen_name?: string;
    input_name?: string;
    // Additional data
  };
  device_info: {
    platform?: string;
    os_version?: string;
    app_version?: string;
  };
}
```

## Best Practices

1. **Use the provided components**: Always use the tracking wrapper components.
2. **Use consistent naming**: Use the constants in `trackingConstants.ts`.
3. **Include relevant context**: Add additional tracking data that would be useful for analysis.
4. **Avoid sensitive information**: Never track passwords or sensitive personal information.
5. **Track meaningful interactions**: Focus on tracking interactions that provide insights into user behavior. 