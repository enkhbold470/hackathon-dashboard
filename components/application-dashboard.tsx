"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ApplicationForm from "./application-form"
import ApplicationStatus from "./application-status"
import ConfettiExplosion from "react-confetti-explosion"
import colors from "@/lib/colors.json"
import useWindowSize from "@/hooks/useWindowSize"
import Confetti from 'react-confetti'
import { toast } from "sonner"

type Status = "not_started" | "in_progress" | "submitted" | "accepted" | "rejected" | "confirmed"

export default function ApplicationDashboard() {
  const [applicationStatus, setApplicationStatus] = useState<Status>("not_started")
  const [isExploding, setIsExploding] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState("application")
  const { width, height } = useWindowSize()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  console.log("[ApplicationDashboard] Component initialized")

  useEffect(() => {
    const fetchApplication = async () => {
      console.log("[ApplicationDashboard] Fetching application data")
      setIsLoading(true);
      try {
        const response = await fetch('/api/db/get-application');
        if (!response.ok) {
          console.error("[ApplicationDashboard] API error status:", response.status)
          throw new Error('Failed to fetch application data');
        }
        const data = await response.json();
        console.log("[ApplicationDashboard] Application data received:", JSON.stringify(data))
        
        if (data.application) {
          console.log("[ApplicationDashboard] Application found with status:", data.application.status)
          setFormData(data.application);
          setApplicationStatus(data.application.status || 'not_started');
          if (data.application.status === 'accepted') {
             setIsExploding(true);
             console.log("[ApplicationDashboard] Triggering confetti animation for accepted status")
          }
        } else {
          console.log("[ApplicationDashboard] No application found, setting status to not_started")
          setApplicationStatus('not_started');
        }
      } catch (error) {
        console.error("[ApplicationDashboard] Error fetching application:", error);
        toast.error("Could not load your application data.");
        setApplicationStatus('not_started');
      } finally {
        setIsLoading(false);
        console.log("[ApplicationDashboard] Application fetch completed, loading state cleared")
      }
    };
    fetchApplication();
  }, []);

  const handleFormChange = async (newData: Record<string, any>) => {
    console.log("[ApplicationDashboard] Form data changed:", JSON.stringify(newData))
    const updatedFormData = { ...formData, ...newData };
    setFormData(updatedFormData);

    if (applicationStatus === "not_started") {
      console.log("[ApplicationDashboard] First form change detected, updating status to in_progress")
      setApplicationStatus("in_progress");
    }

    try {
      console.log("[ApplicationDashboard] Saving application draft to database")
      const response = await fetch('/api/db/save-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[ApplicationDashboard] Save application error:", errorData)
        throw new Error(errorData.error || 'Failed to save application draft');
      }
      console.log("[ApplicationDashboard] Form data saved successfully")

    } catch (error: any) {
      console.error("[ApplicationDashboard] Error saving form data:", error);
      toast.error(`Failed to save changes: ${error.message}`);
    }
  }

  const handleFormSubmit = async () => {
    if (isSubmitting) {
      console.log("[ApplicationDashboard] Submission already in progress, ignoring duplicate submit")
      return;
    }
    
    console.log("[ApplicationDashboard] Starting application submission process")
    setIsSubmitting(true);
    
    const submissionData = { ...formData, agreeToTerms: formData.agreeToTerms ?? false };
    console.log("[ApplicationDashboard] Preparing submission data:", JSON.stringify(submissionData))

    try {
      console.log("[ApplicationDashboard] Sending submission to API")
      const response = await fetch('/api/db/submit-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("[ApplicationDashboard] Submission API error:", result)
        throw new Error(result.error || 'Failed to submit application');
      }

      console.log("[ApplicationDashboard] Application submitted successfully:", JSON.stringify(result.application));
      setFormData(result.application);
      setApplicationStatus("submitted");
      setActiveTab("status");
      toast.success("Application submitted successfully!");

    } catch (error: any) {
      console.error("[ApplicationDashboard] Error submitting application:", error);
      toast.error(`Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      console.log("[ApplicationDashboard] Submission process completed")
    }
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
                  isLoading={isSubmitting || isLoading}
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
