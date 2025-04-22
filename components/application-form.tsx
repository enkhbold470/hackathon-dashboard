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
import colors from "@/lib/colors.json"
import applicationData from "@/lib/applicationData.json"

// Dynamically build the schema based on applicationData.json
const buildSchema = () => {
  console.log("[ApplicationForm] Building form schema from config")
  let schema: Record<string, any> = {}

  Object.values(applicationData.formSchema).forEach((section) => {
    Object.entries(section.fields).forEach(([fieldName, fieldConfig]) => {
      let fieldSchema: any = z.any() // Default to any

      switch (fieldConfig.type) {
        case "text":
        case "email":
        case "textarea":
          fieldSchema = z.string()
          if (fieldConfig.validationRules.required) {
            fieldSchema = fieldSchema.min(1, { message: fieldConfig.validationRules.message || "This field is required." })
          }
          if (fieldConfig.validationRules.minLength) {
            fieldSchema = fieldSchema.min(fieldConfig.validationRules.minLength, { message: fieldConfig.validationRules.message })
          }
          if (fieldConfig.type === "email" && fieldConfig.validationRules.email) {
            fieldSchema = fieldSchema.email({ message: fieldConfig.validationRules.message })
          }
          break
        case "select":
        case "radio":
          fieldSchema = z.string()
          if (fieldConfig.validationRules.required) {
            fieldSchema = fieldSchema.min(1, { message: fieldConfig.validationRules.message || "Please make a selection." })
          }
          break
        case "checkbox":
          fieldSchema = z.boolean()
          if (fieldConfig.validationRules.required && fieldConfig.validationRules.value === true) {
            fieldSchema = fieldSchema.refine((val: boolean) => val === true, {
              message: fieldConfig.validationRules.message,
            })
          }
          break
        default:
          // Fallback for unknown types or optional fields
          fieldSchema = z.string().optional()
      }
      
      // Handle optional fields explicitly
      if (!fieldConfig.validationRules.required) {
        fieldSchema = fieldSchema.optional()
      }

      schema[fieldName] = fieldSchema
    })
  })

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
  Object.values(applicationData.formSchema).forEach((section) => {
    Object.entries(section.fields).forEach(([fieldName, fieldConfig]) => {
      switch (fieldConfig.type) {
        case "text":
        case "email":
        case "textarea":
        case "select":
        case "radio":
          defaults[fieldName] = ""
          break
        case "checkbox":
          defaults[fieldName] = false
          break
        default:
          defaults[fieldName] = "" // Default empty string for others
      }
    })
  })
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
  
  const { toast } = useToast()
  const [savingFields, setSavingFields] = useState<Record<string, boolean>>({})
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({})

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

    // Reset saved indicator after 2 seconds
    setTimeout(() => {
      setSavedFields((prev) => ({ ...prev, [field]: false }))
    }, 2000)
  }, 1000)

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

  const renderSavingIndicator = (fieldName: string) => {
    if (isSubmitted) return null

    if (savingFields[fieldName]) {
      return (
        <div className="ml-2 inline-flex items-center justify-center w-4 h-4 relative" title="Saving...">
          <div
            className="absolute w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${colors.theme.primary} transparent transparent transparent` }}
          ></div>
        </div>
      )
    }

    if (savedFields[fieldName]) {
      return <Check className="h-4 w-4 ml-2" style={{ color: colors.theme.success }} />
    }

    return null
  }

  const inputStyles = {
    backgroundColor: colors.theme.inputBackground,
    borderColor: colors.theme.inputBorder,
    color: colors.theme.inputText,
  }

  const labelStyles = {
    color: colors.theme.foreground,
    
  }

  const sectionTitleStyles = {
    color: colors.theme.primary,
  }

  const sectionDescriptionStyles = {
    color: colors.theme.foreground,
  }

  const errorMessageStyles = {
    color: colors.theme.danger,
  }

  const personalInfo = applicationData.formSchema.personalInfo
  const aboutYou = applicationData.formSchema.aboutYou
  const additionalInfoSection = applicationData.formSchema.additionalInfo

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
        </div>

        <FormField
          control={form.control}
          name="legalName"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{personalInfo.fields.legalName.label}</FormLabel>
                {renderSavingIndicator("legalName")}
              </div>
              <FormControl>
                <Input
                  placeholder={personalInfo.fields.legalName.placeholder}
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{personalInfo.fields.email.label}</FormLabel>
                {renderSavingIndicator("email")}
              </div>
              <FormControl>
                <Input
                  placeholder={personalInfo.fields.email.placeholder}
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
            name="university"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel style={labelStyles}>{personalInfo.fields.university.label}</FormLabel>
                  {renderSavingIndicator("university")}
                </div>
                <FormControl>
                  <Input
                    placeholder={personalInfo.fields.university.placeholder}
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
            name="major"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel style={labelStyles}>{personalInfo.fields.major.label}</FormLabel>
                  {renderSavingIndicator("major")}
                </div>
                <FormControl>
                  <Input
                    placeholder={personalInfo.fields.major.placeholder}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="graduationYear"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel style={labelStyles}>{personalInfo.fields.graduationYear.label}</FormLabel>
                  {renderSavingIndicator("graduationYear")}
                </div>
                <FormControl>
                  <Input
                    placeholder={personalInfo.fields.graduationYear.placeholder}
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
            name="experience"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel style={labelStyles}>{personalInfo.fields.experience.label}</FormLabel>
                  {renderSavingIndicator("experience")}
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitted}>
                  <FormControl>
                    <SelectTrigger style={inputStyles}>
                      <SelectValue placeholder={personalInfo.fields.experience.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {personalInfo.fields.experience.options.map((option) => (
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
          name="whyAttend"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{aboutYou.fields.whyAttend.label}</FormLabel>
                {renderSavingIndicator("whyAttend")}
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
          name="projectExperience"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{aboutYou.fields.projectExperience.label}</FormLabel>
                {renderSavingIndicator("projectExperience")}
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
          name="futurePlans"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{aboutYou.fields.futurePlans.label}</FormLabel>
                {renderSavingIndicator("futurePlans")}
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
          name="funFact"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{aboutYou.fields.funFact.label}</FormLabel>
                {renderSavingIndicator("funFact")}
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
          name="selfDescription"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{aboutYou.fields.selfDescription.label}</FormLabel>
                {renderSavingIndicator("selfDescription")}
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
                <FormLabel style={labelStyles}>{additionalInfoSection.fields.links.label}</FormLabel>
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
                <FormLabel style={labelStyles}>{additionalInfoSection.fields.teammates.label}</FormLabel>
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
          name="referralEmail"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{additionalInfoSection.fields.referralEmail.label}</FormLabel>
                {renderSavingIndicator("referralEmail")}
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
          name="dietaryRestrictions"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>{additionalInfoSection.fields.dietaryRestrictions.label}</FormLabel>
                {renderSavingIndicator("dietaryRestrictions")}
              </div>
              <FormControl>
                <Textarea
                  placeholder={additionalInfoSection.fields.dietaryRestrictions.placeholder}
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
          name="agreeToTerms"
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
                <FormLabel style={labelStyles}>{additionalInfoSection.fields.agreeToTerms.label}</FormLabel>
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
              style={{
                backgroundColor: colors.theme.primary,
                color: colors.theme.buttonText,
                opacity: isLoading ? 0.7 : 1,
              }}
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
