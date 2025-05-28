"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { linkToMatchAnza, discordInviteLink } from "@/lib/applicationData"
import { Users, MessageCircle, X, Menu } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Status = "not_started" | "in_progress" | "submitted" | "accepted" | "waitlisted" | "confirmed"

export default function Navigation() {
  const { user } = useUser()
  const [applicationStatus, setApplicationStatus] = useState<Status>("not_started")
  const [isLoading, setIsLoading] = useState(true)
  const [isNavOpen, setIsNavOpen] = useState(false)

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/db/get", { method: "GET" })
        const result = await response.json()

        if (result.success && result.application) {
          setApplicationStatus((result.application.status as Status) || "not_started")
        }
      } catch (error) {
        console.error("Error fetching application status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplicationStatus()
  }, [user?.id])

  // Only show navigation for accepted/confirmed users
  if (isLoading || !["accepted", "confirmed"].includes(applicationStatus)) {
    return null
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 border-b border-purple-200/30 dark:border-purple-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-3">
            <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              {/* <span className="text-lg">🎉</span>
              <span className="font-semibold">Congratulations! You're accepted.</span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="font-medium">Ready to find amazing teammates?</span> */}
            </div>
            
            <div className="ml-6 flex items-center space-x-4">
              <Link
                href={linkToMatchAnza}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <Users className="h-4 w-4" />
                <span className="font-medium">Find Teammates</span>
              </Link>
              
              <Link
                href={discordInviteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium">#find-a-team</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Navigation Bar */}
        <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border-b border-purple-200/30 dark:border-purple-800/30">
          <div className="px-4 py-3">
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="w-full flex items-center justify-between bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg p-3 border border-purple-300/30"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">🎉</span>
                <span className="font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                 Find Teammates
                </span>
              </div>
              <motion.div
                animate={{ rotate: isNavOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isNavOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 border-b border-purple-200/30 dark:border-purple-800/30 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                  Ready to build something amazing? Connect with fellow hackers!
                </p>
                
                <Link
                  href={linkToMatchAnza}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  onClick={() => setIsNavOpen(false)}
                >
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg p-4 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-md">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">Find Teammates</div>
                        <div className="text-sm opacity-90">Match with other hackers based on interests</div>
                      </div>
                    </div>
                  </div>
                </Link>
                
                <Link
                  href={discordInviteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  onClick={() => setIsNavOpen(false)}
                >
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg p-4 hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-md">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">#find-a-team Channel</div>
                        <div className="text-sm opacity-90">Join our Discord community</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
} 