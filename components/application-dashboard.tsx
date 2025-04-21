"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ApplicationForm from "./application-form"
import ApplicationStatus from "./application-status"
import ConfettiExplosion from "react-confetti-explosion"
import colors from "@/lib/colors.json"
import useWindowSize from "@/hooks/useWindowSize"
import Confetti from 'react-confetti'

type Status = "not_started" | "in_progress" | "submitted" | "accepted" | "rejected" | "confirmed"

export default function ApplicationDashboard() {
  const [applicationStatus, setApplicationStatus] = useState<Status>("not_started")
  const [isExploding, setIsExploding] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState("application")
  const { width, height } = useWindowSize()


  const handleFormChange = (data: Record<string, any>) => {
    setFormData(data)
    if (applicationStatus === "not_started") {
      setApplicationStatus("in_progress")
    }
    // In a real app, you would save this data to a database
    console.log("Saving form data:", data)
  }

  const handleFormSubmit = async () => {
    // In a real app, you would submit this data to your API
    console.log("Submitting application:", formData)
    setApplicationStatus("submitted")
    setActiveTab("status")

    // Simulate acceptance after 3 seconds (for demo purposes)
    setTimeout(() => {
      setApplicationStatus("accepted")
      setIsExploding(true)
      setTimeout(() => setIsExploding, 30000)
    }, 3000)
  }

  const confettiColors = [
    colors.palette.base,
    colors.palette.foam,
    colors.palette.gold,
    colors.palette.iris,
    colors.palette.love,
    colors.palette.overlay,
    colors.palette.rose,
    colors.palette.subtle,
    colors.palette.surface,
    colors.palette.text,
  ]

  return (
    <div className="container max-w-5xl py-10 flex justify-center items-center w-full">
      <div className="relative w-full">
        {isExploding && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            
            {/* <ConfettiExplosion force={0.9} duration={5000} particleCount={300} width={1600} colors={confettiColors} /> */}
            <Confetti width={width} height={height}/>
          </div>
        )}

        <Card
          className="overflow-hidden relative shadow-lg"
          style={{
            backgroundColor: colors.theme.cardBackground,
            borderColor: colors.theme.cardBorder,
          }}
        >
          <CardHeader className="border-b" style={{ borderColor: colors.theme.cardBorder }}>
            <div className="flex items-center">
              <div
                className="mr-3 h-10 w-10 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(to bottom right, ${colors.palette.gold}, ${colors.palette.text})`,
                }}
              >
                <span className="font-bold text-xl" style={{ color: colors.theme.background }}>
                  DA
                </span>
              </div>
              <div>
                <CardTitle
                  className="text-2xl font-bold tracking-wider"
                  style={{
                    background: `linear-gradient(to right, ${colors.palette.love}, ${colors.palette.gold})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  DAHacks 3.5
                </CardTitle>
                <CardDescription style={{ color: colors.palette.love }}>
                  Apply for our upcoming hackathon and track your application status
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList
                className="grid w-full grid-cols-2 rounded-none h-12 border-b"
                style={{
                  backgroundColor: colors.theme.cardBackground,
                  borderColor: colors.theme.cardBorder,
                }}
              >
                <TabsTrigger
                  value="application"
                  className="rounded-none h-12 data-[state=active]:border-t-2"
                  style={{
                    color: colors.theme.foreground,
                    borderColor: colors.theme.primary,
                    backgroundColor: activeTab === "application" ? colors.theme.background : "transparent",
                  }}
                >
                  Application
                </TabsTrigger>
                <TabsTrigger
                  value="status"
                  className="rounded-none h-12 data-[state=active]:border-t-2"
                  style={{
                    color: colors.theme.foreground,
                    borderColor: colors.theme.primary,
                    backgroundColor: activeTab === "status" ? colors.theme.background : "transparent",
                  }}
                >
                  Status
                </TabsTrigger>
              </TabsList>
              <TabsContent value="application" className="p-6">
                <ApplicationForm
                  onChange={handleFormChange}
                  onSubmit={handleFormSubmit}
                  formData={formData}
                  isSubmitted={applicationStatus !== "not_started" && applicationStatus !== "in_progress"}
                />
              </TabsContent>
              <TabsContent value="status" className="p-6">
                <ApplicationStatus status={applicationStatus} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
