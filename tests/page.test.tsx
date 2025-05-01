/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';

// Mock the components used in the page
jest.mock('@/components/application-dashboard', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="mock-application-dashboard" />),
}));

// We can mock the Clerk components in our setup file
describe('Home Page', () => {
  it('renders the application dashboard', async () => {
    // Use dynamic import to get the page component
    const HomeModule = await import('@/app/page');
    const Home = HomeModule.default;
    
    // Basic render test
    const { getByTestId } = render(<Home />);
    expect(getByTestId('mock-application-dashboard')).toBeInTheDocument();
  });
}); 