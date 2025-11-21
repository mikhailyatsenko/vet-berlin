'use client';

import { useState } from 'react';
import { 
  Button, 
  Card, 
  LoadingSpinner, 
  LoadingOverlay, 
  Skeleton, 
  SkeletonCard,
  SkeletonList,
  TextField,
  SelectField,
  CheckboxField
} from '@/components';
import { useAsyncAction, useNavigationLoader } from '@/hooks/useAsyncAction';

interface LoadingExampleState {
  buttonLoading: boolean;
  overlayLoading: boolean;
  formLoading: boolean;
  navigationLoading: string | null;
}

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

export default function LoadingExamples() {
  const [state, setState] = useState<LoadingExampleState>({
    buttonLoading: false,
    overlayLoading: false,
    formLoading: false,
    navigationLoading: null,
  });

  const { navigateWithLoading, isNavigating } = useNavigationLoader();
  
  const asyncAction = useAsyncAction({
    onSuccess: () => console.log('Action completed successfully'),
    onError: (error) => console.error('Action failed:', error),
  });

  const simulateAsyncOperation = (duration: number = 2000): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, duration));
  };

  const handleButtonClick = async () => {
    setState(prev => ({ ...prev, buttonLoading: true }));
    await simulateAsyncOperation(2000);
    setState(prev => ({ ...prev, buttonLoading: false }));
  };

  const handleOverlayToggle = async () => {
    setState(prev => ({ ...prev, overlayLoading: true }));
    await simulateAsyncOperation(3000);
    setState(prev => ({ ...prev, overlayLoading: false }));
  };

  const handleFormSubmit = async () => {
    setState(prev => ({ ...prev, formLoading: true }));
    await simulateAsyncOperation(1500);
    setState(prev => ({ ...prev, formLoading: false }));
  };

  const handleAsyncAction = async () => {
    await asyncAction.execute(async () => {
      await simulateAsyncOperation(2500);
      return { success: true, data: 'Operation completed' };
    });
  };

  const handleNavigation = (target: string) => {
    navigateWithLoading(target, async () => {
      await simulateAsyncOperation(1000);
      console.log(`Navigating to ${target}`);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Loading State Examples</h1>

      {/* Basic Loading Spinner */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Loading Spinner Variants</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <LoadingSpinner size="sm" color="primary" />
            <span className="text-sm text-gray-600">Small Primary</span>
          </div>
          <div className="flex items-center gap-4">
            <LoadingSpinner size="md" color="gray" text="Loading..." />
            <span className="text-sm text-gray-600">Medium Gray with Text</span>
          </div>
          <div className="flex items-center gap-4">
            <LoadingSpinner size="lg" color="white" text="Processing..." />
            <span className="text-sm text-gray-600">Large White with Text</span>
          </div>
        </div>
      </Card>

      {/* Button Loading States */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Button Loading States</h2>
        <div className="flex flex-wrap gap-4">
          <Button 
            loading={state.buttonLoading}
            disabled={state.buttonLoading}
            onClick={handleButtonClick}
          >
            Simulate Action
          </Button>
          
          <Button 
            loading={asyncAction.loading}
            disabled={asyncAction.loading}
            onClick={handleAsyncAction}
            variant="outline"
          >
            Async Action Hook
          </Button>

          <Button 
            loading={isNavigating === 'page1'}
            disabled={isNavigating !== null}
            onClick={() => handleNavigation('page1')}
            variant="secondary"
          >
            Navigate to Page 1
          </Button>

          <Button 
            loading={isNavigating === 'page2'}
            disabled={isNavigating !== null}
            onClick={() => handleNavigation('page2')}
            variant="ghost"
          >
            Navigate to Page 2
          </Button>
        </div>
      </Card>

      {/* Form Field Loading States */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Form Field Loading States</h2>
        <div className="space-y-4">
          <TextField
            label="Text Field"
            placeholder="Enter text..."
            loading={state.formLoading}
            disabled={state.formLoading}
          />

          <SelectField
            label="Select Field"
            options={mockOptions}
            loading={state.formLoading}
            disabled={state.formLoading}
          />

          <CheckboxField
            label="Checkbox Field"
            loading={state.formLoading}
            disabled={state.formLoading}
          />

          <Button 
            onClick={handleFormSubmit}
            loading={state.formLoading}
            disabled={state.formLoading}
          >
            Submit Form
          </Button>
        </div>
      </Card>

      {/* Loading Overlay */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Loading Overlay</h2>
        <LoadingOverlay 
          show={state.overlayLoading} 
          text="Processing overlay content..."
          blur={true}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              This content will be covered by the loading overlay when activated.
            </p>
            <Button onClick={handleOverlayToggle}>
              Toggle Overlay Loading
            </Button>
          </div>
        </LoadingOverlay>
      </Card>

      {/* Skeleton Examples */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Skeleton Loading</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Individual Skeleton Elements</h3>
            <div className="space-y-2">
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="rectangular" width={200} height={40} />
              <Skeleton variant="circular" width={50} height={50} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Pre-built Skeleton Card</h3>
            <SkeletonCard />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Skeleton List</h3>
            <SkeletonList count={3} />
          </div>
        </div>
      </Card>

      {/* Error Handling Example */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Error Handling</h2>
        <div className="space-y-4">
          {asyncAction.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">
                Error: {asyncAction.error.message}
              </p>
            </div>
          )}
          
          <Button 
            onClick={async () => {
              await asyncAction.execute(async () => {
                throw new Error('This is a simulated error');
              });
            }}
            variant="danger"
          >
            Simulate Error
          </Button>

          {asyncAction.error && (
            <Button 
              onClick={asyncAction.clearError}
              variant="outline"
            >
              Clear Error
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}