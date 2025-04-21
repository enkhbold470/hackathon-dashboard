"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, XCircle, AlertCircle, PartyPopper, Terminal, Code } from "lucide-react"
import { motion } from "framer-motion"
import colors from "@/lib/colors.json"

type ApplicationStatus = "not_started" | "in_progress" | "submitted" | "accepted" | "rejected" | "confirmed"

interface ApplicationStatusProps {
  status: ApplicationStatus
}

export default function ApplicationStatus({ status }: ApplicationStatusProps) {
  const [animate, setAnimate] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    // Trigger animation when status changes
    setAnimate(true)
    const timer = setTimeout(() => setAnimate(false), 1000)
    return () => clearTimeout(timer)
  }, [status])

  useEffect(() => {
    if (status === "accepted") {
      const text = "ACCESS GRANTED: Welcome to DAHacks 3.5! Your application has been approved."
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
    switch (status) {
      case "not_started":
        return {
          title: "Not Started",
          description: "You haven't started your application yet.",
          icon: <AlertCircle className="h-8 w-8" style={{ color: colors.palette.yellow }} />,
          color: `${colors.palette.yellow}33`,
          borderColor: colors.palette.yellow,
          textColor: colors.palette.yellow,
          message: "Please go to the Application tab to begin your application.",
        }
      case "in_progress":
        return {
          title: "In Progress",
          description: "Your application is being saved as you type.",
          icon: <Clock className="h-8 w-8" style={{ color: colors.palette.blue }} />,
          color: `${colors.palette.blue}33`,
          borderColor: colors.palette.blue,
          textColor: colors.palette.blue,
          message: "Your progress is automatically saved. You can return to complete it anytime.",
        }
      case "submitted":
        return {
          title: "Submitted",
          description: "Your application has been submitted successfully.",
          icon: <CheckCircle className="h-8 w-8" style={{ color: colors.palette.teal }} />,
          color: `${colors.palette.teal}33`,
          borderColor: colors.palette.teal,
          textColor: colors.palette.teal,
          message: "Thank you for submitting your application! We're reviewing it and will get back to you soon.",
        }
      case "accepted":
        return {
          title: "Accepted",
          description: "Congratulations! Your application has been accepted.",
          icon: <Terminal className="h-8 w-8" style={{ color: colors.palette.mauve }} />,
          color: `${colors.palette.mauve}33`,
          borderColor: colors.palette.mauve,
          textColor: colors.palette.mauve,
          message:
            "We're excited to have you join us! Please check your email for further instructions on how to confirm your spot.",
        }
      case "rejected":
        return {
          title: "Not Accepted",
          description: "We regret to inform you that your application was not accepted.",
          icon: <XCircle className="h-8 w-8" style={{ color: colors.palette.red }} />,
          color: `${colors.palette.red}33`,
          borderColor: colors.palette.red,
          textColor: colors.palette.red,
          message: "Thank you for your interest. We encourage you to apply for our future events.",
        }
      case "confirmed":
        return {
          title: "Confirmed",
          description: "You've confirmed your attendance.",
          icon: <Code className="h-8 w-8" style={{ color: colors.palette.green }} />,
          color: `${colors.palette.green}33`,
          borderColor: colors.palette.green,
          textColor: colors.palette.green,
          message:
            "We're looking forward to seeing you at the event! Your QR code will appear here once it's generated.",
        }
      default:
        return {
          title: "Unknown",
          description: "Status unknown",
          icon: <AlertCircle className="h-8 w-8" style={{ color: colors.palette.yellow }} />,
          color: `${colors.palette.yellow}33`,
          borderColor: colors.palette.yellow,
          textColor: colors.palette.yellow,
          message: "Please contact support if you're seeing this message.",
        }
    }
  }

  const statusDetails = getStatusDetails()

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium" style={{ color: colors.theme.foreground }}>
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
              className="px-3 py-1"
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
          className="overflow-hidden relative shadow-md"
          style={{
            backgroundColor: colors.theme.cardBackground,
            borderColor: statusDetails.borderColor,
            borderWidth: "1px",
          }}
        >
          <CardHeader
            className="flex flex-row items-center gap-4 border-b pb-4"
            style={{ borderColor: colors.theme.cardBorder }}
          >
            <motion.div
              animate={animate ? { rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {statusDetails.icon}
            </motion.div>
            <div>
              <CardTitle style={{ color: statusDetails.textColor }}>{statusDetails.title}</CardTitle>
              <CardDescription style={{ color: colors.palette.subtext0 }}>{statusDetails.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <p style={{ color: colors.theme.foreground }}>{statusDetails.message}</p>

            {status === "accepted" && (
              <motion.div
                className="mt-6 p-4 border rounded-lg relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  backgroundColor: `${colors.palette.mauve}15`,
                  borderColor: colors.palette.mauve,
                }}
              >
                <div className="relative z-10">
                  <h4 className="font-semibold mb-2 flex items-center" style={{ color: colors.palette.mauve }}>
                    <span className="mr-2">
                      <PartyPopper className="h-5 w-5" />
                    </span>
                    Congratulations!
                  </h4>
                  <div className="font-mono" style={{ color: colors.palette.mauve }}>
                    {typedText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </div>
                  <motion.div
                    className="w-full h-1 mt-4 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    style={{
                      background: `linear-gradient(to right, ${colors.palette.mauve}, ${colors.palette.lavender})`,
                    }}
                  />
                </div>
              </motion.div>
            )}

            {status === "confirmed" && (
              <motion.div
                className="mt-6 border rounded-lg p-4 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  backgroundColor: `${colors.palette.green}15`,
                  borderColor: colors.palette.green,
                }}
              >
                <div className="relative z-10">
                  <h4 className="font-semibold mb-2 text-center" style={{ color: colors.palette.green }}>
                    Your QR Code
                  </h4>
                  <div
                    className="w-48 h-48 flex items-center justify-center p-2 mx-auto"
                    style={{
                      backgroundColor: colors.theme.background,
                      borderColor: colors.palette.green,
                      borderWidth: "1px",
                      boxShadow: `0 0 10px ${colors.palette.green}50`,
                    }}
                  >
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: colors.theme.cardBackground }}
                    >
                      <p className="text-sm text-center" style={{ color: colors.palette.subtext0 }}>
                        QR code will appear here
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-center" style={{ color: colors.palette.subtext0 }}>
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
          className="rounded-lg border p-4 relative overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            backgroundColor: colors.theme.cardBackground,
            borderColor: colors.theme.cardBorder,
          }}
        >
          <div className="relative z-10">
            <h4 className="font-medium mb-2" style={{ color: colors.theme.primary }}>
              What happens next?
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm" style={{ color: colors.theme.foreground }}>
              <motion.li
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                Our team will review your application
              </motion.li>
              <motion.li
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                You'll receive an email with our decision
              </motion.li>
              <motion.li
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                If accepted, you'll need to confirm your attendance
              </motion.li>
              <motion.li
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                After confirmation, you'll receive a QR code for check-in
              </motion.li>
            </ol>
          </div>
        </motion.div>
      )}

      <motion.div
        className="rounded-lg border p-4 relative overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{
          backgroundColor: colors.theme.cardBackground,
          borderColor: colors.theme.cardBorder,
        }}
      >
        <div className="relative z-10">
          <h4 className="font-medium mb-2" style={{ color: colors.theme.primary }}>
            About DAHacks 3.5
          </h4>
          <div className="space-y-3 text-sm">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <h5 className="font-medium" style={{ color: colors.theme.foreground }}>
                What is a hackathon?
              </h5>
              <p style={{ color: colors.palette.subtext0 }}>
                A hackathon is like a creative marathon for tech enthusiasts! DAHacks is great for first timers or
                returners looking to experience inspiring guest speakers, helpful workshops, tons of skilled mentors,
                and, of course, fun games and cool swag.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}>
              <h5 className="font-medium" style={{ color: colors.theme.foreground }}>
                When and where is DAHacks?
              </h5>
              <p style={{ color: colors.palette.subtext0 }}>
                DAHacks is from Friday, May 31st from 10:30 AM - 9 PM to Saturday, June 1st from 9 AM - 6 PM at De Anza
                College in the Science Center Building SC1102. This is not an overnight event.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.8 }}>
              <h5 className="font-medium" style={{ color: colors.theme.foreground }}>
                Questions?
              </h5>
              <p style={{ color: colors.palette.subtext0 }}>
                Email us at:{" "}
                <a
                  href="mailto:dahacks@enk.icu"
                  style={{
                    color: colors.theme.linkText,
                    textDecoration: "underline",
                  }}
                >
                  dahacks@enk.icu
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
