"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { debounce } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, Save } from "lucide-react"
import colors from "@/lib/colors"
import { applicationData, toDbColumn } from "@/lib/applicationData"

// Dynamically build the schema based on applicationData.json
const buildSchema = () => {
  console.log("[ApplicationForm] Building form schema from config")
  let schema: Record<string, any> = {}

  // Helper function to process fields
  const processFields = (fields: Record<string, any>) => {
    Object.entries(fields).forEach(([fieldName, fieldConfig]) => {
      let fieldSchema: any = z.any() // Default to any
      const validationRules = fieldConfig.validationRules || {}

      switch (fieldConfig.type) {
        case "text":
        case "email":
        case "textarea":
          fieldSchema = z.string()
          if (validationRules.required) {
            fieldSchema = fieldSchema.min(1, { 
              message: validationRules.message || "This field is required." 
            })
          }
          if (validationRules.minLength) {
            fieldSchema = fieldSchema.min(validationRules.minLength, { 
              message: validationRules.message || `Min length is ${validationRules.minLength}` 
            })
          }
          if (fieldConfig.type === "email" && validationRules.email) {
            fieldSchema = fieldSchema.email({ 
              message: validationRules.message || "Invalid email format" 
            })
          }
          break
        case "select":
        case "radio":
          fieldSchema = z.string()
          if (validationRules.required) {
            fieldSchema = fieldSchema.min(1, { 
              message: validationRules.message || "Please make a selection." 
            })
          }
          break
        case "checkbox":
          fieldSchema = z.boolean()
          if (validationRules.required && validationRules.value === true) {
            fieldSchema = fieldSchema.refine((val: boolean) => val === true, {
              message: validationRules.message || "This checkbox is required",
            })
          }
          break
        default:
          // Fallback for unknown types or optional fields
          fieldSchema = z.string().optional()
      }
      
      // Handle optional fields explicitly
      if (!validationRules.required) {
        fieldSchema = fieldSchema.optional()
      }

      // Map field names to database column names
      const dbFieldName = toDbColumn(fieldName);
      schema[dbFieldName] = fieldSchema
    })
  }

  // Process all sections
  if (applicationData.personalInfo?.fields) {
    processFields(applicationData.personalInfo.fields)
  }
  
  if (applicationData.aboutYou?.fields) {
    processFields(applicationData.aboutYou.fields)
  }
  
  if (applicationData.additionalInfo?.fields) {
    processFields(applicationData.additionalInfo.fields)
  }

  console.log("[ApplicationForm] Schema build complete")
  return z.object(schema)
}

const formSchema = buildSchema()

type FormData = z.infer<typeof formSchema>

interface ApplicationFormProps {
  onChange: (data: FormData) => void
  onSubmit: () => void
  formData: Record<string, any>
  isSubmitted: boolean
  isLoading: boolean
}

// Initialize default values from JSON schema if available
const getDefaultValues = () => {
  console.log("[ApplicationForm] Initializing default form values")
  let defaults: Record<string, any> = {}
  
  // Helper function to process fields for defaults
  const processFields = (fields: Record<string, any>) => {
    Object.entries(fields).forEach(([fieldName, fieldConfig]) => {
      const dbFieldName = toDbColumn(fieldName);
      
      switch (fieldConfig.type) {
        case "text":
        case "email":
        case "textarea":
        case "select":
        case "radio":
          defaults[dbFieldName] = ""
          break
        case "checkbox":
          defaults[dbFieldName] = false
          break
        default:
          defaults[dbFieldName] = "" // Default empty string for others
      }
    })
  }
  
  // Process all sections
  if (applicationData.personalInfo?.fields) {
    processFields(applicationData.personalInfo.fields)
  }
  
  if (applicationData.aboutYou?.fields) {
    processFields(applicationData.aboutYou.fields)
  }
  
  if (applicationData.additionalInfo?.fields) {
    processFields(applicationData.additionalInfo.fields)
  }
  
  console.log("[ApplicationForm] Default values created")
  return defaults
}

