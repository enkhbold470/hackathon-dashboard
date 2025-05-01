"use client"

import { useState, useMemo, memo, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"
import Link from "next/link"
import colors from "@/lib/colors"
import uiConfig from "@/lib/ui-config"
import { applicationData, toDbColumn } from "@/lib/applicationData"
import React from "react"

// Schema builder - static function instead of useMemo
const buildFormSchema = () => {
  let schema: Record<string, any> = {}

  const processFields = (fields: Record<string, any>) => {
    Object.entries(fields).forEach(([fieldName, fieldConfig]) => {
      const dbFieldName = toDbColumn(fieldName);
      const validationRules = fieldConfig.validationRules || {}
      
      if (fieldConfig.type === "checkbox") {
        let fieldSchema = z.boolean()
        if (validationRules.required && validationRules.value === true) {
          schema[dbFieldName] = fieldSchema.refine((val: boolean) => val === true, {
            message: validationRules.message || "This checkbox is required",
          })
        } else {
          schema[dbFieldName] = fieldSchema
        }
      } else if (fieldConfig.type === "email" && validationRules.required) {
        schema[dbFieldName] = z.string().email({ message: validationRules.message || "Invalid email format" })
          .min(1, { message: validationRules.message || "This field is required." })
      } else if (validationRules.required) {
        let fieldSchema = z.string().min(1, { message: validationRules.message || "This field is required." })
        if (validationRules.minLength) {
          fieldSchema = fieldSchema.min(validationRules.minLength, { 
            message: validationRules.message || `Min length is ${validationRules.minLength}` 
          })
        }
        schema[dbFieldName] = fieldSchema
      } else {
        schema[dbFieldName] = z.string().nullable().optional()
      }
    })
  }

  Object.values(applicationData).forEach(section => {
    if (section.fields) {
      processFields(section.fields)
    }
  })

  return z.object(schema)
}

// Create the schema statically
const formSchema = buildFormSchema();

type FormData = z.infer<typeof formSchema>

interface ApplicationFormProps {
  onChange: (data: FormData) => void
  onSubmit: (data?: FormData) => void
  formData: Record<string, any>
  isSubmitting?: boolean
  isSubmitted?: boolean
}

// Field option type
interface FieldOption {
  value: string;
  label: string;
}

// Default values function - static function
const getDefaultValues = () => {
  let defaults: Record<string, any> = {}
  
  Object.values(applicationData).forEach(section => {
    if (section.fields) {
      Object.entries(section.fields).forEach(([fieldName, fieldConfig]) => {
        const dbFieldName = toDbColumn(fieldName);
        
        if (fieldConfig.type === "checkbox") {
          defaults[dbFieldName] = false
        } else {
          defaults[dbFieldName] = ""
        }
      })
    }
  })
  
  return defaults
}

// Memoized form field component to prevent re-renders
const FormFieldComponent = memo(({ 
  fieldName,
  fieldConfig,
  control,
  isSubmitted,
  isSubmitting,
  handleFieldChange,
  renderSavingIndicator,
  styles,
  isMobile
}: {
  fieldName: string,
  fieldConfig: any,
  control: any,
  isSubmitted?: boolean,
  isSubmitting?: boolean,
  handleFieldChange: (name: string, value: any) => void,
  renderSavingIndicator: (name: string) => React.ReactNode,
  styles: any,
  isMobile: boolean
}) => {
  const dbFieldName = toDbColumn(fieldName);
  
  return (
    <div className="relative">
      <FormField
        control={control}
        name={dbFieldName}
        render={({ field }) => {
          // Ensure field value is never null
          const fieldValue = field.value === null ? "" : field.value;
          
          switch (fieldConfig.type) {
            case "text":
            case "email":
              return (
                <FormItem className="mb-4">
                  <FormLabel style={{
                    ...styles.label,
                    fontSize: isMobile 
                      ? uiConfig.typography.fontSize.mobile.questionTitle
                      : uiConfig.typography.fontSize.questionTitle,
                    fontWeight: uiConfig.typography.fontWeight.semibold,
                    marginBottom: uiConfig.spacing.inputGap
                  }}>
                   {fieldConfig.validationRules.required ? <span style={{ color: 'red' }}>*</span> : ""} {fieldConfig.label} {renderSavingIndicator(dbFieldName)}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={fieldConfig.placeholder}
                      style={{
                        ...styles.input,
                        width: isMobile ? '100%' : uiConfig.inputSizes.shortAnswer.width,
                        maxWidth: uiConfig.inputSizes.shortAnswer.maxWidth,
                        height: uiConfig.inputSizes.shortAnswer.height,
                        padding: isMobile 
                          ? uiConfig.spacing.mobile.inputPadding 
                          : uiConfig.spacing.inputPadding,
                        fontSize: isMobile 
                          ? uiConfig.typography.fontSize.mobile.answerOption
                          : uiConfig.typography.fontSize.answerOption,
                        borderWidth: uiConfig.inputStyles.borderWidth,
                        borderBottomWidth: '1px',
                        borderBottomColor: colors.theme.inputBorder,
                        borderBottomStyle: 'solid',
                        borderRadius: uiConfig.inputStyles.borderRadius,
                        backgroundColor: uiConfig.inputStyles.backgroundColor,
                        boxShadow: 'none',
                        transition: uiConfig.transitions.default
                      }}
                      className="focus:border-b-2 focus:border-primary hover:border-b-2 hover:border-primary focus:outline-none focus:shadow-none"
                      value={fieldValue || ""}
                      onChange={(e) => {
                        field.onChange(e)
                        handleFieldChange(dbFieldName, e.target.value)
                      }}
                      type={fieldConfig.type}
                      disabled={isSubmitted || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage style={{
                    ...styles.errorMessage,
                    fontSize: uiConfig.typography.fontSize.helperText,
                    marginTop: '4px'
                  }} />
                </FormItem>
              )
              
            case "textarea":
              return (
                <FormItem className="mb-4">
                  <FormLabel style={{
                    ...styles.label,
                    fontSize: isMobile 
                      ? uiConfig.typography.fontSize.mobile.questionTitle
                      : uiConfig.typography.fontSize.questionTitle,
                    fontWeight: uiConfig.typography.fontWeight.semibold,
                    marginBottom: uiConfig.spacing.inputGap
                  }}>
                  {fieldConfig.validationRules.required ? <span style={{ color: 'red' }}>*</span> : ""} {fieldConfig.label} {renderSavingIndicator(dbFieldName)}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={fieldConfig.placeholder}
                      style={{
                        ...styles.input,
                        width: isMobile ? '100%' : uiConfig.inputSizes.paragraph.width,
                        maxWidth: uiConfig.inputSizes.paragraph.maxWidth,
                        minHeight: uiConfig.inputSizes.paragraph.minHeight,
                        padding: isMobile 
                          ? uiConfig.spacing.mobile.inputPadding 
                          : uiConfig.spacing.inputPadding,
                        fontSize: isMobile 
                          ? uiConfig.typography.fontSize.mobile.answerOption
                          : uiConfig.typography.fontSize.answerOption,
                        lineHeight: uiConfig.typography.lineHeight.relaxed,
                        borderWidth: uiConfig.inputStyles.borderWidth,
                        borderBottomWidth: '1px',
                        borderBottomColor: colors.theme.inputBorder,
                        borderBottomStyle: 'solid',
                        borderRadius: uiConfig.inputStyles.borderRadius,
                        backgroundColor: uiConfig.inputStyles.backgroundColor,
                        boxShadow: 'none',
                        transition: uiConfig.transitions.default
                      }}
                      className="focus:border-b-2 focus:border-primary hover:border-b-2 hover:border-primary focus:outline-none focus:shadow-none"
                      value={fieldValue || ""}
                      onChange={(e) => {
                        field.onChange(e)
                        handleFieldChange(dbFieldName, e.target.value)
                      }}
                      disabled={isSubmitted || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage style={{
                    ...styles.errorMessage,
                    fontSize: uiConfig.typography.fontSize.helperText,
                    marginTop: '4px'
                  }} />
                </FormItem>
              )
              
            case "select":
              return (
                <FormItem className="mb-4">
                  <FormLabel style={{
                    ...styles.label,
                    fontSize: isMobile 
                      ? uiConfig.typography.fontSize.mobile.questionTitle
                      : uiConfig.typography.fontSize.questionTitle,
                    fontWeight: uiConfig.typography.fontWeight.semibold,
                    marginBottom: uiConfig.spacing.inputGap
                  }}>
                    {fieldConfig.validationRules.required ? <span style={{ color: 'red' }}>*</span> : ""} {fieldConfig.label} {renderSavingIndicator(dbFieldName)}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleFieldChange(dbFieldName, value)
                    }}
                    defaultValue={fieldValue || ""}
                    disabled={isSubmitted || isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger 
                        style={{
                          ...styles.input,
                          width: isMobile ? '100%' : uiConfig.inputSizes.dropdown.width,
                          maxWidth: uiConfig.inputSizes.dropdown.maxWidth,
                          height: uiConfig.inputSizes.dropdown.height,
                          padding: isMobile 
                            ? uiConfig.spacing.mobile.inputPadding 
                            : uiConfig.spacing.inputPadding,
                          fontSize: isMobile 
                            ? uiConfig.typography.fontSize.mobile.answerOption
                            : uiConfig.typography.fontSize.answerOption,
                          borderWidth: uiConfig.inputStyles.borderWidth,
                          borderBottomWidth: '1px',
                          borderBottomColor: colors.theme.inputBorder,
                          borderBottomStyle: 'solid',
                          borderRadius: uiConfig.inputStyles.borderRadius,
                          backgroundColor: uiConfig.inputStyles.backgroundColor,
                          boxShadow: 'none',
                          transition: uiConfig.transitions.default
                        }}
                        className="focus:border-b-2 focus:border-primary hover:border-b-2 hover:border-primary focus:outline-none focus:shadow-none"
                      >
                        <SelectValue placeholder={fieldConfig.placeholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fieldConfig.options?.map((option: FieldOption) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage style={{
                    ...styles.errorMessage,
                    fontSize: uiConfig.typography.fontSize.helperText,
                    marginTop: '4px'
                  }} />
                </FormItem>
              )
              
            case "radio":
              return (
                <FormItem className="mb-4">
                  <FormLabel style={{
                    ...styles.label,
                    fontSize: isMobile 
                      ? uiConfig.typography.fontSize.mobile.questionTitle
                      : uiConfig.typography.fontSize.questionTitle,
                    fontWeight: uiConfig.typography.fontWeight.semibold,
                    marginBottom: uiConfig.spacing.inputGap
                  }}>
                    {fieldConfig.validationRules.required ? <span style={{ color: 'red' }}>*</span> : ""} {fieldConfig.label} {renderSavingIndicator(dbFieldName)}
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleFieldChange(dbFieldName, value)
                      }}
                      defaultValue={fieldValue || ""}
                      disabled={isSubmitted || isSubmitting}
                      className="flex flex-col space-y-2"
                    >
                      {fieldConfig.options?.map((option: FieldOption) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value={option.value} 
                            id={`${fieldName}-${option.value}`}
                            style={{
                              width: uiConfig.inputSizes.radio.size,
                              height: uiConfig.inputSizes.radio.size
                            }}
                          />
                          <Label 
                            htmlFor={`${fieldName}-${option.value}`}
                            style={{
                              fontSize: isMobile 
                                ? uiConfig.typography.fontSize.mobile.answerOption
                                : uiConfig.typography.fontSize.answerOption,
                            }}
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage style={{
                    ...styles.errorMessage,
                    fontSize: uiConfig.typography.fontSize.helperText,
                    marginTop: '4px'
                  }} />
                </FormItem>
              )
              
            case "checkbox":
              return (
                <FormItem className="mb-4">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      {/* increase size of the checkbox */}
                      <Checkbox
                        checked={fieldValue === true}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          handleFieldChange(dbFieldName, checked)
                        }}
                        disabled={isSubmitted || isSubmitting}
                        style={{
                          width: uiConfig.inputSizes.checkbox.size,
                          height: uiConfig.inputSizes.checkbox.size
                        }}
                      />
                    </FormControl>
                    <FormLabel style={{
                      ...styles.label,
                      fontSize: isMobile 
                        ? uiConfig.typography.fontSize.mobile.answerOption
                        : uiConfig.typography.fontSize.answerOption,
                    }} className="text-sm font-medium">
                      {fieldConfig.validationRules.required ? <span style={{ color: 'red' }}>*</span> : ""} {fieldConfig.label} 
                      {fieldName === "agreeToTerms" && (
                        <span className="text-blue-500 cursor-pointer">
                          <Link href="https://github.com/da-hacks/legal/blob/4eb1f4413cdfa7fce2f5914db4786d89b2113176/media-waiver.md" target="_blank">Terms and Conditions</Link>
                        </span>
                      )}
                      {renderSavingIndicator(dbFieldName)}
                      
                    </FormLabel>
                  </div>
                  <FormMessage style={{
                    ...styles.errorMessage,
                    fontSize: uiConfig.typography.fontSize.helperText,
                    marginTop: '4px',
                    marginLeft: `calc(${uiConfig.inputSizes.checkbox.size} + ${uiConfig.inputSizes.checkbox.spacing})`
                  }} />
                </FormItem>
              )
              
            default:
              return (
                <FormItem className="mb-4">
                  <FormLabel style={{
                    ...styles.label,
                    fontSize: isMobile 
                      ? uiConfig.typography.fontSize.mobile.questionTitle
                      : uiConfig.typography.fontSize.questionTitle,
                    fontWeight: uiConfig.typography.fontWeight.semibold,
                  }}>
                    {fieldConfig.validationRules.required ? <span style={{ color: 'red' }}>*</span> : ""} {fieldConfig.label} {renderSavingIndicator(dbFieldName)}
                  </FormLabel>
                </FormItem>
              )
          }
        }}
      />
    </div>
  );
});

FormFieldComponent.displayName = 'FormFieldComponent';

function ApplicationForm({
  onChange,
  onSubmit,
  formData,
  isSubmitting,
  isSubmitted,
}: ApplicationFormProps) {
  const { toast } = useToast()
  const [savingFields, setSavingFields] = useState<Record<string, boolean>>({})
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({})
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < parseInt(uiConfig.breakpoints.md.replace('px', '')))
    }
    
    // Initial check
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Memoized styles to prevent recalculation - properly inside component
  const styles = useMemo(() => ({
    input: {
      backgroundColor: colors.theme.inputBackground,
      borderColor: colors.theme.inputBorder,
      color: colors.theme.inputText,
      transition: uiConfig.transitions.default,
    },
    label: { 
      color: colors.theme.foreground,
      fontFamily: uiConfig.typography.fontFamily.base,
      transition: uiConfig.transitions.default,
    },
    sectionTitle: {
      color: colors.theme.primary,
      fontFamily: uiConfig.typography.fontFamily.base,
      fontSize: isMobile 
        ? uiConfig.typography.fontSize.mobile.sectionTitle
        : uiConfig.typography.fontSize.sectionTitle,
      fontWeight: uiConfig.typography.fontWeight.bold,
      transition: uiConfig.transitions.default,
    },
    sectionDescription: {
      color: colors.theme.foreground,
      fontFamily: uiConfig.typography.fontFamily.base,
      fontSize: isMobile 
        ? uiConfig.typography.fontSize.mobile.helperText
        : uiConfig.typography.fontSize.helperText,
      lineHeight: uiConfig.typography.lineHeight.relaxed,
      transition: uiConfig.transitions.default,
    },
    errorMessage: {
      color: colors.theme.danger,
      transition: uiConfig.transitions.default,
    },
    button: {
      backgroundColor: colors.theme.primary,
      color: colors.theme.buttonText,
      fontWeight: uiConfig.typography.fontWeight.medium,
      fontSize: uiConfig.typography.fontSize.buttonText,
      padding: isMobile 
        ? uiConfig.spacing.mobile.buttonPadding
        : uiConfig.spacing.buttonPadding,
      borderRadius: uiConfig.borderRadius.md,
      transition: uiConfig.transitions.default,
    }
  }), [isMobile]);
  
  // Saving indicator component
  const renderSavingIndicator = (fieldName: string) => {
    if (savingFields[fieldName]) {
      return <span className="inline-block ml-2">Saving...</span>
    } else if (savedFields[fieldName]) {
      return (
        <span className="inline-block ml-2 text-green-500">
          <Check size={16} />
        </span>
      )
    }
    return null
  }

  // Initialize form with default values and form data
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...getDefaultValues(), ...formData },
    mode: "onChange"
  })
  
  // Handle field change for auto-save
  const handleFieldChange = async (name: string, value: any) => {
    setSavingFields(prev => ({ ...prev, [name]: true }))
    
    try {
      const formValues = form.getValues()
      await onChange({ ...formValues, [name]: value })
      setSavedFields(prev => ({ ...prev, [name]: true }))
      
      // Clear saved indicator after 2 seconds
      setTimeout(() => {
        setSavedFields(prev => ({ ...prev, [name]: false }))
      }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSavingFields(prev => ({ ...prev, [name]: false }))
    }
  }

  // Submit form handler
  const handleSubmit = (data: FormData) => {
    console.log('ApplicationForm handleSubmit called with data:', data);
    console.log('Form validation state:', form.formState);
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-8"
        style={{
          fontFamily: uiConfig.typography.fontFamily.base
        }}
      >
        {/* Render sections and fields */}
        {Object.entries(applicationData).map(([sectionKey, section]) => (
          <div 
            key={sectionKey} 
            className="bg-white/5 rounded-lg mb-8"
            style={{
              padding: isMobile 
                ? uiConfig.spacing.mobile.sectionPadding 
                : uiConfig.spacing.sectionPadding,
              boxShadow: uiConfig.shadows.sm,
              borderRadius: uiConfig.borderRadius.lg,
            }}
          >
            <h2 
              className="text-2xl font-bold mb-2" 
              style={styles.sectionTitle}
            >
              {section.title}
            </h2>
            <p 
              className="mb-6" 
              style={styles.sectionDescription}
            >
              {section.description}
            </p>
            
            <div 
              className="space-y-6"
              style={{
                gap: isMobile 
                  ? uiConfig.spacing.mobile.questionGap
                  : uiConfig.spacing.questionGap
              }}
            >
              {section.fields && Object.entries(section.fields).map(([fieldName, fieldConfig]) => (
                <FormFieldComponent
                  key={fieldName}
                  fieldName={fieldName}
                  fieldConfig={fieldConfig}
                  control={form.control}
                  isSubmitted={isSubmitted}
                  isSubmitting={isSubmitting}
                  handleFieldChange={handleFieldChange}
                  renderSavingIndicator={renderSavingIndicator}
                  styles={styles}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </div>
        ))}
        
        {/* Submit button */}
        <div 
          className="sticky bottom-0 bg-background p-4 border-t border-border z-10"
          style={{
            padding: isMobile 
              ? uiConfig.spacing.mobile.containerPadding
              : uiConfig.spacing.containerPadding,
            boxShadow: uiConfig.shadows.md
          }}
        >
          <Button 
            type="submit"
            disabled={isSubmitted || isSubmitting || !form.formState.isValid} 
            className={isMobile ? 'w-full' : ''}
            style={{
              ...styles.button,
              width: isMobile 
                ? uiConfig.inputSizes.submitButton.mobile.width
                : uiConfig.inputSizes.submitButton.width,
              height: isMobile 
                ? uiConfig.inputSizes.submitButton.mobile.height
                : uiConfig.inputSizes.submitButton.height
            }}
          >
            {isSubmitting ? "Processing..." : isSubmitted ? "Submitted" : "Submit Application"}
          </Button>
          
          {!form.formState.isValid && (
            <p 
              className="text-sm text-red-500 mt-2"
              style={{
                fontSize: uiConfig.typography.fontSize.helperText,
                color: colors.theme.danger
              }}
            >
              Please fill in all required fields correctly before submitting.
            </p>
          )}
        </div>
      </form>
    </Form>
  )
}

export default memo(ApplicationForm);
