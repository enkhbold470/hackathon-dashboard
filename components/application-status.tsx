// components/application-status.tsx
"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, XCircle, AlertCircle, PartyPopper, Terminal, Code, Smartphone } from "lucide-react"
import { motion } from "framer-motion"
import colors from "@/lib/colors"
import uiConfig from "@/lib/ui-config"
import { applicationStatusData } from "@/lib/applicationData"
import QRCode from "@/components/qr-code"
import { useUser } from "@clerk/nextjs"

type ApplicationStatus = "not_started" | "in_progress" | "submitted" | "accepted" | "waitlisted" | "confirmed"

interface ApplicationStatusProps {
  status: ApplicationStatus
  cwid?: string
}

// Icon mapping for dynamic icon rendering
const IconMap = {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Terminal,
  Code,
  PartyPopper,
  Smartphone
}

// Type for theme colors to avoid indexing errors
type ThemeColorKey = keyof typeof colors.theme;

export default function ApplicationStatus({ status, cwid }: ApplicationStatusProps) {
  const [animate, setAnimate] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hackerCWID, setHackerCWID] = useState<string | undefined>(cwid)
  const { user } = useUser()
  
  // Fetch CWID if not provided
  useEffect(() => {
    const fetchCWID = async () => {
      if (!hackerCWID && user?.id && ['accepted', 'confirmed'].includes(status)) {
        try {
          const response = await fetch(`/api/db/application?userId=${user.id}`);
          const data = await response.json();
          if (data?.application?.cwid) {
            setHackerCWID(data.application.cwid);
          }
        } catch (error) {
          console.error("Error fetching CWID:", error);
        }
      }
    };
    
    fetchCWID();
  }, [hackerCWID, user?.id, status]);

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
      {/* Hide status section when confirmed and has CWID */}
      {!(status === "confirmed" && hackerCWID) && (
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
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Hide status card when confirmed and has CWID */}
        {!(status === "confirmed" && hackerCWID) ? (
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

              {/* Accepted status content */}
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
                      Confirm Your Spot
                    </h4>
                    
                    <p 
                      className="mb-6" 
                      style={{ 
                        color: colors.theme.foreground,
                        fontSize: isMobile ? uiConfig.typography.fontSize.mobile.answerOption : uiConfig.typography.fontSize.answerOption,
                        lineHeight: uiConfig.typography.lineHeight.relaxed
                      }}
                    >
                      {isTyping ? (
                        <span className="animate-cursor">{typedText}</span>
                      ) : (
                        applicationStatusData.statusDetails.accepted.successMessage
                      )}
                    </p>
                    
                    <div className="flex gap-4 mt-2">
                      <button
                        className="px-4 py-2 rounded-md transition-colors"
                        onClick={onConfirmSpot}
                        style={{
                          backgroundColor: colors.theme.primary,
                          color: colors.theme.buttonText,
                          fontSize: isMobile ? uiConfig.typography.fontSize.mobile.buttonText : uiConfig.typography.fontSize.buttonText,
                          fontWeight: uiConfig.typography.fontWeight.medium,
                          padding: isMobile ? uiConfig.spacing.mobile.buttonPadding : uiConfig.spacing.buttonPadding,
                          borderRadius: uiConfig.borderRadius.md,
                        }}
                      >
                        Confirm Attendance
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* QR Code for confirmed status - always shows */}
        {status === "confirmed" && hackerCWID && (
          <motion.div
            className="mt-8 p-6 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              backgroundColor: `${colors.theme.success}15`,
              borderRadius: uiConfig.borderRadius.md,
              border: `1px solid ${colors.theme.success}`,
              boxShadow: `0 10px 15px -3px ${colors.theme.success}20`,
              marginTop: status === "confirmed" && hackerCWID ? 0 : undefined
            }}
          >
            <div className="relative z-10 flex flex-col items-center">
              <h4 
                className="font-semibold mb-4 flex items-center text-lg" 
                style={{ 
                  color: colors.theme.success,
                  fontSize: isMobile ? uiConfig.typography.fontSize.mobile.questionTitle : uiConfig.typography.fontSize.questionTitle,
                  fontWeight: uiConfig.typography.fontWeight.semibold
                }}
              >
                <span className="mr-3">
                  <CheckCircle className="h-6 w-6" />
                </span>
                Your Attendance is Confirmed!
              </h4>
              
              <p className="text-center mb-6" style={{ 
                color: colors.theme.foreground,
                fontSize: isMobile ? uiConfig.typography.fontSize.mobile.helperText : uiConfig.typography.fontSize.helperText,
              }}>
                Please present this QR code during check-in at the event.
              </p>
              
              <QRCode 
                cwid={hackerCWID} 
                title="Your Check-in QR Code"
                description={"CWID: " + hackerCWID}
                size={isMobile ? 180 : 250}
              />
              <p className="text-center mb-6" style={{ 
                color: colors.theme.foreground,
                fontSize: isMobile ? uiConfig.typography.fontSize.mobile.helperText : uiConfig.typography.fontSize.helperText,
                lineHeight: uiConfig.typography.lineHeight.relaxed
              }}>
                Please take a screenshot of this QR code and present it during check-in at the event.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
