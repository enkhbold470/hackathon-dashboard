/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApplicationDashboard from '@/components/application-dashboard';
import ApplicationStatus from '@/components/application-status';
import { useUser } from '@clerk/nextjs';

// Mock the toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the Clerk user hook
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

// Mock the components used by ApplicationDashboard
jest.mock('@/components/application-form', () => {
  return jest.fn(({ onSubmit, onChange, formData }) => (
    <div data-testid="mock-application-form">
      <button 
        data-testid="mock-submit-btn" 
        onClick={() => onSubmit && onSubmit()}
      >
        Submit
      </button>
      <button 
        data-testid="mock-change-btn" 
        onClick={() => onChange && onChange({ full_name: 'Test User', cwid: '12345' })}
      >
        Change
      </button>
    </div>
  ));
});

// Don't mock the status component since we want to test its loading state
jest.mock('@/components/application-status', () => {
  return jest.fn(({ status, isLoading, cwid }) => (
    <div data-testid="mock-application-status">
      {isLoading ? (
        <div data-testid="status-loading">Loading status information...</div>
      ) : (
        <>
          <span data-testid="status-value">{status}</span>
          <span data-testid="cwid-value">{cwid}</span>
          <button 
            data-testid="mock-confirm-btn" 
            onClick={() => window.dispatchEvent(new CustomEvent('confirmAttendance'))}
          >
            Confirm My Spot
          </button>
        </>
      )}
    </div>
  ));
});

// Mock useWindowSize hook
jest.mock('@/hooks/useWindowSize', () => {
  return jest.fn(() => ({ width: 1024, height: 768 }));
});

// Create a mock for the AlertDialog components
let dialogOpenState = false;
let dialogOpenChangeHandler: ((open: boolean) => void) | undefined;

// Mock the dialog component
jest.mock('@/components/ui/alert-dialog', () => {
  return {
    AlertDialog: ({ 
      children, 
      open, 
      onOpenChange 
    }: { 
      children: React.ReactNode; 
      open: boolean; 
      onOpenChange?: (open: boolean) => void 
    }) => {
      // Store the current open state and change handler for testing
      dialogOpenState = open;
      dialogOpenChangeHandler = onOpenChange;
      
      return open ? (
        <div data-testid="mock-alert-dialog">
          {children}
        </div>
      ) : null;
    },
    AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-dialog-content">{children}</div>,
    AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-dialog-header">{children}</div>,
    AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-dialog-footer">{children}</div>,
    AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-dialog-title">Unsaved Changes</div>,
    AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-dialog-description">
        You have unsaved changes in your application. If you leave now, your changes may be lost.
      </div>
    ),
    AlertDialogAction: ({ 
      children, 
      onClick 
    }: { 
      children: React.ReactNode; 
      onClick?: () => void 
    }) => (
      <button data-testid="mock-dialog-confirm" onClick={onClick}>
        {children}
      </button>
    ),
    AlertDialogCancel: ({ 
      children, 
      onClick 
    }: { 
      children: React.ReactNode; 
      onClick?: () => void 
    }) => (
      <button data-testid="mock-dialog-cancel" onClick={onClick}>
        {children}
      </button>
    ),
  };
});

jest.mock('react-confetti', () => {
  return jest.fn(() => <div data-testid="mock-confetti" />);
});

describe('Loading States', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn();
    
    // Mock the user
    (useUser as jest.Mock).mockReturnValue({ user: { id: 'user-123' } });
    
    jest.clearAllMocks();
  });

  it('shows loading spinner when fetching application data', async () => {
    // Delay the API response to ensure loading state is visible
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/db/get') {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              json: () => Promise.resolve({ 
                success: true, 
                application: { 
                  status: 'not_started',
                  full_name: 'Test User',
                  cwid: '12345',
                } 
              }),
              status: 200,
            });
          }, 100); // Delay to ensure loading state is shown
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true }),
        status: 200,
      });
    });

    render(<ApplicationDashboard />);
    
    // Check that the loading spinner is shown
    expect(screen.getByText(/Loading application/i)).toBeInTheDocument();
    
    // Wait for the loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('mock-application-form')).toBeInTheDocument();
    });
  });

  it('passes loading state to ApplicationStatus component', async () => {
    // Mock a delayed response
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/db/get') {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              json: () => Promise.resolve({ 
                success: true, 
                application: { 
                  status: 'submitted',
                  full_name: 'Test User',
                  cwid: '12345',
                } 
              }),
              status: 200,
            });
          }, 100);
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true }),
        status: 200,
      });
    });

    render(<ApplicationDashboard />);
    
    // Check that the main loading spinner is shown
    expect(screen.getByText(/Loading application/i)).toBeInTheDocument();
    
    // Wait for the loading to complete and switch to status tab
    await waitFor(() => {
      expect(screen.queryByText(/Loading application/i)).not.toBeInTheDocument();
    });
    
    // Since status is 'submitted', it should automatically switch to status tab
    await waitFor(() => {
      expect(screen.getByTestId('mock-application-status')).toBeInTheDocument();
    });
  });
});

