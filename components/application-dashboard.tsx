"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ApplicationForm from "./application-form";
import ApplicationStatus from "./application-status";
import colors from "@/lib/colors";
import uiConfig from "@/lib/ui-config";
import useWindowSize from "@/hooks/useWindowSize";
import Confetti from "react-confetti";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { applicationData, applicationStatusData, applicationDeadline, linkToMatchAnza, discordInviteLink } from "@/lib/applicationData";
import { Loader2, CalendarOff } from "lucide-react";

type Status =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "accepted"
  | "waitlisted"
  | "confirmed";

export default function ApplicationDashboard() {
  const [applicationStatus, setApplicationStatus] =
    useState<Status>("not_started");
  const [isExploding, setIsExploding] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState("application");
  const { width, height } = useWindowSize();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submissionData, setSubmissionData] = useState<Record<string, any>>({});
  const [isMobile, setIsMobile] = useState(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState<string | null>(null);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < parseInt(uiConfig.breakpoints.md.replace("px", ""))
      );
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Setup beforeunload handler for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && applicationStatus === "in_progress") {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, applicationStatus]);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        // Use the new API endpoint
        const response = await fetch("/api/db/get", {
          method: "GET",
        });

        const result = await response.json();

        if (result.success && result.application) {
          setFormData(result.application);
          setApplicationStatus(
            (result.application.status as Status) || "not_started"
          );

          if (
            ["submitted", "accepted", "waitlisted", "confirmed"].includes(
              result.application.status
            )
          ) {
            setActiveTab("status");
          }

          if (result.application.status === "accepted") {
            setIsExploding(true);
          }
        } else {
          setApplicationStatus("not_started");
        }
      } catch (error) {
        toast.error("Could not load your application data.");
        setApplicationStatus("not_started");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, []);

  // For confetti effect when accepted
  useEffect(() => {
    if (applicationStatus === "accepted") {
      setIsExploding(true);
    }
  }, [applicationStatus]);

  // Set up event listeners for attendance confirmation/declining
  useEffect(() => {
    const handleConfirm = () => {
      handleConfirmAttendance();
    };

    const handleDecline = () => {
      handleDeclineAttendance();
    };

    window.addEventListener("confirmAttendance", handleConfirm);
    window.addEventListener("declineAttendance", handleDecline);

    return () => {
      window.removeEventListener("confirmAttendance", handleConfirm);
      window.removeEventListener("declineAttendance", handleDecline);
    };
  }, []);

  const handleFormChange = async (newData: Record<string, any>) => {
    const updatedFormData = { ...formData, ...newData };
    setFormData(updatedFormData);
    setHasUnsavedChanges(true);

    if (applicationStatus === "not_started") {
      setApplicationStatus("in_progress");
    }

    // Autosave can be implemented here
  };

  const handleTabChange = (value: string) => {
    if (hasUnsavedChanges && applicationStatus === "in_progress" && activeTab === "application") {
      setPendingTabChange(value);
      setShowUnsavedDialog(true);
    } else {
      setActiveTab(value);
    }
  };

  const confirmTabChange = () => {
    if (pendingTabChange) {
      setActiveTab(pendingTabChange);
      setPendingTabChange(null);
    }
    setShowUnsavedDialog(false);
  };

  const cancelTabChange = () => {
    setPendingTabChange(null);
    setShowUnsavedDialog(false);
    setSubmissionData({});
  };

  const prepareSubmission = () => {
    console.log("prepareSubmission called", { status: formData.status });
    // Get the current form data from the form state
    const currentFormData = formData;

    const requiredFields = ["cwid", "full_name"];
    const missingFields = requiredFields.filter(
      (field) => !currentFormData[field]
    );

    if (missingFields.length > 0) {
      const missingFieldLabels = missingFields.map((field) =>
        field === "cwid" ? "CWID" : field === "full_name" ? "Full Name" : field
      );

      console.log("Missing required fields:", missingFieldLabels);
      toast.error(
        `Please fill in all required fields: ${missingFieldLabels.join(", ")}`
      );
      return;
    }

    if (!currentFormData.agree_to_terms) {
      console.log("Terms not agreed to");
      toast.error(
        "You must agree to the terms and conditions to submit your application."
      );
      return;
    }

    const data = {
      ...currentFormData,
      agree_to_terms: currentFormData.agree_to_terms ?? false,
      status: "submitted",
    };

    console.log("Setting submission data:", data);
    setSubmissionData(data);
    setShowConfirmDialog(true);
  };

  const handleFormSubmit = async (data?: Record<string, any>) => {
    if (isSubmitting) {
      console.log("Already submitting, skipping duplicate submission");
      return;
    }

    console.log("handleFormSubmit called with data:", data || submissionData);
    setIsSubmitting(true);

    // Only close the dialog if it was shown
    if (showConfirmDialog) {
      setShowConfirmDialog(false);
    }

    // If data is directly provided, use it directly instead of going through validation
    const submissionPayload = data || submissionData;

    try {
      console.log("Sending API request to /api/db/submit");
      // Use the new API endpoint for submission
      const response = await fetch("/api/db/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionPayload),
      });

      console.log("API response received, status:", response.status);
      const result = await response.json();
      console.log("API result:", result);

      if (result.success) {
        setFormData(result.application);
        setApplicationStatus("submitted");
        setActiveTab("status");
        setHasUnsavedChanges(false);
        toast.success("Application submitted successfully!");
      } else {
        throw new Error(result.error || "Failed to submit application");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(`Submission failed: ${error.message}`);
      setSubmissionData({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAttendance = async () => {
    try {
      // Use the new API endpoint
      const response = await fetch("/api/db/confirm-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (result.success) {
        setApplicationStatus("confirmed");
        toast.success("Attendance confirmed!");
      } else {
        throw new Error(result.error || "Failed to confirm attendance");
      }
    } catch (error: any) {
      toast.error(`Failed to confirm attendance: ${error.message}`);
    }
  };

  const handleDeclineAttendance = async () => {
    try {
      // Use the new API endpoint
      const response = await fetch("/api/db/decline-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (result.success) {
        setApplicationStatus("waitlisted");
        toast.success(
          "Attendance declined. We hope to see you at another event!"
        );
      } else {
        throw new Error(result.error || "Failed to decline attendance");
      }
    } catch (error: any) {
      toast.error(`Failed to decline attendance: ${error.message}`);
    }
  };

  const isDeadlinePassed = new Date() > applicationDeadline;

  return (
    
    <div
      className="flex justify-center items-start w-full py-8"
      style={{
        fontFamily: uiConfig.typography.fontFamily.base,
        padding: isMobile
          ? uiConfig.spacing.mobile.containerPadding
          : uiConfig.spacing.containerPadding,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: uiConfig.layout.maxWidth,
          margin: uiConfig.layout.contentMargin,
          padding: isMobile
            ? uiConfig.layout.mobilePadding
            : uiConfig.layout.contentPadding,
        }}
      >
        {isExploding && (
          <Confetti
            width={width || 300}
            height={height || 300}
            recycle={false}
            numberOfPieces={500}
            onConfettiComplete={() => setIsExploding(false)}
          />
        )}

        <h1
          className="text-4xl font-bold mb-6 text-center"
          style={{
            fontSize: isMobile
              ? uiConfig.typography.fontSize.mobile.formTitle
              : uiConfig.typography.fontSize.formTitle,
            fontWeight: uiConfig.typography.fontWeight.bold,
            marginBottom: isMobile ? "1.5rem" : "2rem",
            color: colors.theme.primary,
          }}
        >
          Hackathon Application
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg font-medium">Loading application...</span>
          </div>
        ) : isDeadlinePassed && applicationStatus === "not_started" ? (
          <div className="relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl"></div>
              <div className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-lg"></div>
              <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-xl"></div>
            </div>
            
            <Card
              style={{
                backgroundColor: `${colors.theme.background}dd`,
                borderColor: colors.theme.warning,
                borderWidth: "2px",
                borderRadius: uiConfig.inputStyles.sectionBorderRadius,
                boxShadow: `0 20px 25px -5px ${colors.theme.warning}20, 0 10px 10px -5px ${colors.theme.warning}10`,
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="border shadow-2xl"
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-lg opacity-20 animate-pulse"></div>
              
              <CardHeader className="relative z-10 text-center pt-8">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <CalendarOff 
                      className="h-20 w-20 text-orange-500 animate-bounce" 
                      style={{ filter: 'drop-shadow(0 4px 8px rgba(249, 115, 22, 0.3))' }}
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-lg font-bold animate-pulse">
                      !
                    </div>
                  </div>
                </div>
                
                <CardTitle
                  className="text-4xl mb-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent font-extrabold"
                  style={{
                    fontSize: isMobile
                      ? '2rem'
                      : '2.5rem',
                    fontWeight: 900,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  🚨 Application Period Over
                </CardTitle>
                
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-full py-2 px-6 inline-block border border-yellow-300 dark:border-yellow-600">
                  <p className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                    Deadline was May 24th, 2025
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 pb-8">
                <div className="text-center space-y-6">
                  <div className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">
                      😔 Unfortunately, you missed the deadline
                    </h3>
                    <p
                      style={{
                        fontSize: isMobile
                          ? uiConfig.typography.fontSize.mobile.answerOption
                          : '1.125rem',
                        color: colors.theme.secondary,
                        lineHeight: uiConfig.typography.lineHeight.relaxed,
                      }}
                      className="mb-4"
                    >
                      The application period for DAHacks 2025 has officially ended. 
                      But don't worry - there are still ways to stay connected with our community!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-300/30">
                      <h4 className="text-xl font-bold mb-3 flex items-center text-purple-700 dark:text-purple-300">
                        🔮 Future Events
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        Follow us to be the first to know about our next hackathon and other exciting events!
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl p-6 border border-green-300/30">
                      <h4 className="text-xl font-bold mb-3 flex items-center text-green-700 dark:text-green-300">
                        👥 Community
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        Join our community to network, share projects, and collaborate with fellow developers!
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-indigo-300/30">
                    <h3
                      className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                    >
                      🚀 Stay Connected
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                      <Link
                        href={applicationStatusData.discord.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 transform hover:scale-105 transition-all duration-300"
                      >
                        <div className="bg-gradient-to-r from-[#5865F2] to-[#4752C4] text-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                          <div className="relative z-10">
                            <div className="text-2xl mb-2">💬</div>
                            <div className="font-bold text-lg">Join Discord</div>
                            <div className="text-sm opacity-90">
                              Chat with organizers & participants
                            </div>
                          </div>
                        </div>
                      </Link>

                      <Link
                        href={applicationStatusData.instagram.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 transform hover:scale-105 transition-all duration-300"
                      >
                        <div className="bg-gradient-to-r from-[#405DE6] via-[#E1306C] to-[#FFDC80] text-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                          <div className="relative z-10">
                            <div className="text-2xl mb-2">📸</div>
                            <div className="font-bold text-lg">Follow Instagram</div>
                            <div className="text-sm opacity-90">
                              Get latest updates & announcements
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <AlertDialog
              open={showConfirmDialog}
              onOpenChange={setShowConfirmDialog}
            >
              <AlertDialogContent
                style={{
                  borderRadius: uiConfig.borderRadius.md,
                  backgroundColor: colors.theme.background,
                  border: `1px solid ${colors.theme.inputBorder}`,
                  padding: isMobile
                    ? uiConfig.spacing.mobile.containerPadding
                    : uiConfig.spacing.containerPadding,
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle
                    style={{
                      fontSize: isMobile
                        ? uiConfig.typography.fontSize.mobile.sectionTitle
                        : uiConfig.typography.fontSize.sectionTitle,
                      fontWeight: uiConfig.typography.fontWeight.bold,
                      color: colors.theme.primary,
                    }}
                  >
                    Submit Application?
                  </AlertDialogTitle>
                  <AlertDialogDescription
                    style={{
                      fontSize: isMobile
                        ? uiConfig.typography.fontSize.mobile.answerOption
                        : uiConfig.typography.fontSize.answerOption,
                      color: colors.theme.secondary,
                    }}
                  >
                    Are you sure you want to submit your application? You won't be
                    able to make changes after submission.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
                  <AlertDialogCancel
                    style={{
                      fontSize: uiConfig.typography.fontSize.buttonText,
                      borderRadius: uiConfig.borderRadius.md,
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleFormSubmit(submissionData)}
                    className="bg-theme-primary text-white hover:bg-theme-primary/90"
                    style={{
                      backgroundColor: colors.theme.primary,
                      color: colors.theme.buttonText,
                      fontSize: uiConfig.typography.fontSize.buttonText,
                      borderRadius: uiConfig.borderRadius.md,
                    }}
                  >
                    Submit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={showUnsavedDialog}
              onOpenChange={setShowUnsavedDialog}
            >
              <AlertDialogContent
                style={{
                  borderRadius: uiConfig.borderRadius.md,
                  backgroundColor: colors.theme.background,
                  border: `1px solid ${colors.theme.inputBorder}`,
                  padding: isMobile
                    ? uiConfig.spacing.mobile.containerPadding
                    : uiConfig.spacing.containerPadding,
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle
                    style={{
                      fontSize: isMobile
                        ? uiConfig.typography.fontSize.mobile.sectionTitle
                        : uiConfig.typography.fontSize.sectionTitle,
                      fontWeight: uiConfig.typography.fontWeight.bold,
                      color: colors.theme.warning,
                    }}
                  >
                    Unsaved Changes
                  </AlertDialogTitle>
                  <AlertDialogDescription
                    style={{
                      fontSize: isMobile
                        ? uiConfig.typography.fontSize.mobile.answerOption
                        : uiConfig.typography.fontSize.answerOption,
                      color: colors.theme.secondary,
                    }}
                  >
                    You have unsaved changes in your application. If you leave now, your changes may be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
                  <AlertDialogCancel
                    onClick={cancelTabChange}
                    style={{
                      fontSize: uiConfig.typography.fontSize.buttonText,
                      borderRadius: uiConfig.borderRadius.md,
                    }}
                  >
                    Stay on Form
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmTabChange}
                    className="bg-theme-warning text-white hover:bg-theme-warning/90"
                    style={{
                      backgroundColor: colors.theme.warning,
                      color: colors.theme.buttonText,
                      fontSize: uiConfig.typography.fontSize.buttonText,
                      borderRadius: uiConfig.borderRadius.md,
                    }}
                  >
                    Discard Changes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList
                className={`grid w-full grid-cols-2 mb-8`}
                style={{
                  marginBottom: isMobile ? "1.5rem" : "2rem",
                }}
              >
                <TabsTrigger
                  value="application"
                  disabled={
                    ["submitted", "accepted", "waitlisted", "confirmed"].includes(
                      applicationStatus
                    ) && !isLoading
                  }
                  style={{
                    backgroundColor:
                      activeTab === "application"
                        ? colors.theme.primary
                        : colors.theme.background,
                    color:
                      activeTab === "application"
                        ? colors.theme.buttonText
                        : colors.theme.foreground,
                    borderColor: colors.theme.inputBorder,
                    fontSize: isMobile
                      ? uiConfig.typography.fontSize.mobile.buttonText
                      : uiConfig.typography.fontSize.buttonText,
                    fontWeight: uiConfig.typography.fontWeight.medium,
                    padding: isMobile
                      ? uiConfig.spacing.mobile.buttonPadding
                      : uiConfig.spacing.buttonPadding,
                    borderRadius: uiConfig.borderRadius.md,
                  }}
                >
                  Application Form
                  {hasUnsavedChanges && applicationStatus === "in_progress" && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-yellow-500 text-white">*</span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="status"
                  disabled={applicationStatus === "not_started" && !isLoading}
                  style={{
                    backgroundColor:
                      activeTab === "status"
                        ? colors.theme.primary
                        : colors.theme.background,
                    color:
                      activeTab === "status"
                        ? colors.theme.buttonText
                        : colors.theme.foreground,
                    borderColor: colors.theme.inputBorder,
                    fontSize: isMobile
                      ? uiConfig.typography.fontSize.mobile.buttonText
                      : uiConfig.typography.fontSize.buttonText,
                    fontWeight: uiConfig.typography.fontWeight.medium,
                    padding: isMobile
                      ? uiConfig.spacing.mobile.buttonPadding
                      : uiConfig.spacing.buttonPadding,
                    borderRadius: uiConfig.borderRadius.md,
                  }}
                >
                  Application Status
                </TabsTrigger>
              </TabsList>

              <Card
                style={{
                  backgroundColor: uiConfig.inputStyles.sectionBackground,
                  borderColor: colors.theme.inputBorder,
                  borderRadius: uiConfig.inputStyles.sectionBorderRadius,
                  boxShadow: uiConfig.inputStyles.sectionBoxShadow,
                  overflow: "hidden",
                  width: "100%",
                }}
                className="border shadow-md"
              >
                <TabsContent value="application" className="mt-0">
                  <CardContent
                    style={{
                      padding: isMobile
                        ? uiConfig.spacing.mobile.containerPadding
                        : uiConfig.spacing.containerPadding,
                    }}
                  >
                    {hasUnsavedChanges && applicationStatus === "in_progress" && (
                      <div 
                        className="mb-4 p-2 rounded-md border border-yellow-500 bg-yellow-500/10 flex items-center"
                        style={{
                          borderRadius: uiConfig.borderRadius.md,
                        }}
                      >
                        <span className="text-yellow-500 font-medium">
                          You have unsaved changes. Your changes will be saved when you submit.
                        </span>
                      </div>
                    )}
                    
                    <ApplicationForm
                      formData={formData}
                      onChange={handleFormChange}
                      onSubmit={() => prepareSubmission()}
                      isSubmitted={[
                        "submitted",
                        "accepted",
                        "waitlisted",
                        "confirmed",
                      ].includes(applicationStatus)}
                      isSubmitting={isSubmitting}
                    />
                  </CardContent>
                </TabsContent>

                <TabsContent value="status" className="mt-0">
                  <CardHeader
                    style={{
                      padding: isMobile
                        ? uiConfig.spacing.mobile.containerPadding
                        : uiConfig.spacing.containerPadding,
                    }}
                  >
                    <CardTitle
                      className="text-2xl mb-6"
                      style={{
                        fontSize: isMobile
                          ? uiConfig.typography.fontSize.mobile.sectionTitle
                          : uiConfig.typography.fontSize.sectionTitle,
                        fontWeight: uiConfig.typography.fontWeight.bold,
                        color: colors.theme.primary,
                      }}
                    >
                      Application Status
                    </CardTitle>
                  </CardHeader>

                  <CardContent
                    style={{
                      padding: isMobile
                        ? uiConfig.spacing.mobile.containerPadding
                        : uiConfig.spacing.containerPadding,
                    }}
                  >
                    <ApplicationStatus
                      status={applicationStatus}
                      cwid={formData?.cwid}
                      isLoading={isLoading}
                    />

                    <div className="space-y-4">
                      <div>
                        <h3
                          className="text-xl font-semibold my-4"
                          style={{ color: colors.theme.primary }}
                        >
                          Previous Hackathon Projects
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {applicationStatusData.devpost.links.map((link) => (
                            <Link
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                                <h4 className="font-medium text-theme-primary hover:underline">
                                  {link.title}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  View project showcase →
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3
                        className="text-xl font-semibold my-4"
                        style={{ color: colors.theme.primary }}
                      >
                        Stay Connected
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                          href={applicationStatusData.discord.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <div className="bg-[#5865F2] text-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow flex items-center gap-3">
                            <div>
                              <div className="font-medium">Join Discord</div>
                              <div className="text-sm opacity-90">
                                Chat with organizers & participants
                              </div>
                            </div>
                          </div>
                        </Link>

                        <Link
                          href={applicationStatusData.instagram.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <div className="bg-gradient-to-r from-[#405DE6] via-[#E1306C] to-[#FFDC80] text-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow flex items-center gap-3">
                            <div>
                              <div className="font-medium">Follow Instagram</div>
                              <div className="text-sm opacity-90">
                                Get latest updates & announcements
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
              </Card>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
