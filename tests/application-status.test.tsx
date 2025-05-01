/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApplicationStatus from '@/components/application-status';

// Define the status types to match the component
type Status = 
  | "not_started"
  | "in_progress"
  | "submitted"
  | "accepted"
  | "waitlisted"
  | "confirmed";

// Mock toast for notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ApplicationStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders not_started status correctly', () => {
    render(<ApplicationStatus status="not_started" />);
    
    // Look for the specific status indicator instead of generic text
    const notStartedElements = screen.getAllByText(/not started/i);
    expect(notStartedElements.length).toBeGreaterThan(0);
  });

  it('renders in_progress status correctly', () => {
    render(<ApplicationStatus status="in_progress" />);
    
    // Look for status in the rendered output - capitalization may be different
    const inProgressElements = screen.getAllByText(/in progress/i);
    expect(inProgressElements.length).toBeGreaterThan(0);
  });

  it('renders submitted status correctly', () => {
    render(<ApplicationStatus status="submitted" />);
    
    // Use getAllByText since there might be multiple matches
    const submittedElements = screen.getAllByText(/submitted/i);
    expect(submittedElements.length).toBeGreaterThan(0);
  });

  it('renders accepted status correctly', () => {
    // Pass only the props that the component accepts
    render(<ApplicationStatus status="accepted" />);
    
    // Use getAllByText since there might be multiple matches
    const acceptedElements = screen.getAllByText(/accepted/i);
    expect(acceptedElements.length).toBeGreaterThan(0);
    
    // Look for congratulations text
    const congratsElements = screen.getAllByText(/congratulations/i);
    expect(congratsElements.length).toBeGreaterThan(0);
  });
  
  it('renders waitlisted status correctly', () => {
    render(<ApplicationStatus status="waitlisted" />);
    
    // Get elements containing 'waitlisted'
    const waitlistedElements = screen.getAllByText(/waitlisted/i);
    expect(waitlistedElements.length).toBeGreaterThan(0);
  });
  
  it('renders confirmed status correctly', () => {
    render(<ApplicationStatus status="confirmed" />);
    
    // Get elements containing 'confirmed'
    const confirmedElements = screen.getAllByText(/confirmed/i);
    expect(confirmedElements.length).toBeGreaterThan(0);
  });

  it('handles unknown status gracefully', () => {
    // Use a type assertion to test with an invalid status
    render(<ApplicationStatus status={"unknown_status" as Status} />);
    
    // At minimum, the page should render the application status heading
    const statusHeadings = screen.getAllByText(/application status/i);
    expect(statusHeadings.length).toBeGreaterThan(0);
  });
}); 