describe('Unsaved Changes', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn();
    dialogOpenState = false;
    dialogOpenChangeHandler = undefined;
    
    // Mock the fetch response with a successful get
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/db/get') {
        return Promise.resolve({
          json: () => Promise.resolve({ 
            success: true, 
            application: { 
              status: 'in_progress',
              full_name: 'Test User',
              cwid: '12345',
            } 
          }),
          status: 200,
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true }),
        status: 200,
      });
    });
    
    jest.clearAllMocks();
  });

  it('shows unsaved changes indicator after form changes', async () => {
    await act(async () => {
      render(<ApplicationDashboard />);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('mock-application-form')).toBeInTheDocument();
    });
    
    // Initially there should be no unsaved changes warning
    expect(screen.queryByText(/You have unsaved changes/i)).not.toBeInTheDocument();
    
    // Trigger form change
    await act(async () => {
      fireEvent.click(screen.getByTestId('mock-change-btn'));
    });
    
    // Now the unsaved changes warning should appear
    expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
  });

  it('shows a warning indicator when there are unsaved changes', async () => {
    await act(async () => {
      render(<ApplicationDashboard />);
    });
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByTestId('mock-application-form')).toBeInTheDocument();
    });
    
    // Make a change to the form
    await act(async () => {
      fireEvent.click(screen.getByTestId('mock-change-btn'));
    });
    
    // Check that the unsaved changes indicator (the * badge) is visible
    const applicationTab = screen.getByRole('tab', { name: /Application Form/i });
    const badge = applicationTab.querySelector('.bg-yellow-500');
    expect(badge).toBeInTheDocument();
    
    // Check that the warning message is shown at the top of the form
    expect(screen.getByText(/You have unsaved changes. Your changes will be saved when you submit./i)).toBeInTheDocument();
  });

  it('handles beforeunload event when there are unsaved changes', async () => {
    // Mock beforeunload event listener implementation
    const addEventListenerMock = jest.fn();
    const removeEventListenerMock = jest.fn();
    const preventDefaultMock = jest.fn();
    
    // Store the original implementation
    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;
    
    // Replace with mocks to capture the event handler
    window.addEventListener = addEventListenerMock;
    window.removeEventListener = removeEventListenerMock;
    
    let beforeUnloadHandler: Function | null = null;
    
    // Setup the add event listener mock to capture the handler
    addEventListenerMock.mockImplementation((event, handler) => {
      if (event === 'beforeunload') {
        beforeUnloadHandler = handler;
      }
      // Don't actually call original listener in test environment
      return undefined;
    });
    
    try {
      await act(async () => {
        render(<ApplicationDashboard />);
      });
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('mock-application-form')).toBeInTheDocument();
      });
      
      // Check that addEventListener was called with beforeunload
      expect(addEventListenerMock).toHaveBeenCalledWith('beforeunload', expect.any(Function));
      
      // Trigger form change to set hasUnsavedChanges flag
      await act(async () => {
        fireEvent.click(screen.getByTestId('mock-change-btn'));
      });
      
      // Create a mock event
      const mockEvent = {
        preventDefault: preventDefaultMock,
        returnValue: ''
      };
      
      // Now manually call the beforeunload handler with our mock event
      if (beforeUnloadHandler) {
        beforeUnloadHandler(mockEvent);
        
        // Expect preventDefault to be called and returnValue to be set
        expect(preventDefaultMock).toHaveBeenCalled();
        expect(mockEvent.returnValue).toBeTruthy();
      } else {
        // Fail the test if we couldn't capture the handler
        expect(beforeUnloadHandler).not.toBeNull();
      }
    } finally {
      // Restore the original methods
      window.addEventListener = originalAddEventListener;
      window.removeEventListener = originalRemoveEventListener;
    }
  });
}); 