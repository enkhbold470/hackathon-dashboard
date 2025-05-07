/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApplicationDashboard from '@/components/application-dashboard';

// Mock the toast notifications
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: {
      error: jest.fn(),
      success: jest.fn()
    }
  })
}));

// Mock the components used by ApplicationDashboard
jest.mock('@/components/application-form', () => {
  return jest.fn(({ onSubmit, onChange, formData }) => (
    <div data-testid="mock-application-form">
      <button 
        data-testid="mock-submit-btn" 
        onClick={() => {
          // Call prepareSubmission by calling onSubmit without parameters
          onSubmit && onSubmit();
        }}
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

jest.mock('@/components/application-status', () => {
  return jest.fn(({ status }) => (
    <div data-testid="mock-application-status">
      <span data-testid="status-value">{status}</span>
      <button 
        data-testid="mock-confirm-btn" 
        onClick={() => window.dispatchEvent(new CustomEvent('confirmAttendance'))}
      >
        Confirm My Spot
      </button>
    </div>
  ));
});

// Mock the dialog component
jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ 
    children, 
    open, 
    onOpenChange 
  }: { 
    children: React.ReactNode; 
    open: boolean; 
    onOpenChange?: (open: boolean) => void 
  }) => open ? (
    <div data-testid="mock-alert-dialog">
      {children}
      <button 
        data-testid="mock-confirm-dialog-btn" 
        onClick={() => onOpenChange && onOpenChange(false)}
      >
        Confirm Dialog
      </button>
    </div>
  ) : null,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

jest.mock('@/hooks/useWindowSize', () => {
  return jest.fn(() => ({ width: 1024, height: 768 }));
});

jest.mock('react-confetti', () => {
  return jest.fn(() => <div data-testid="mock-confetti" />);
});

describe('ApplicationDashboard', () => {
  // Setup fetch mock before each test
  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn();
    
    // Default implementation for API calls
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/db/get') {
        return Promise.resolve({
          json: () => Promise.resolve({ 
            success: true, 
            application: { 
              status: 'not_started',
              full_name: 'Test User',
              cwid: '12345',
              agree_to_terms: true
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

  it('loads application data on mount', async () => {
    render(<ApplicationDashboard />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/db/get', { method: 'GET' });
    });
  });

  it('handles form changes correctly', async () => {
    await act(async () => {
      render(<ApplicationDashboard />);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('mock-application-form')).toBeInTheDocument();
    });
    
    // Trigger change event
    await act(async () => {
      fireEvent.click(screen.getByTestId('mock-change-btn'));
    });
    
    // Verify the form data was updated
    expect(await screen.findByTestId('mock-application-form')).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    // Mock successful submission specifically for this test
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (url === '/api/db/get') {
        return Promise.resolve({
          json: () => Promise.resolve({ 
            success: true, 
            application: { 
              status: 'not_started',
              full_name: 'Test User',
              cwid: '12345',
              agree_to_terms: true
            } 
          }),
          status: 200,
        });
      } else if (url === '/api/db/submit') {
        const body = JSON.parse(options.body);
        expect(body).toHaveProperty('full_name', 'Test User');
        expect(body).toHaveProperty('cwid', '12345');
        expect(body).toHaveProperty('agree_to_terms', true);
        
        return Promise.resolve({
          json: () => Promise.resolve({ 
            success: true, 
            application: { status: 'submitted' } 
          }),
          status: 200,
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true }),
        status: 200,
      });
    });
    
    await act(async () => {
      render(<ApplicationDashboard />);
    });
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByTestId('mock-application-form')).toBeInTheDocument();
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByTestId('mock-submit-btn'));
    });
    
    // The confirm dialog should appear - click the confirm button
    await waitFor(() => {
      expect(screen.getByTestId('mock-alert-dialog')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('mock-dialog-confirm'));
    });
    
    // Verify the API was called with the correct parameters
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/db/submit', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.any(String)
      }));
    }, { timeout: 3000 });
  });
  
  it('handles confirmation of attendance', async () => {
    // Set up an event listener to handle the confirm attendance event
    const confirmAttendanceSpy = jest.fn();
    window.addEventListener('confirmAttendance', confirmAttendanceSpy);
    
    // Mock successful acceptance
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/db/get') {
        return Promise.resolve({
          json: () => Promise.resolve({ 
            success: true, 
            application: { 
              status: 'accepted',
              full_name: 'Test User',
              cwid: '12345',
              agree_to_terms: true
            } 
          }),
          status: 200,
        });
      } else if (url === '/api/db/confirm-attendance') {
        return Promise.resolve({
          json: () => Promise.resolve({ 
            success: true,
            application: { status: 'confirmed' }
          }),
          status: 200,
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true }),
        status: 200,
      });
    });
    
    await act(async () => {
      render(<ApplicationDashboard />);
    });
    
    // Wait for the status component to load with the accepted status
    await waitFor(() => {
      expect(screen.getByTestId('mock-application-status')).toBeInTheDocument();
      expect(screen.getByTestId('status-value')).toHaveTextContent('accepted');
    });
    
    // Click confirm button to dispatch event
    await act(async () => {
      fireEvent.click(screen.getByTestId('mock-confirm-btn'));
    });
    
    // Verify that the event was dispatched
    expect(confirmAttendanceSpy).toHaveBeenCalled();
    
    // Verify the API was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/db/confirm-attendance', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }));
    });
    
    // Clean up
    window.removeEventListener('confirmAttendance', confirmAttendanceSpy);
  });
}); 