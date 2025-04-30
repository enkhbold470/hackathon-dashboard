export const applicationData = {
  personalInfo: {
    title: "Personal Information",
    description: "Tell us about yourself",
    fields: {
      cwid: {
        label: "Campus Wide ID (CWID)",
        type: "text",
        placeholder: "Enter your CWID",
        validationRules: {
          required: true,
          minLength: 5,
          message: "Please enter a valid CWID."
        }
      },
      fullName: {
        label: "Full Name / Preferred Name",
        type: "text",
        placeholder: "Enter your full or preferred name",
        validationRules: {
          required: true,
          minLength: 2,
          message: "Name must be at least 2 characters."
        }
      },
      discord: {
        label: "Discord Username",
        type: "text",
        placeholder: "yourdiscord#1234",
        validationRules: {
          required: true,
          minLength: 3,
          message: "Please enter a valid Discord username."
        }
      },
      skillLevel: {
        label: "Skill Level",
        type: "select",
        options: [
          { value: "beginner", label: "Beginner" },
          { value: "intermediate", label: "Intermediate" },
          { value: "advanced", label: "Advanced" },
          { value: "expert", label: "Expert" }
        ],
        placeholder: "Select your skill level",
        validationRules: {
          required: true,
          message: "Please select your skill level."
        }
      },
      hackathonExperience: {
        label: "How many hackathons have you attended?",
        type: "select",
        options: [
          { value: "0", label: "None (First time!)" },
          { value: "1-2", label: "1-2" },
          { value: "3-5", label: "3-5" },
          { value: "5+", label: "5+" }
        ],
        placeholder: "Select number of hackathons attended",
        validationRules: {
          required: true,
          message: "Please select your hackathon experience."
        }
      },
      dietaryRestrictions: {
        label: "Dietary Restrictions",
        type: "textarea",
        placeholder: "Let us know about any dietary needs...",
        validationRules: {
          required: false
        }
      },
      hearAboutUs: {
        label: "How did you hear about us?",
        type: "select",
        options: [
          { value: "friend", label: "Friend" },
          { value: "discord", label: "Discord" },
          { value: "instagram", label: "Instagram" },
          { value: "flyer", label: "Flyer on Campus" },
          { value: "professor", label: "Professor/Class" },
          { value: "other", label: "Other" }
        ],
        placeholder: "Select one",
        validationRules: {
          required: true,
          message: "Please select how you heard about us."
        }
      }
    }
  },
  aboutYou: {
    title: "About You",
    description: "Help us get to know you better",
    fields: {
      whyAttend: {
        label: "Why do you want to come to DA Hacks 3.5?",
        type: "textarea",
        placeholder: "Tell us why you're interested in attending our hackathon...",
        validationRules: {
          required: true,
          minLength: 10,
          message: "Please tell us why you want to attend in at least 10 characters."
        }
      },
      projectExperience: {
        label: "Tell us about a project you've enjoyed working on, technical or non-technical.",
        type: "textarea",
        placeholder: "Share your experience with a project you've worked on...",
        validationRules: {
          required: true,
          minLength: 10,
          message: "Please share your project experience in at least 10 characters."
        }
      },
      futurePlans: {
        label: "What are your future plans in next 10 years in tech or other fields? Dream big :)",
        type: "textarea",
        placeholder: "Tell us about your aspirations and goals...",
        validationRules: {
          required: true,
          minLength: 10,
          message: "Please share your future plans in at least 10 characters."
        }
      },
      funFact: {
        label: "Share a fun fact about yourself :)",
        type: "textarea",
        placeholder: "Something interesting about you...",
        validationRules: {
          required: true,
          minLength: 5,
          message: "Please share a fun fact in at least 5 characters."
        }
      },
      selfDescription: {
        label: "How would you describe yourself?",
        type: "radio",
        options: [
          { value: "creative", label: "Creative problem solver" },
          { value: "technical", label: "Technical specialist" },
          { value: "leader", label: "Team leader" },
          { value: "balanced", label: "Jack of all trades" }
        ],
        validationRules: {
          required: true,
          message: "Please select how you would describe yourself."
        }
      }
    }
  },
  additionalInfo: {
    title: "Additional Information",
    description: "Optional details that help us better accommodate you",
    fields: {
      links: {
        label: "Portfolio/GitHub/LinkedIn Links",
        type: "textarea",
        placeholder: "Share your relevant links...",
        validationRules: {
          required: false
        }
      },
      teammates: {
        label: "Do you already have teammates? List their emails (optional)",
        type: "textarea",
        placeholder: "List email addresses of potential teammates...",
        validationRules: {
          required: false
        }
      },
      referralEmail: {
        label: "If someone referred you, what's their email? (optional)",
        type: "text",
        placeholder: "Email of person who referred you",
        validationRules: {
          required: false
        }
      },
      dietaryRestrictionsExtra: {
        label: "Any additional dietary restrictions? (optional)",
        type: "textarea",
        placeholder: "Let us know about any dietary needs...",
        validationRules: {
          required: false
        }
      },
      agreeToTerms: {
        label: "I agree to the Code of Conduct and Event Terms",
        type: "checkbox",
        validationRules: {
          required: true,
          value: true,
          message: "You must agree to the terms and conditions."
        }
      }
    }
  }
};

