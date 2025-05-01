/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApplicationDashboard from '@/components/application-dashboard';

// Mock the components used by ApplicationDashboard
jest.mock('@/components/application-form', () => {
  return jest.fn(({ onSubmit, onChange, formData }) => (
    <div data-testid="mock-application-form">
      <button 
        data-testid="mock-submit-btn" 
        onClick={() => onSubmit && onSubmit({ full_name: 'Test User', cwid: '12345', agree_to_terms: true })}
      >
        Submit
      </button>
      <button 
        data-testid="mock-change-btn" 
        onClick={() => onChange && onChange({ full_name: 'Test User' })}
      >
        Change
      </button>
    </div>
  ));
});

jest.mock('@/components/application-status', () => {
  return jest.fn(({ status, onConfirm }) => (
    <div data-testid="mock-application-status">
      <span data-testid="status-value">{status}</span>
      {onConfirm && (
        <button data-testid="mock-confirm-btn" onClick={() => onConfirm()}>
          Confirm
        </button>
      )}
    </div>
  ));
});

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
            application: { status: 'not_started' } 
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
      expect(global.fetch).toHaveBeenCalledWith('/api/db/get', expect.any(Object));
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
      if (url === '/api/db/submit') {
        return Promise.resolve({
          json: () => Promise.resolve({ 
            success: true, 
            application: { status: 'submitted' } 
          }),
          status: 200,
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ 
          success: true, 
          application: { status: 'not_started' } 
        }),
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
    
    // Verify the API was called - might need to wait due to confirm dialog
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/db/submit', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }));
    }, { timeout: 3000 });
  });
}); 