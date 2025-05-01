// components/application-status.tsx
"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, XCircle, AlertCircle, PartyPopper, Terminal, Code } from "lucide-react"
import { motion } from "framer-motion"
import colors from "@/lib/colors"
import { applicationStatus } from "@/lib/applicationData"
type ApplicationStatus = "not_started" | "in_progress" | "submitted" | "accepted" | "waitlisted" | "confirmed"

interface ApplicationStatusProps {
  status: ApplicationStatus
}

// Icon mapping for dynamic icon rendering
const IconMap = {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Terminal,
  Code,
  PartyPopper
}

// Type for theme colors to avoid indexing errors
type ThemeColorKey = keyof typeof colors.theme;

export default function ApplicationStatus({ status }: ApplicationStatusProps) {
  const [animate, setAnimate] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Animation effect when status changes
  useEffect(() => {
    setAnimate(true)
    const timer = setTimeout(() => setAnimate(false), 500)
    return () => clearTimeout(timer)
  }, [status])

  // Typing effect for accepted status
  useEffect(() => {
    if (status === "accepted") {
      const text = applicationStatus.statusDetails.accepted.successMessage
      setIsTyping(true)
      
      let i = 0
      const typeInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText(text.substring(0, i + 1))
          i++
        } else {
          clearInterval(typeInterval)
          setIsTyping(false)
        }
      }, 50)
      
      return () => clearInterval(typeInterval)
    }
  }, [status])

  const getStatusDetails = () => {
    const statusDetail = applicationStatus.statusDetails[status] || 
                        applicationStatus.statusDetails.not_started
    
    // Get the icon component based on the icon name in the JSON
    const IconComponent = IconMap[statusDetail.icon as keyof typeof IconMap]
    const colorKey = statusDetail.color as ThemeColorKey;
    
    return {
      title: statusDetail.title,
      description: statusDetail.description,
      icon: <IconComponent className="h-8 w-8" style={{ color: colors.theme[colorKey] }} />,
      color: `${colors.theme[colorKey]}33`,
      borderColor: colors.theme[colorKey],
      textColor: colors.theme[colorKey],
      message: statusDetail.message,
    }
  }

  const statusDetails = getStatusDetails()

  return (
    <motion.div 
      className="space-y-8" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 
            className="text-xl font-medium" 
            style={{ color: colors.theme.foreground }}
          >
            Application Status:
          </h3>
          
          <motion.div
            animate={
              animate
                ? {
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(0, 0, 0, 0.4)",
                      "0 0 0 10px rgba(0, 0, 0, 0)",
                      "0 0 0 0 rgba(0, 0, 0, 0)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            <Badge
              className="px-4 py-1.5 text-sm font-medium"
              style={{
                backgroundColor: statusDetails.color,
                color: statusDetails.textColor,
                borderColor: statusDetails.borderColor,
                borderWidth: "1px",
              }}
            >
              {statusDetails.title}
            </Badge>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card
          className="overflow-hidden relative shadow-lg"
          style={{
            backgroundColor: colors.theme.cardBackground,
            borderColor: statusDetails.borderColor,
            borderWidth: "1px",
          }}
        >
          <CardHeader
            className="flex flex-row items-center gap-5 border-b pb-5"
            style={{ borderColor: colors.theme.cardBorder }}
          >
            <motion.div
              animate={animate ? { rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {statusDetails.icon}
            </motion.div>
            
            <div className="space-y-1">
              <CardTitle style={{ color: statusDetails.textColor }}>
                {statusDetails.title}
              </CardTitle>
              
              <CardDescription style={{ color: colors.theme.secondary }}>
                {statusDetails.description}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <p 
              className="text-base leading-relaxed" 
              style={{ color: colors.theme.foreground }}
            >
              {statusDetails.message}
            </p>

            {status === "accepted" && (
              <motion.div
                className="mt-8 p-6 border rounded-lg relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  backgroundColor: `${colors.theme.secondary}15`,
                  borderColor: colors.theme.secondary,
                }}
              >
                <div className="relative z-10">
                  <h4 
                    className="font-semibold mb-4 flex items-center text-lg" 
                    style={{ color: colors.theme.accent }}
                  >
                    <span className="mr-3">
                      <PartyPopper className="h-6 w-6" />
                    </span>
                    Congratulations!
                  </h4>
                  
                  <div 
                    className="font-mono text-base mb-4" 
                    style={{ color: colors.theme.accent }}
                  >
                    {typedText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </div>
                  
                  <motion.div
                    className="w-full h-1.5 mt-6 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    style={{
                      background: `linear-gradient(to right, ${colors.theme.accent}, ${colors.theme.secondary})`,
                    }}
                  />
                </div>
              </motion.div>
            )}

            {status === "confirmed" && (
              <motion.div
                className="mt-8 border rounded-lg p-6 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  backgroundColor: `${colors.theme.success}15`,
                  borderColor: colors.theme.success,
                }}
              >
                <div className="relative z-10">
                  <h4 
                    className="font-semibold mb-4 text-center text-lg" 
                    style={{ color: colors.theme.success }}
                  >
                    Your QR Code
                  </h4>
                  
                  <div
                    className="w-56 h-56 flex items-center justify-center p-3 mx-auto"
                    style={{
                      backgroundColor: colors.theme.background,
                      borderColor: colors.theme.success,
                      borderWidth: "1px",
                      boxShadow: `0 0 12px ${colors.theme.accent}`,

                    }}
                  >
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: colors.theme.cardBackground }}
                    >
                      <p 
                        className="text-sm text-center" 
                        style={{ color: colors.theme.placeholderText }}
                      >
                        QR code will appear here
                      </p>
                    </div>
                  </div>
                  
                  <p 
                    className="mt-4 text-sm text-center" 
                    style={{ color: colors.theme.placeholderText }}
                  >
                    Present this QR code when you arrive at the event
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {(status === "submitted" || status === "in_progress") && (
        <motion.div
          className="rounded-lg border p-6 relative overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            backgroundColor: colors.theme.cardBackground,
            borderColor: colors.theme.cardBorder,
          }}
        >
          <div className="relative z-10">
            <h4 
              className="font-medium mb-4 text-lg" 
              style={{ color: colors.theme.primary }}
            >
              What happens next?
            </h4>
            
            <ol 
              className="list-decimal list-inside space-y-4 text-base leading-relaxed" 
              style={{ color: colors.theme.foreground }}
            >
              {applicationStatus.hackathonInfo.nextSteps.map((step: string, index: number) => (
                <motion.li
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                >
                  {step}
                </motion.li>
              ))}
            </ol>
          </div>
        </motion.div>
      )}

      <motion.div
        className="rounded-lg border p-6 relative overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{
          backgroundColor: colors.theme.cardBackground,
          borderColor: colors.theme.cardBorder,
        }}
      >
        {/* //Info about the hackathon */}
        <div className="relative z-10">
          <h4 
            className="font-medium mb-4 text-lg" 
            style={{ color: colors.theme.primary }}
          >
            About DAHacks 3.5
          </h4>
          
          <div className="space-y-6 text-base">
            {applicationStatus.hackathonInfo.sections.map((section: any, index: number) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                className="space-y-2"
              >
                <h5 
                  className="font-medium" 
                  style={{ color: colors.theme.foreground }}
                >
                  {section.title}
                </h5>
                
                <p 
                  className="leading-relaxed" 
                  style={{ color: colors.theme.placeholderText }}
                >
                  {section.title === "Questions?" ? (
                    <>
                      {section.content.split(":")[0]}:{" "}
                      <a
                        href="mailto:inky@deanzahacks.com"
                        style={{
                          color: colors.theme.linkText,
                          textDecoration: "underline",
                        }}
                      >
                        inky@deanzahacks.com
                      </a>
                    </>
                  ) : (
                    section.content
                  )}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
