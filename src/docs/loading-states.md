# Loading States Documentation

This document provides guidelines for implementing loading states across the application to ensure a consistent user experience.

## Available Loading Components

### 1. LoadingSpinner
A reusable spinner component with customizable size and color.

```tsx
import LoadingSpinner from '@/components/ui/LoadingSpinner';

<LoadingSpinner size="sm" color="primary" text="Loading..." />
```

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - Default: 'md'
- `color?: 'primary' | 'white' | 'gray'` - Default: 'primary'
- `text?: string` - Optional text to display below spinner
- `className?: string` - Additional CSS classes

### 2. LoadingOverlay
A full-page or partial overlay with loading spinner.

```tsx
import LoadingOverlay from '@/components/ui/LoadingOverlay';

<LoadingOverlay show={isLoading} text="Processing..." blur={true}>
  <YourContent />
</LoadingOverlay>
```

**Props:**
- `show: boolean` - Controls overlay visibility
- `text?: string` - Default: 'Loading...'
- `blur?: boolean` - Default: true
- `variant?: 'full' | 'partial' | 'inline'` - Default: 'full'

### 3. Skeleton Components
Pre-built skeleton layouts for common UI patterns.

```tsx
import { Skeleton, SkeletonCard, SkeletonFilters, SkeletonList } from '@/components/ui/Skeleton';

// Individual skeleton element
<Skeleton variant="text" width="100%" height={20} lines={3} />

// Pre-built layouts
<SkeletonCard />
<SkeletonFilters />
<SkeletonList count={5} />
```

### 4. Button with Loading
The Button component has built-in loading state support.

```tsx
import Button from '@/components/ui/Button';

<Button loading={isLoading} disabled={isLoading}>
  Submit
</Button>
```

## Form Component Loading States

All form components now support loading states:

### TextField
```tsx
import TextField from '@/components/forms/TextField';

<TextField
  label="Email"
  loading={isValidating}
  disabled={isValidating}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### SelectField
```tsx
import SelectField from '@/components/forms/SelectField';

<SelectField
  label="Category"
  options={categories}
  loading={isLoadingCategories}
  disabled={isLoadingCategories}
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
/>
```

### CheckboxField
```tsx
import CheckboxField from '@/components/forms/CheckboxField';

<CheckboxField
  label="Accept terms"
  loading={isValidating}
  disabled={isValidating}
  checked={acceptedTerms}
  onChange={(e) => setAcceptedTerms(e.target.checked)}
/>
```

## Custom Hooks

### useAsyncAction
A hook for managing async operations with loading states, error handling, and success callbacks.

```tsx
import { useAsyncAction } from '@/hooks/useAsyncAction';

const submitAction = useAsyncAction({
  onSuccess: (data) => console.log('Success:', data),
  onError: (error) => console.error('Error:', error),
  resetOnSuccess: true,
  resetDelay: 2000,
});

const handleSubmit = async () => {
  await submitAction.execute(async () => {
    const result = await api.submitForm(formData);
    return result;
  });
};

// In your JSX:
<Button 
  loading={submitAction.loading} 
  onClick={handleSubmit}
  disabled={submitAction.loading}
>
  Submit
</Button>
```

### useNavigationLoader
A hook specifically for navigation actions with loading states.

```tsx
import { useNavigationLoader } from '@/hooks/useAsyncAction';

const { isNavigating, navigateWithLoading } = useNavigationLoader();

const handleNavigation = () => {
  navigateWithLoading('details', async () => {
    router.push('/details');
  });
};

// In your JSX:
<Button 
  loading={isNavigating === 'details'}
  onClick={handleNavigation}
>
  View Details
</Button>
```

## Implementation Guidelines

### 1. Always Show Loading State
Any async operation that takes more than 200ms should show a loading state.

### 2. Be Specific with Loading Text
Use descriptive loading text that tells users what's happening:
- "Loading veterinarian information..."
- "Applying filters..."
- "Detecting your location..."
- "Submitting form..."

### 3. Prevent Multiple Actions
Always disable buttons/inputs during loading to prevent multiple submissions:
```tsx
<Button 
  loading={isLoading}
  disabled={isLoading}
  onClick={handleAction}
>
  Action
</Button>
```

### 4. Use Appropriate Loading Indicators
- **Buttons**: Use built-in loading prop
- **Forms**: Use loading prop on form fields
- **Pages**: Use LoadingOverlay or skeleton layouts
- **Cards/Lists**: Use skeleton components
- **Navigation**: Use navigation loader hook

### 5. Handle Errors Gracefully
Always provide error feedback when async operations fail:
```tsx
const action = useAsyncAction({
  onError: (error) => {
    toast.error(error.message);
  }
});
```

### 6. Reset Loading States
Ensure loading states are properly reset:
- On success (after a delay if needed)
- On error
- On component unmount

## Examples in the Codebase

### LocationButton
Uses LoadingSpinner for geolocation requests.

### GlobalFilters
Uses useAsyncAction hook for filter application and reset.

### VeterinarianDetailPage
Uses skeleton layout for initial page load.

### VeterinarianCard
Uses Button loading state for navigation.

### Pagination
Uses custom navigation loading states.

## Best Practices

1. **Consistency**: Use the same loading patterns throughout the app
2. **Performance**: Don't show loading for very fast operations (< 200ms)
3. **Accessibility**: Ensure loading states are screen reader friendly
4. **Visual Hierarchy**: Loading states should be clearly visible but not overwhelming
5. **User Feedback**: Always provide feedback when operations complete or fail