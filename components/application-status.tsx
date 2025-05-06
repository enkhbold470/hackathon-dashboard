// components/application-status.tsx
"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, XCircle, AlertCircle, PartyPopper, Terminal, Code } from "lucide-react"
import { motion } from "framer-motion"
import colors from "@/lib/colors"
import uiConfig from "@/lib/ui-config"
import { applicationStatusData } from "@/lib/applicationData"
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

  // Animation effect when status changes
  useEffect(() => {
    setAnimate(true)
    const timer = setTimeout(() => setAnimate(false), 500)
    return () => clearTimeout(timer)
  }, [status])

  // Typing effect for accepted status
  useEffect(() => {
    if (status === "accepted") {
      const text = applicationStatusData.statusDetails.accepted.successMessage
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
    const statusDetail = applicationStatusData.statusDetails[status] || 
                        applicationStatusData.statusDetails.not_started
    
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

  // These functions should be passed via props in a real implementation
  const onConfirmSpot = () => window.dispatchEvent(new CustomEvent('confirmAttendance'))
  // const onDeclineSpot = () => window.dispatchEvent(new CustomEvent('declineAttendance'))

  return (
    <motion.div 
      className="space-y-8" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      style={{
        fontFamily: uiConfig.typography.fontFamily.base
      }}
    >
      <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'} mb-4`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} ${isMobile ? 'gap-2' : 'gap-3'} ${isMobile ? 'mb-3' : ''}`}>
          <h3 
            className="text-xl font-medium" 
            style={{ 
              color: colors.theme.foreground,
              fontSize: isMobile ? uiConfig.typography.fontSize.mobile.sectionTitle : uiConfig.typography.fontSize.sectionTitle,
              fontWeight: uiConfig.typography.fontWeight.medium,
              marginBottom: isMobile ? '0.5rem' : 0
            }}
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
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                padding: isMobile ? '0.375rem 0.75rem' : '0.375rem 1rem',
                borderRadius: uiConfig.borderRadius.md
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
            backgroundColor: colors.theme.background,
            borderColor: statusDetails.borderColor,
            borderWidth: "1px",
            borderRadius: uiConfig.borderRadius.lg,
            boxShadow: uiConfig.shadows.md,
          }}
        >
          <CardHeader
            className="flex flex-row items-center gap-5 border-b pb-5"
            style={{ 
              borderColor: colors.theme.background,
              padding: isMobile ? uiConfig.spacing.mobile.containerPadding : uiConfig.spacing.containerPadding 
            }}
          >
            <motion.div
              animate={animate ? { rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {statusDetails.icon}
            </motion.div>
            
            <div className="space-y-1">
              <CardTitle style={{ 
                color: statusDetails.textColor,
                fontSize: isMobile ? uiConfig.typography.fontSize.mobile.sectionTitle : uiConfig.typography.fontSize.sectionTitle,
                fontWeight: uiConfig.typography.fontWeight.bold
              }}>
                {statusDetails.title}
              </CardTitle>
              
              <CardDescription style={{ 
                color: colors.theme.secondary,
                fontSize: isMobile ? uiConfig.typography.fontSize.mobile.helperText : uiConfig.typography.fontSize.helperText,
                lineHeight: uiConfig.typography.lineHeight.relaxed
              }}>
                {statusDetails.description}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6" style={{ 
            padding: isMobile ? uiConfig.spacing.mobile.containerPadding : uiConfig.spacing.containerPadding 
          }}>
            <p 
              className="text-base leading-relaxed" 
              style={{ 
                color: colors.theme.foreground,
                fontSize: isMobile ? uiConfig.typography.fontSize.mobile.answerOption : uiConfig.typography.fontSize.answerOption,
                lineHeight: uiConfig.typography.lineHeight.relaxed
              }}
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
                  padding: isMobile ? uiConfig.spacing.mobile.sectionPadding : uiConfig.spacing.sectionPadding,
                  borderRadius: uiConfig.borderRadius.md,
                }}
              >
                <div className="relative z-10">
                  <h4 
                    className="font-semibold mb-4 flex items-center text-lg" 
                    style={{ 
                      color: colors.theme.primary,
                      fontSize: isMobile ? uiConfig.typography.fontSize.mobile.questionTitle : uiConfig.typography.fontSize.questionTitle,
                      fontWeight: uiConfig.typography.fontWeight.semibold
                    }}
                  >
                    <span className="mr-3">
                      <PartyPopper className="h-6 w-6" />
                    </span>
                    Congratulations!
                  </h4>
                  
                  <div 
                    className="font-mono text-base mb-6" 
                    style={{ 
                      color: colors.theme.primary,
                      fontSize: isMobile ? uiConfig.typography.fontSize.mobile.answerOption : uiConfig.typography.fontSize.answerOption,
                    }}
                  >
                    {typedText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </div>
                  
                  <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 mt-4`}>
                    <button
                      onClick={onConfirmSpot}
                      className="flex-1 py-2 px-4 rounded-md font-medium text-center"
                      style={{
                        backgroundColor: colors.theme.success,
                        color: colors.theme.buttonText,
                        fontSize: uiConfig.typography.fontSize.buttonText,
                        fontWeight: uiConfig.typography.fontWeight.medium,
                        borderRadius: uiConfig.borderRadius.md,
                        transition: uiConfig.transitions.default
                      }}
                    >
                      Confirm My Spot
                    </button>
                    {/* <button
                      onClick={onDeclineSpot}
                      className="flex-1 py-2 px-4 rounded-md font-medium text-center"
                      style={{
                        backgroundColor: colors.theme.danger,
                        color: colors.theme.buttonText,
                        fontSize: uiConfig.typography.fontSize.buttonText,
                        fontWeight: uiConfig.typography.fontWeight.medium,
                        borderRadius: uiConfig.borderRadius.md,
                        transition: uiConfig.transitions.default
                      }}
                    >
                      Decline My Spot
                    </button> */}
                  </div>
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
                  padding: isMobile ? uiConfig.spacing.mobile.sectionPadding : uiConfig.spacing.sectionPadding,
                  borderRadius: uiConfig.borderRadius.md,
                }}
              >
                <div className="relative z-10">
                  <h4 
                    className="font-semibold mb-4 text-center text-lg" 
                    style={{ 
                      color: colors.theme.success,
                      fontSize: isMobile ? uiConfig.typography.fontSize.mobile.questionTitle : uiConfig.typography.fontSize.questionTitle,
                      fontWeight: uiConfig.typography.fontWeight.semibold
                    }}
                  >
                    Your QR Code
                  </h4>
                  
                  <div
                    className={`${isMobile ? 'w-48 h-48' : 'w-56 h-56'} flex items-center justify-center p-3 mx-auto`}
                    style={{
                      backgroundColor: colors.theme.background,
                      borderColor: colors.theme.success,
                      borderWidth: "1px",
                      boxShadow: `0 0 12px ${colors.theme.primary}`,
                      borderRadius: uiConfig.borderRadius.sm,
                    }}
                  >
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: colors.theme.background }}
                    >
                      <p 
                        className="text-sm text-center" 
                        style={{ 
                          color: colors.theme.foreground,
                          fontSize: isMobile ? uiConfig.typography.fontSize.mobile.helperText : uiConfig.typography.fontSize.helperText,
                        }}
                      >
                        QR code will appear here
                      </p>
                    </div>
                  </div>
                  
                  <p 
                    className="mt-4 text-sm text-center" 
                    style={{ 
                      color: colors.theme.foreground,
                      fontSize: isMobile ? uiConfig.typography.fontSize.mobile.helperText : uiConfig.typography.fontSize.helperText,
                    }}
                  >
                    Present this QR code when you arrive at the event
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="rounded-lg border p-6 relative overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{
          backgroundColor: colors.theme.background,
          borderColor: colors.theme.background,
          padding: isMobile ? uiConfig.spacing.mobile.sectionPadding : uiConfig.spacing.sectionPadding,
          borderRadius: uiConfig.borderRadius.lg,
          boxShadow: uiConfig.shadows.sm,
        }}
      >
        {/* //Info about the hackathon */}
        {/* <div className="relative z-10">
          <h4 
            className="font-medium mb-4 text-lg" 
            style={{ 
              color: colors.theme.primary,
              fontSize: isMobile ? uiConfig.typography.fontSize.mobile.sectionTitle : uiConfig.typography.fontSize.sectionTitle,
              fontWeight: uiConfig.typography.fontWeight.medium,
            }}
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
                  style={{ 
                    color: colors.theme.foreground,
                    fontSize: isMobile ? uiConfig.typography.fontSize.mobile.questionTitle : uiConfig.typography.fontSize.questionTitle,
                    fontWeight: uiConfig.typography.fontWeight.medium,
                  }}
                >
                  {section.title}
                </h5>
                
                <p 
                  className="leading-relaxed" 
                  style={{ 
                    color: colors.theme.foreground,
                    fontSize: isMobile ? uiConfig.typography.fontSize.mobile.answerOption : uiConfig.typography.fontSize.answerOption,
                    lineHeight: uiConfig.typography.lineHeight.relaxed,
                  }}
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
        </div> */}
      </motion.div>
    </motion.div>
  )
}
