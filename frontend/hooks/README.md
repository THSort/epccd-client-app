# Custom Hooks

## useBackButtonHandler

A custom hook to standardize hardware back button handling across all screens. This hook:

1. Tracks back button presses for analytics
2. Provides consistent navigation behavior
3. Allows for custom overrides when needed

### Usage

```tsx
import { useBackButtonHandler } from '../hooks/useBackButtonHandler';

const MyScreen = () => {
  const currentScreen = 'MyScreen'; // Screen name for analytics
  
  // Basic usage - track back button and navigate back
  useBackButtonHandler(currentScreen);
  
  return (
    // Your component JSX
  );
};
```

### With Custom Override

For screens that need custom back button behavior (e.g., multi-step forms, nested content):

```tsx
import { useBackButtonHandler } from '../hooks/useBackButtonHandler';

const MyScreenWithNestedContent = () => {
  const currentScreen = 'MyScreenWithNestedContent';
  const [isShowingNestedContent, setIsShowingNestedContent] = useState(false);
  
  // Custom override function
  const handleCustomBack = () => {
    if (isShowingNestedContent) {
      // Handle special case
      setIsShowingNestedContent(false);
      return true; // Indicates we've handled the back press
    }
    
    // Return false to use default behavior (track and navigate back)
    return false;
  };
  
  // Use with custom override
  useBackButtonHandler(currentScreen, handleCustomBack);
  
  return (
    // Your component JSX
  );
};
```

### Manual Trigger

You can also manually trigger the back action:

```tsx
const MyComponent = () => {
  const currentScreen = 'MyComponent';
  
  // Get the handler function
  const handleBack = useBackButtonHandler(currentScreen);
  
  return (
    <View>
      <Button 
        title="Back" 
        onPress={() => {
          // Manually trigger the same action as hardware back button
          handleBack();
        }} 
      />
    </View>
  );
};
``` 