/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApplicationForm from '@/components/application-form';

// Mock applicationData
jest.mock('@/lib/applicationData', () => ({
  applicationData: {
    personalInfo: {
      title: "Personal Information",
      description: "Tell us about yourself",
      fields: {
        fullName: {
          label: "Full Name",
          type: "text",
          placeholder: "Enter your name",
          validationRules: {
            required: true
          }
        },
        cwid: {
          label: "CWID",
          type: "text",
          placeholder: "Enter your CWID",
          validationRules: {
            required: true
          }
        }
      }
    },
    education: {
      title: "Education",
      description: "Tell us about your education",
      fields: {
        school: {
          label: "School",
          type: "text",
          placeholder: "Enter your school",
          validationRules: {
            required: true
          }
        }
      }
    },
    additionalInfo: {
      title: "Additional Info",
      description: "Additional information",
      fields: {
        agreeToTerms: {
          label: "Agree to Terms",
          type: "checkbox",
          validationRules: {
            required: true,
            value: true
          }
        }
      }
    },
    disclaimer: {
      title: "Disclaimer",
      content: "This is a disclaimer"
    }
  },
  toDbColumn: (field: string): string => {
    const mapping: Record<string, string> = {
      fullName: "full_name",
      cwid: "cwid",
      school: "school",
      agreeToTerms: "agree_to_terms"
    };
    return mapping[field] || field;
  },
  toFormField: (dbField: string): string => {
    const mapping: Record<string, string> = {
      full_name: "fullName",
      cwid: "cwid",
      school: "school",
      agree_to_terms: "agreeToTerms"
    };
    return mapping[dbField] || dbField;
  }
}));

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Mock the UI components
jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ onCheckedChange, checked }: { onCheckedChange: (checked: boolean) => void; checked: boolean }) => (
    <input 
      type="checkbox" 
      data-testid="mock-checkbox-agree_to_terms" 
      onChange={(e) => onCheckedChange(e.target.checked)} 
      checked={checked}
    />
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, value, type = "text" }: { onChange: (e: any) => void; value: string; type?: string }) => (
    <input 
      type={type} 
      data-testid={`mock-input-${type}`} 
      onChange={onChange} 
      value={value || ''} 
    />
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ onChange, value }: { onChange: (e: any) => void; value: string }) => (
    <textarea 
      data-testid="mock-textarea" 
      onChange={onChange} 
      value={value || ''} 
    />
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled }: { children: React.ReactNode; onClick?: () => void; type?: string; disabled?: boolean }) => (
    <button data-testid={`mock-button-${type || 'button'}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

// Mock the Form component
jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-form">{children}</div>,
  FormControl: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-form-control">{children}</div>,
  FormField: ({ render, name }: { render: any; name: string }) => {
    const field = {
      value: '',
      onChange: jest.fn(),
      name: name
    };
    return render({ field });
  },
  FormItem: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-form-item">{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-form-label">{children}</div>,
  FormMessage: () => <div data-testid="mock-form-message"></div>,
}));

// Mock the Label component
jest.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-label">{children}</div>,
}));

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="mock-link">{children}</a>
  ),
}));

// Mock React Hook Form
jest.mock('react-hook-form', () => {
  const originalModule = jest.requireActual('react-hook-form');
  
  return {
    ...originalModule,
    useForm: () => ({
      register: jest.fn(),
      handleSubmit: (cb: (data: any) => void) => (e: React.FormEvent | undefined) => { 
        e?.preventDefault(); 
        cb({
          full_name: 'Test User',
          cwid: '12345',
          school: 'Test School',
          agree_to_terms: true
        });
      },
      formState: { 
        isValid: true, 
        errors: {} 
      },
      getValues: () => ({
        full_name: 'Test User',
        cwid: '12345',
        school: 'Test School',
        agree_to_terms: true
      }),
      setValue: jest.fn(),
      control: {}
    }),
  };
});

// Mock window resize listener
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024
});

describe('ApplicationForm', () => {
  const mockOnChange = jest.fn();
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    onChange: mockOnChange,
    onSubmit: mockOnSubmit,
    formData: {},
    isSubmitting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with personal information section', () => {
    render(<ApplicationForm {...defaultProps} />);
    
    // The application form should render the form
    expect(screen.getByTestId('mock-form')).toBeInTheDocument();
    
    // Check if the personal information section is in the document
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('calls onChange when form fields are updated', async () => {
    render(<ApplicationForm {...defaultProps} />);
    
    // Find an input and change it
    const inputs = screen.getAllByTestId('mock-input-text');
    fireEvent.change(inputs[0], { target: { value: 'Test User' } });
    
    // Verify onChange was called
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('handles form submission', () => {
    render(
      <ApplicationForm 
        {...defaultProps} 
        formData={{ 
          full_name: 'Test User', 
          cwid: '12345', 
          school: 'Test School',
          agree_to_terms: true 
        }} 
      />
    );
    
    // Find and click the submit button
    const submitButton = screen.getByTestId('mock-button-submit');
    fireEvent.click(submitButton);
    
    // Verify onSubmit was called without parameters
    expect(mockOnSubmit).toHaveBeenCalled();
    expect(mockOnSubmit).toHaveBeenCalledWith();
  });

  it('displays loading state when submitting', () => {
    render(
      <ApplicationForm 
        {...defaultProps} 
        isSubmitting={true} 
      />
    );
    
    // Check for loading indicator or disabled state on the submit button
    expect(screen.getByTestId('mock-button-submit')).toHaveAttribute('disabled');
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('displays submitted state when form is submitted', () => {
    render(
      <ApplicationForm 
        {...defaultProps} 
        isSubmitted={true} 
      />
    );
    
    // Check for submitted state on the submit button
    expect(screen.getByTestId('mock-button-submit')).toHaveAttribute('disabled');
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });
}); 