export default function ApplicationForm({
  onChange,
  onSubmit,
  formData,
  isSubmitted,
  isLoading,
}: ApplicationFormProps) {
  console.log("[ApplicationForm] Component initialized with formData:", JSON.stringify(formData))
  console.log("[ApplicationForm] isSubmitted:", isSubmitted, "isLoading:", isLoading)
  
  const inputStyles = {
    backgroundColor: colors.theme.inputBackground,
    borderColor: colors.theme.inputBorder,
    color: colors.theme.inputText,
  };
  
  const labelStyles = {
    color: colors.theme.foreground,
  };
  
  const sectionTitleStyles = {
    color: colors.theme.primary,
  };
  
  const sectionDescriptionStyles = {
    color: colors.theme.foreground,
  };
  
  const errorMessageStyles = {
    color: colors.theme.danger,
  };
  
  const buttonStyles = {
    backgroundColor: colors.theme.primary,
    color: colors.theme.buttonText,
  };
  
  const { toast } = useToast()
  const [savingFields, setSavingFields] = useState<Record<string, boolean>>({})
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({})

  const renderSavingIndicator = (fieldName: string) => {
    if (isSubmitted) return null
    console.log("[ApplicationForm] renderSavingIndicator", fieldName, savingFields[fieldName], savedFields[fieldName])

    // if (savingFields[fieldName]) {
    //   return (
    //     <div className="ml-2 inline-flex items-center justify-center w-4 h-4 relative" title="Saving...">
    //       <div
    //         className="absolute w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
    //         style={{ borderColor: `${colors.theme.primary} transparent transparent transparent` }}
    //       ></div>
    //     </div>
    //   )
    // }

    // if (savedFields[fieldName]) {
    //   return <Check className="h-4 w-4 ml-2" style={{ color: colors.theme.success }} />
    // }

    return null
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...getDefaultValues(), // Use generated defaults
      ...formData, // Override with existing formData
    },
  })

  // Initialize form with existing data
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      console.log("[ApplicationForm] Resetting form with existing data")
      form.reset(formData)
    }
  }, [])

  // Debounced save function for real-time saving
  const debouncedSave = debounce((data: FormData, field: string) => {
    console.log(`[ApplicationForm] Saving field "${field}" with debounced save`)
    onChange(data)
    setSavingFields((prev) => ({ ...prev, [field]: false }))
    setSavedFields((prev) => ({ ...prev, [field]: true }))

    // Reset saved indicator after 15 seconds
    setTimeout(() => {
      setSavedFields((prev) => ({ ...prev, [field]: false }))
    }, 15000)
  }, 15000)

  // Watch for form changes and save in real-time
  useEffect(() => {
    console.log("[ApplicationForm] Setting up form change watcher")
    const subscription = form.watch((data, { name }) => {
      if (name) {
        console.log(`[ApplicationForm] Field "${name}" changed, scheduling save`)
        setSavingFields((prev) => ({ ...prev, [name]: true }))
        debouncedSave(data as FormData, name)
      }
    })

    return () => {
      console.log("[ApplicationForm] Cleaning up form watcher subscription")
      subscription.unsubscribe()
    }
  }, [form.watch])

  const handleSubmit = (data: FormData) => {
    console.log("[ApplicationForm] Form submit handler called with data:", JSON.stringify(data))
    onChange(data)
    onSubmit()
  }

  const personalInfo = applicationData.personalInfo
  const aboutYou = applicationData.aboutYou
  const additionalInfoSection = applicationData.additionalInfo

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold" style={sectionTitleStyles}>
            {personalInfo.title}
          </h2>
          <p className="text-sm" style={sectionDescriptionStyles}>
            {personalInfo.description}
          </p>
          <p className="text-sm" style={{ color: colors.theme.danger }}>
            {/* Fields marked with <span className="text-red-500">*</span> are required. */}
          </p>
        </div>

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{personalInfo.fields.fullName.label} {personalInfo.fields.fullName.validationRules.required ? <span className="text-red-500">*</span> : null}</FormLabel>
                {renderSavingIndicator("full_name")}
              </div>
              <FormControl>
                <Input
                  placeholder={personalInfo.fields.fullName.placeholder}
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
                  className="placeholder:text-opacity-50"
                  required
                />
              </FormControl>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discord"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{personalInfo.fields.discord.label} {personalInfo.fields.discord.validationRules.required ? <span className="text-red-500">*</span> : null}</FormLabel>
                {renderSavingIndicator("discord")}
              </div>
              <FormControl>
                <Input
                  placeholder={personalInfo.fields.discord.placeholder}
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
                  className="placeholder:text-opacity-50"
                />
              </FormControl>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="cwid"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel style={labelStyles}>{personalInfo.fields.cwid.label} {personalInfo.fields.cwid.validationRules.required ? <span className="text-red-500">*</span> : null}</FormLabel>
                  {renderSavingIndicator("cwid")}
                </div>
                <FormControl>
                  <Input
                    placeholder={personalInfo.fields.cwid.placeholder}
                    {...field}
                    disabled={isSubmitted}
                    style={inputStyles}
                    className="placeholder:text-opacity-50"
                    required
                  />
                </FormControl>
                <FormMessage style={errorMessageStyles} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skill_level"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel style={labelStyles}>{personalInfo.fields.skillLevel.label} {personalInfo.fields.skillLevel.validationRules.required ? <span className="text-red-500">*</span> : null}</FormLabel>
                  {renderSavingIndicator("skill_level")}
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitted}>
                  <FormControl>
                    <SelectTrigger style={inputStyles}>
                      <SelectValue placeholder={personalInfo.fields.skillLevel.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {personalInfo.fields.skillLevel.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage style={errorMessageStyles} />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="hear_about_us"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel style={labelStyles}>{personalInfo.fields.hearAboutUs.label} {personalInfo.fields.hearAboutUs.validationRules.required ? <span className="text-red-500">*</span> : null}</FormLabel>
                  {renderSavingIndicator("hear_about_us")}
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitted}>
                  <FormControl>
                    <SelectTrigger style={inputStyles}>
                      <SelectValue placeholder={personalInfo.fields.hearAboutUs.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {personalInfo.fields.hearAboutUs.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage style={errorMessageStyles} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hackathon_experience"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel style={labelStyles}>{personalInfo.fields.hackathonExperience.label} {personalInfo.fields.hackathonExperience.validationRules.required ? <span className="text-red-500">*</span> : null}</FormLabel>
                  {renderSavingIndicator("hackathon_experience")}
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitted}>
                  <FormControl>
                    <SelectTrigger style={inputStyles}>
                      <SelectValue placeholder={personalInfo.fields.hackathonExperience.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {personalInfo.fields.hackathonExperience.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage style={errorMessageStyles} />
              </FormItem>
            )}
          />
        </div>

        {/* About You Section */}
        <div className="space-y-2 pt-4">
          <h2 className="text-xl font-semibold" style={sectionTitleStyles}>
            {aboutYou.title}
          </h2>
          <p className="text-sm" style={sectionDescriptionStyles}>
            {aboutYou.description}
          </p>
        </div>

        <FormField
          control={form.control}
          name="why_attend"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{aboutYou.fields.whyAttend.label} {aboutYou.fields.whyAttend.validationRules.required ? <span className="text-red-500">*</span> : null}</FormLabel>
                {renderSavingIndicator("why_attend")}
              </div>
              <FormControl>
                <Textarea
                  placeholder={aboutYou.fields.whyAttend.placeholder}
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
                  className="placeholder:text-opacity-50"
                />
              </FormControl>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="project_experience"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{aboutYou.fields.projectExperience.label} {aboutYou.fields.projectExperience.validationRules.required ? <span className="text-red-500">*</span> : null}</FormLabel>
                {renderSavingIndicator("project_experience")}
              </div>
              <FormControl>
                <Textarea
                  placeholder={aboutYou.fields.projectExperience.placeholder}
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
                  className="placeholder:text-opacity-50"
                />
              </FormControl>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="future_plans"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{aboutYou.fields.futurePlans.label} {aboutYou.fields.futurePlans.validationRules.required ? <span className="text-red-500">*</span> : null}</FormLabel>
                {renderSavingIndicator("future_plans")}
              </div>
              <FormControl>
                <Textarea
                  placeholder={aboutYou.fields.futurePlans.placeholder}
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
                  className="placeholder:text-opacity-50"
                />
              </FormControl>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fun_fact"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{aboutYou.fields.funFact.label} {aboutYou.fields.funFact.validationRules.required ? <span className="text-red-500">*</span> : null}</FormLabel>
                {renderSavingIndicator("fun_fact")}
              </div>
              <FormControl>
                <Textarea
                  placeholder={aboutYou.fields.funFact.placeholder}
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
                  className="placeholder:text-opacity-50"
                />
              </FormControl>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="self_description"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{aboutYou.fields.selfDescription.label} {aboutYou.fields.selfDescription.validationRules.required ? <span className="text-red-500">*</span> : null}</FormLabel>
                {renderSavingIndicator("self_description")}
              </div>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                  disabled={isSubmitted}
                >
                  {aboutYou.fields.selfDescription.options.map((option) => (
                    <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={option.value} />
                      </FormControl>
                      <FormLabel className="font-normal" style={labelStyles}>
                        {option.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        {/* Additional Information Section */}
        <div className="space-y-2 pt-4">
          <h2 className="text-xl font-semibold" style={sectionTitleStyles}>
            {additionalInfoSection.title}
          </h2>
          <p className="text-sm" style={sectionDescriptionStyles}>
            {additionalInfoSection.description}
          </p>
        </div>

        <FormField
          control={form.control}
          name="links"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{additionalInfoSection.fields.links.label} {additionalInfoSection.fields.links.validationRules.required ? <span className="text-red-500">*</span> : null} </FormLabel>
                {renderSavingIndicator("links")}
              </div>
              <FormControl>
                <Textarea
                  placeholder={additionalInfoSection.fields.links.placeholder}
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
                  className="placeholder:text-opacity-50"
                />
              </FormControl>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teammates"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{additionalInfoSection.fields.teammates.label} {additionalInfoSection.fields.teammates.validationRules.required ? <span className="text-red-500">*</span> : null} </FormLabel>
                {renderSavingIndicator("teammates")}
              </div>
              <FormControl>
                <Textarea
                  placeholder={additionalInfoSection.fields.teammates.placeholder}
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
                  className="placeholder:text-opacity-50"
                />
              </FormControl>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referral_email"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{additionalInfoSection.fields.referralEmail.label} {additionalInfoSection.fields.referralEmail.validationRules.required ? <span className="text-red-500">*</span> : null} </FormLabel>
                {renderSavingIndicator("referral_email")}
              </div>
              <FormControl>
                <Input
                  placeholder={additionalInfoSection.fields.referralEmail.placeholder}
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
                  className="placeholder:text-opacity-50"
                />
              </FormControl>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dietary_restrictions_extra"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{additionalInfoSection.fields.dietaryRestrictionsExtra.label} {additionalInfoSection.fields.dietaryRestrictionsExtra.validationRules.required ? <span className="text-red-500">*</span> : null} </FormLabel>
                {renderSavingIndicator("dietary_restrictions_extra")}
              </div>
              <FormControl>
                <Textarea
                  placeholder={additionalInfoSection.fields.dietaryRestrictionsExtra.placeholder}
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
                  className="placeholder:text-opacity-50"
                />
              </FormControl>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agree_to_terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow"
              style={{ borderColor: isSubmitted ? colors.theme.success : colors.theme.inputBorder }}
            >
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitted}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel style={labelStyles}>{additionalInfoSection.fields.agreeToTerms.label} {additionalInfoSection.fields.agreeToTerms.validationRules.required ? <span className="text-red-500">*</span> : null}</FormLabel>
                <FormMessage style={errorMessageStyles} />
              </div>
            </FormItem>
          )}
        />

        {!isSubmitted && (
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              style={buttonStyles}

              className="px-8 py-3 text-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <div
                    className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-current"
                  ></div>
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
