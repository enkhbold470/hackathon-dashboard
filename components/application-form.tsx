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

const formSchema = z.object({
  legalName: z.string().min(2, {
    message: "Legal name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  university: z.string().min(2, {
    message: "University name must be at least 2 characters.",
  }),
  major: z.string().min(2, {
    message: "Major must be at least 2 characters.",
  }),
  graduationYear: z.string().min(4, {
    message: "Please enter a valid graduation year.",
  }),
  experience: z.string({
    required_error: "Please select your experience level.",
  }),
  whyAttend: z.string().min(10, {
    message: "Please tell us why you want to attend in at least 10 characters.",
  }),
  projectExperience: z.string().min(10, {
    message: "Please share your project experience in at least 10 characters.",
  }),
  futurePlans: z.string().min(10, {
    message: "Please share your future plans in at least 10 characters.",
  }),
  funFact: z.string().min(5, {
    message: "Please share a fun fact in at least 5 characters.",
  }),
  selfDescription: z.string({
    required_error: "Please select how you would describe yourself.",
  }),
  additionalInfo: z.string().optional(),
  links: z.string().optional(),
  teammates: z.string().optional(),
  referralEmail: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
})

type FormData = z.infer<typeof formSchema>

interface ApplicationFormProps {
  onChange: (data: FormData) => void
  onSubmit: () => void
  formData: Record<string, any>
  isSubmitted: boolean
}

