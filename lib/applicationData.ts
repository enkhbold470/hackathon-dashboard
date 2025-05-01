export const applicationData = {
  personalInfo: {
    title: "👤 Personal Information",
    description: "Tell us about yourself",
    fields: {
      cwid: {
        label: "🆔 Campus Wide ID (CWID)",
        type: "text",
        placeholder: "Enter your 8 digit CWID",
        validationRules: {
          required: true,
          minLength: 5,
          message: "Please enter a valid CWID."
        }
      },
      fullName: {
        label: "📛 Full Name (First and Last)",
        type: "text",
        placeholder: "It should match with your Student ID Card",
        validationRules: {
          required: true,
          minLength: 2,
          message: "Name must be at least 2 characters."
        }
      },
      discord: {
        label: "💬 Discord Username",
        type: "text",
        placeholder: "For example: inky3457",
        validationRules: {
          required: true,
          minLength: 3,
          message: "Please enter a valid Discord username."
        }
      },
      skillLevel: {
        label: "📈 Skill Level",
        type: "select",
        options: [
          { value: "beginner", label: "🟢 Beginner" },
          { value: "intermediate", label: "🟡 Intermediate" },
          { value: "advanced", label: "🟠 Advanced" },
          { value: "expert", label: "🔴 Expert" }
        ],
        placeholder: "Select your skill level",
        validationRules: {
          required: true,
          message: "Please select your skill level."
        }
      },
      hackathonExperience: {
        label: "🎉 How many hackathons have you attended?",
        type: "select",
        options: [
          { value: "0", label: "None (🎈 First time!)" },
          { value: "1-5", label: "1-5" },
          { value: "5-10", label: "5-10" },
          { value: "10+", label: "10+" }
        ],
        placeholder: "Select number of hackathons attended",
        validationRules: {
          required: true,
          message: "Please select your hackathon experience."
        }
      },
      hearAboutUs: {
        label: "📣 How did you hear about us?",
        type: "select",
        options: [
          { value: "friend", label: "👯 Friend" },
          { value: "discord", label: "💬 Discord" },
          { value: "instagram", label: "📸 Instagram" },
          { value: "flyer", label: "📄 Flyer on Campus" },
          { value: "professor", label: "🎓 Professor/Class" },
          { value: "other", label: "❓ Other" }
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
    title: "🧠 About You",
    description: "Help us get to know you better",
    fields: {
      whyAttend: {
        label: "🤔 Why do you want to come to DA Hacks 3.5?",
        type: "textarea",
        placeholder: "Tell us why you're interested in attending our hackathon...",
        validationRules: {
          required: true,
          minLength: 10,
          message: "Please tell us why you want to attend in at least 10 characters."
        }
      },
      projectExperience: {
        label: "📚 Tell us about a project you've enjoyed working on",
        type: "textarea",
        placeholder: "Share your experience with a project you've worked on...",
        validationRules: {
          required: true,
          minLength: 10,
          message: "Please share your project experience in at least 10 characters."
        }
      },
      futurePlans: {
        label: "🚀 What are your future plans for the next 10 years?",
        type: "textarea",
        placeholder: "Tell us about your aspirations and goals...",
        validationRules: {
          required: true,
          minLength: 10,
          message: "Please share your future plans in at least 10 characters."
        }
      },
      funFact: {
        label: "🎈 Share a fun fact about yourself",
        type: "textarea",
        placeholder: "Something interesting about you...",
        validationRules: {
          required: true,
          minLength: 5,
          message: "Please share a fun fact in at least 5 characters."
        }
      },
      selfDescription: {
        label: "💡 How would you describe yourself?",
        type: "radio",
        options: [
          { value: "creative", label: "🎨 Creative problem solver" },
          { value: "technical", label: "🧠 Technical specialist" },
          { value: "leader", label: "🧑‍💼 Team leader" },
          { value: "balanced", label: "⚖️ Jack of all trades" }
        ],
        validationRules: {
          required: true,
          message: "Please select how you would describe yourself."
        }
      }
    }
  },
  additionalInfo: {
    title: "🧾 Additional Information",
    description: "📌 Optional details that help us better accommodate you",
    fields: {
      links: {
        label: "🔗 Portfolio/GitHub/LinkedIn Links",
        type: "textarea",
        placeholder: "Share your relevant links...",
        validationRules: {
          required: false
        }
      },
      teammates: {
        label: "👥 Do you already have teammates? List their emails (optional)",
        type: "textarea",
        placeholder: "List email addresses of potential teammates...",
        validationRules: {
          required: false
        }
      },
      referralEmail: {
        label: "📧 If someone referred you, what's their email? (optional)",
        type: "text",
        placeholder: "Email of person who referred you",
        validationRules: {
          required: false
        }
      },
      dietaryRestrictionsExtra: {
        label: "📝 Any additional dietary restrictions? If none, leave N/A",
        type: "textarea",
        placeholder: "Let us know about any dietary needs...",
        validationRules: {
          required: true
        }
      },
      tshirtSize: {
        label: "👕 T-Shirt Size (optional)",
        type: "select",
        options: [
          { value: "S", label: "Small" },
          { value: "M", label: "Medium" },
          { value: "L", label: "Large" },
          { value: "XL", label: "X-Large" },
          { value: "XXL", label: "XX-Large" }
        ],
        placeholder: "Select your T-shirt size",
        validationRules: {
          required: true
        }
      },
      agreeToTerms: {
        label: "I agree to the ",
        type: "checkbox",
        validationRules: {
          required: true,
          value: true,
          message: "You must agree to the terms and conditions."
        }
      },
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
  cwid: "cwid",
  discord: "discord",
  
  // About you
  whyAttend: "why_attend",
  projectExperience: "project_experience",
  futurePlans: "future_plans",
  funFact: "fun_fact",
  selfDescription: "self_description",
  
  // Additional info
  referralEmail: "referral_email",
  dietaryRestrictionsExtra: "dietary_restrictions_extra",
  agreeToTerms: "agree_to_terms",
  tshirtSize: "tshirt_size"
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
// important to add the statuses 
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
    waitlisted: {
      title: "Waitlisted",
      description: "We were thrilled by your application, but unfortunately due to limit of capacity, you were waitlisted.",
      icon: "XCircle",
      color: "warning",
      message: "Thank you for your interest. We'll notify you if a spot opens up."
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
        title: "What is a hackathon? 💡👨‍💻🎨",
        content: "A hackathon is like a creative marathon for tech enthusiasts! 🧠⚡ DAHacks is great for first timers 👶 or returners 🔁 looking to experience inspiring guest speakers 🎤, helpful workshops 🛠️, tons of skilled mentors 🧑‍🏫, and, of course, fun games 🎲 and cool swag 🎁."
      },
      {
        title: "When and where is DAHacks? 📅📍",
        content: "DAHacks is from **Friday, May 30th (10:30 AM - 10 PM)** to **Saturday, May 31st (8 AM - 6 PM)** at De Anza College 🏫 in the **Science Center Building SC1102** 🧪 and Campus Center, Conference A & B 📚. This is not an overnight event 🌙🚫."
      },
      {
        title: "Questions? ❓",
        content: "Email us at: **inky@deanzahacks.com** ✉️"
      }
    
    ],
    nextSteps: [
      "🧐 Our team will review your application",
      "📬 You'll receive an email with our decision",
      "✅ If accepted, you'll need to confirm your attendance",
      "📲 After confirmation, you'll receive a QR code for check-in"
    ]
    
  }
}