// Helper functions for field mapping between form and database
export const formToDbMapping = {
  // Personal info
  fullName: "full_name",
  skillLevel: "skill_level",
  hackathonExperience: "hackathon_experience",
  hearAboutUs: "hear_about_us",
  
  // About you
  whyAttend: "why_attend",
  projectExperience: "project_experience",
  futurePlans: "future_plans",
  funFact: "fun_fact",
  selfDescription: "self_description",
  
  // Additional info
  referralEmail: "referral_email",
  dietaryRestrictionsExtra: "dietary_restrictions_extra",
  agreeToTerms: "agree_to_terms"
};

// Convert camelCase form field to snake_case DB column
export const toDbColumn = (fieldName: string): string => {
  return formToDbMapping[fieldName as keyof typeof formToDbMapping] || fieldName;
};

// Convert snake_case DB column to camelCase form field
export const toFormField = (dbColumn: string): string => {
  const reversed: Record<string, string> = {};
  Object.entries(formToDbMapping).forEach(([form, db]) => {
    reversed[db] = form;
  });
  return reversed[dbColumn] || dbColumn;
};

export const applicationStatus = {
  statusDetails: {
    not_started: {
      title: "Not Started",
      description: "You haven't started your application yet.",
      icon: "AlertCircle",
      color: "warning",
      message: "Please go to the Application tab to begin your application."
    },
    in_progress: {
      title: "In Progress",
      description: "Your application is being saved as you type.",
      icon: "Clock",
      color: "primary",
      message: "Your progress is automatically saved. You can return to complete it anytime."
    },
    submitted: {
      title: "Submitted",
      description: "Your application has been submitted successfully.",
      icon: "CheckCircle",
      color: "success",
      message: "Thank you for submitting your application! We're reviewing it and will get back to you soon."
    },
    accepted: {
      title: "Accepted",
      description: "Congratulations! Your application has been accepted.",
      icon: "Terminal",
      color: "accent",
      message: "We're excited to have you join us! Please check your email for further instructions on how to confirm your spot.",
      successMessage: "ACCESS GRANTED: Welcome to DAHacks 3.5! Your application has been approved."
    },
    rejected: {
      title: "Not Accepted",
      description: "We regret to inform you that your application was not accepted.",
      icon: "XCircle",
      color: "danger",
      message: "Thank you for your interest. We encourage you to apply for our future events."
    },
    confirmed: {
      title: "Confirmed",
      description: "You've confirmed your attendance.",
      icon: "Code",
      color: "success",
      message: "We're looking forward to seeing you at the event! Your QR code will appear here once it's generated."
    }
  },
  hackathonInfo: {
    sections: [
      {
        title: "What is a hackathon?",
        content: "A hackathon is like a creative marathon for tech enthusiasts! DAHacks is great for first timers or returners looking to experience inspiring guest speakers, helpful workshops, tons of skilled mentors, and, of course, fun games and cool swag."
      },
      {
        title: "When and where is DAHacks?",
        content: "DAHacks is from Friday, May 31st from 10:30 AM - 9 PM to Saturday, June 1st from 9 AM - 6 PM at De Anza College in the Science Center Building SC1102. This is not an overnight event."
      },
      {
        title: "Questions?",
        content: "Email us at: dahacks@enk.icu"
      }
    ],
    nextSteps: [
      "Our team will review your application",
      "You'll receive an email with our decision",
      "If accepted, you'll need to confirm your attendance",
      "After confirmation, you'll receive a QR code for check-in"
    ]
  }
}