export default function ApplicationForm({ onChange, onSubmit, formData, isSubmitted }: ApplicationFormProps) {
  const { toast } = useToast()
  const [savingFields, setSavingFields] = useState<Record<string, boolean>>({})
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({})

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      legalName: "",
      email: "",
      university: "",
      major: "",
      graduationYear: "",
      experience: "",
      whyAttend: "",
      projectExperience: "",
      futurePlans: "",
      funFact: "",
      selfDescription: "",
      additionalInfo: "",
      links: "",
      teammates: "",
      referralEmail: "",
      dietaryRestrictions: "",
      agreeToTerms: false,
      ...formData,
    },
  })

  // Initialize form with existing data
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      form.reset(formData)
    }
  }, [])

  // Debounced save function for real-time saving
  const debouncedSave = debounce((data: FormData, field: string) => {
    onChange(data)
    setSavingFields((prev) => ({ ...prev, [field]: false }))
    setSavedFields((prev) => ({ ...prev, [field]: true }))

    // Reset saved indicator after 2 seconds
    setTimeout(() => {
      setSavedFields((prev) => ({ ...prev, [field]: false }))
    }, 2000)

    toast({
      title: "Progress saved",
      description: "Your application is being saved automatically.",
      duration: 2000,
    })
  }, 1000)

  // Watch for form changes and save in real-time
  useEffect(() => {
    const subscription = form.watch((data, { name }) => {
      if (name) {
        setSavingFields((prev) => ({ ...prev, [name]: true }))
        debouncedSave(data as FormData, name)
      }
    })

    return () => subscription.unsubscribe()
  }, [form.watch])

  const handleSubmit = (data: FormData) => {
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
    color: colors.palette.subtext0,
  }

  const errorMessageStyles = {
    color: colors.theme.danger,
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold" style={sectionTitleStyles}>
            Personal Information
          </h2>
          <p className="text-sm" style={sectionDescriptionStyles}>
            Tell us about yourself
          </p>
        </div>

        <FormField
          control={form.control}
          name="legalName"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>Legal Name (as shown on ID)</FormLabel>
                {renderSavingIndicator("legalName")}
              </div>
              <FormControl>
                <Input
                  placeholder="John Doe"
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
                <FormLabel style={labelStyles}>Email</FormLabel>
                {renderSavingIndicator("email")}
              </div>
              <FormControl>
                <Input
                  placeholder="john.doe@example.com"
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
                  <FormLabel style={labelStyles}>University</FormLabel>
                  {renderSavingIndicator("university")}
                </div>
                <FormControl>
                  <Input
                    placeholder="De Anza College"
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
                  <FormLabel style={labelStyles}>Major</FormLabel>
                  {renderSavingIndicator("major")}
                </div>
                <FormControl>
                  <Input
                    placeholder="Computer Science"
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
                  <FormLabel style={labelStyles}>Graduation Year</FormLabel>
                  {renderSavingIndicator("graduationYear")}
                </div>
                <FormControl>
                  <Input
                    placeholder="2025"
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
                  <FormLabel style={labelStyles}>Coding Experience</FormLabel>
                  {renderSavingIndicator("experience")}
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitted}>
                  <FormControl>
                    <SelectTrigger style={inputStyles}>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent style={{ backgroundColor: colors.theme.background, borderColor: colors.theme.border }}>
                    <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage style={errorMessageStyles} />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2 pt-4">
          <h2 className="text-xl font-semibold" style={sectionTitleStyles}>
            About You
          </h2>
          <p className="text-sm" style={sectionDescriptionStyles}>
            Help us get to know you better
          </p>
        </div>

        <FormField
          control={form.control}
          name="whyAttend"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>Why do you want to come to DA Hacks 3.5?*</FormLabel>
                {renderSavingIndicator("whyAttend")}
              </div>
              <FormControl>
                <Textarea
                  placeholder="Tell us why you're interested in attending our hackathon..."
                  className="min-h-[100px] placeholder:text-opacity-50"
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
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
                <FormLabel style={labelStyles}>
                  Tell us about a project you've enjoyed working on, technical or non-technical.*
                </FormLabel>
                {renderSavingIndicator("projectExperience")}
              </div>
              <FormControl>
                <Textarea
                  placeholder="Share your experience with a project you've worked on..."
                  className="min-h-[100px] placeholder:text-opacity-50"
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
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
                <FormLabel style={labelStyles}>
                  What's something you're excited to work on in the next 10 years? Dream big!*
                </FormLabel>
                {renderSavingIndicator("futurePlans")}
              </div>
              <FormControl>
                <Textarea
                  placeholder="Share your future aspirations and dreams..."
                  className="min-h-[100px] placeholder:text-opacity-50"
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
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
                <FormLabel style={labelStyles}>Tell us a fun fact about you :)*</FormLabel>
                {renderSavingIndicator("funFact")}
              </div>
              <FormControl>
                <Textarea
                  placeholder="Share something interesting about yourself..."
                  className="min-h-[80px] placeholder:text-opacity-50"
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
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
                <FormLabel style={labelStyles}>I would describe myself as a…</FormLabel>
                {renderSavingIndicator("selfDescription")}
              </div>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                  disabled={isSubmitted}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="designer" id="designer" style={{ borderColor: colors.theme.primary }} />
                    <Label htmlFor="designer" style={labelStyles}>
                      Designer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="developer" id="developer" style={{ borderColor: colors.theme.primary }} />
                    <Label htmlFor="developer" style={labelStyles}>
                      Developer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" style={{ borderColor: colors.theme.primary }} />
                    <Label htmlFor="both" style={labelStyles}>
                      Both
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="neither" id="neither" style={{ borderColor: colors.theme.primary }} />
                    <Label htmlFor="neither" style={labelStyles}>
                      Neither
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>
                  Is there anything else that we should know about you? (optional!)
                </FormLabel>
                {renderSavingIndicator("additionalInfo")}
              </div>
              <FormControl>
                <Textarea
                  placeholder="Share any additional information you'd like us to know..."
                  className="min-h-[80px] placeholder:text-opacity-50"
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
                />
              </FormControl>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="links"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel style={labelStyles}>
                  Optionally, add any links (separated by commas) that you'd like us to check out! GitHub, LinkedIn,
                  Devpost, Portfolio, Awards, Dribbble, etc.
                </FormLabel>
                {renderSavingIndicator("links")}
              </div>
              <FormControl>
                <Textarea
                  placeholder="github.com/yourusername, linkedin.com/in/yourprofile, ..."
                  className="min-h-[80px] placeholder:text-opacity-50"
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
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
                <FormLabel style={labelStyles}>
                  If you plan on participating as a team, your decision for this can change at any time and is
                  non-binding, please enter the emails of your teammates, separated by a single comma. ALL TEAM MEMBERS
                  MUST SUBMIT APPLICATIONS.
                </FormLabel>
                {renderSavingIndicator("teammates")}
              </div>
              <FormControl>
                <Textarea
                  placeholder="teammate1@example.com, teammate2@example.com, ..."
                  className="min-h-[80px] placeholder:text-opacity-50"
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
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
                <FormLabel style={labelStyles}>
                  If you have a referral email address from someone who has already applied to DAHacks 3.5, please enter
                  it below. You may only enter one. This is part of a raffle that will occur during the hackathon, where
                  the winner gets an APPLE WATCH!
                </FormLabel>
                {renderSavingIndicator("referralEmail")}
              </div>
              <FormControl>
                <Input
                  placeholder="referrer@example.com"
                  className="placeholder:text-opacity-50"
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
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
                <FormLabel style={labelStyles}>Dietary Restrictions</FormLabel>
                {renderSavingIndicator("dietaryRestrictions")}
              </div>
              <FormControl>
                <Textarea
                  placeholder="Please list any dietary restrictions or allergies..."
                  className="min-h-[80px] placeholder:text-opacity-50"
                  {...field}
                  disabled={isSubmitted}
                  style={inputStyles}
                />
              </FormControl>
              <FormDescription style={sectionDescriptionStyles}>
                This helps us plan meals during the event. Leave blank if none.
              </FormDescription>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem
              className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4"
              style={{
                backgroundColor: colors.theme.inputBackground,
                borderColor: colors.theme.inputBorder,
              }}
            >
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitted}
                  style={{
                    borderColor: colors.theme.primary,
                    backgroundColor: field.value ? colors.theme.primary : "transparent",
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel style={labelStyles}>I agree to the terms and conditions</FormLabel>
                <FormDescription style={sectionDescriptionStyles}>
                  By checking this box, you agree to our{" "}
                  <a href="#" style={{ color: colors.theme.linkText, textDecoration: "underline" }}>
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" style={{ color: colors.theme.linkText, textDecoration: "underline" }}>
                    Privacy Policy
                  </a>
                  .
                </FormDescription>
              </div>
              <FormMessage style={errorMessageStyles} />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between pt-4">
          {Object.values(savingFields).some(Boolean) && !isSubmitted && (
            <div className="flex items-center text-sm" style={{ color: colors.palette.subtext0 }}>
              <div className="mr-2 inline-flex items-center justify-center w-4 h-4 relative">
                <div
                  className="absolute w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: `${colors.theme.primary} transparent transparent transparent` }}
                ></div>
              </div>
              <span>Saving...</span>
            </div>
          )}
          {!Object.values(savingFields).some(Boolean) && !isSubmitted && (
            <div className="flex items-center text-sm" style={{ color: colors.palette.subtext0 }}>
              <Save className="h-4 w-4 mr-2" style={{ color: colors.theme.success }} />
              <span>All changes saved</span>
            </div>
          )}
          <Button
            type="submit"
            disabled={isSubmitted}
            className="transition-all duration-300 font-medium relative overflow-hidden"
            style={{
              backgroundColor: colors.theme.primary,
              color: colors.theme.buttonText,
            }}
          >
            {isSubmitted ? "Application Submitted" : "Submit Application"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
