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

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChanges = useRef(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < parseInt(uiConfig.breakpoints.md.replace('px', '')));
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Clear auto-save timer on component unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        // Use the new API endpoint
        const response = await fetch('/api/db/get', {
          method: 'GET',
        });
        
        const result = await response.json();
        
        if (result.success && result.application) {
          setFormData(result.application);
          setApplicationStatus(result.application.status as Status || "not_started");

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

    window.addEventListener('confirmAttendance', handleConfirm);
    window.addEventListener('declineAttendance', handleDecline);
    
    return () => {
      window.removeEventListener('confirmAttendance', handleConfirm);
      window.removeEventListener('declineAttendance', handleDecline);
    };
  }, []);

  const handleFormChange = async (newData: Record<string, any>) => {
    const updatedFormData = { ...formData, ...newData };
    setFormData(updatedFormData);
    hasUnsavedChanges.current = true;

    if (applicationStatus === "not_started") {
      setApplicationStatus("in_progress");
    }
    
    // Don't save automatically when changes are made - only on submission
  };

  const prepareSubmission = () => {
    console.log('prepareSubmission called', { status: formData.status });
    const requiredFields = ["cwid", "full_name"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      const missingFieldLabels = missingFields.map((field) =>
        field === "cwid" ? "CWID" : field === "full_name" ? "Full Name" : field
      );

      console.log('Missing required fields:', missingFieldLabels);
      toast.error(
        `Please fill in all required fields: ${missingFieldLabels.join(", ")}`
      );
      return;
    }

    if (!formData.agree_to_terms) {
      console.log('Terms not agreed to');
      toast.error(
        "You must agree to the terms and conditions to submit your application."
      );
      return;
    }

    const data = {
      ...formData,
      agree_to_terms: formData.agree_to_terms ?? false,
      status: "submitted",
    };

    console.log('Setting submission data:', data);
    setSubmissionData(data);
    setShowConfirmDialog(true);
  };

  const handleFormSubmit = async (data?: Record<string, any>) => {
    if (isSubmitting) {
      console.log('Already submitting, skipping duplicate submission');
      return;
    }

    console.log('handleFormSubmit called with data:', data || submissionData);
    setIsSubmitting(true);
    
    // Only close the dialog if it was shown
    if (showConfirmDialog) {
      setShowConfirmDialog(false);
    }

    // If data is directly provided, use it directly instead of going through validation
    const submissionPayload = data || submissionData;

    try {
      console.log('Sending API request to /api/db/submit');
      // Use the new API endpoint for submission
      const response = await fetch('/api/db/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionPayload),
      });
      
      console.log('API response received, status:', response.status);
      const result = await response.json();
      console.log('API result:', result);

      if (result.success) {
        setFormData(result.application);
        setApplicationStatus("submitted");
        setActiveTab("status");
        toast.success("Application submitted successfully!");
      } else {
        throw new Error(result.error || "Failed to submit application");
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(`Submission failed: ${error.message}`);
      setSubmissionData({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAttendance = async () => {
    try {
      // Use the new API endpoint
      const response = await fetch('/api/db/confirm-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch('/api/db/decline-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setApplicationStatus("waitlisted");
        toast.success("Attendance declined. We hope to see you at another event!");
      } else {
        throw new Error(result.error || "Failed to decline attendance");
      }
    } catch (error: any) {
      toast.error(`Failed to decline attendance: ${error.message}`);
    }
  };

  return (
    <div 
      className="flex justify-center items-start w-full py-8"
      style={{
        fontFamily: uiConfig.typography.fontFamily.base,
        padding: isMobile ? uiConfig.spacing.mobile.containerPadding : uiConfig.spacing.containerPadding
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: uiConfig.layout.maxWidth,
          margin: uiConfig.layout.contentMargin,
          padding: isMobile ? uiConfig.layout.mobilePadding : uiConfig.layout.contentPadding
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
            fontSize: isMobile ? uiConfig.typography.fontSize.mobile.formTitle : uiConfig.typography.fontSize.formTitle,
            fontWeight: uiConfig.typography.fontWeight.bold,
            marginBottom: isMobile ? '1.5rem' : '2rem',
            color: colors.theme.primary
          }}
        >
          Hackathon Application
        </h1>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent style={{
            borderRadius: uiConfig.borderRadius.md,
            backgroundColor: colors.theme.background,
            border: `1px solid ${colors.theme.inputBorder}`,
            padding: isMobile ? uiConfig.spacing.mobile.containerPadding : uiConfig.spacing.containerPadding
          }}>
            <AlertDialogHeader>
              <AlertDialogTitle style={{
                fontSize: isMobile ? uiConfig.typography.fontSize.mobile.sectionTitle : uiConfig.typography.fontSize.sectionTitle,
                fontWeight: uiConfig.typography.fontWeight.bold,
                color: colors.theme.primary
              }}>
                Submit Application?
              </AlertDialogTitle>
              <AlertDialogDescription style={{
                fontSize: isMobile ? uiConfig.typography.fontSize.mobile.answerOption : uiConfig.typography.fontSize.answerOption,
                color: colors.theme.secondary
              }}>
                Are you sure you want to submit your application? You won't be
                able to make changes after submission.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className={isMobile ? 'flex-col space-y-2' : ''}>
              <AlertDialogCancel 
                style={{
                  fontSize: uiConfig.typography.fontSize.buttonText,
                  borderRadius: uiConfig.borderRadius.md
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
                  borderRadius: uiConfig.borderRadius.md
                }}
              >
                Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList 
            className={`grid w-full grid-cols-2 mb-8`}
            style={{
              marginBottom: isMobile ? '1.5rem' : '2rem'
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
                fontSize: isMobile ? uiConfig.typography.fontSize.mobile.buttonText : uiConfig.typography.fontSize.buttonText,
                fontWeight: uiConfig.typography.fontWeight.medium,
                padding: isMobile ? uiConfig.spacing.mobile.buttonPadding : uiConfig.spacing.buttonPadding,
                borderRadius: uiConfig.borderRadius.md
              }}
            >
              Application Form
            </TabsTrigger>
            <TabsTrigger
              value="status"
              disabled={
                applicationStatus === "not_started" &&
                !isLoading
              }
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
                fontSize: isMobile ? uiConfig.typography.fontSize.mobile.buttonText : uiConfig.typography.fontSize.buttonText,
                fontWeight: uiConfig.typography.fontWeight.medium,
                padding: isMobile ? uiConfig.spacing.mobile.buttonPadding : uiConfig.spacing.buttonPadding,
                borderRadius: uiConfig.borderRadius.md
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
              overflow: 'hidden',
              width: '100%'
            }}
            className="border shadow-md"
          >
            <TabsContent value="application" className="mt-0">
              {/* <CardHeader style={{
                padding: isMobile ? uiConfig.spacing.mobile.containerPadding : uiConfig.spacing.containerPadding
              }}>
                <CardTitle 
                  className="text-2xl"
                  style={{
                    fontSize: isMobile ? uiConfig.typography.fontSize.mobile.sectionTitle : uiConfig.typography.fontSize.sectionTitle,
                    fontWeight: uiConfig.typography.fontWeight.bold,
                    color: colors.theme.primary
                  }}
                >
                  Hackathon Application
                </CardTitle>
                <CardDescription style={{ 
                  color: colors.palette.foreground,
                  fontSize: isMobile ? uiConfig.typography.fontSize.mobile.helperText : uiConfig.typography.fontSize.helperText
                }}>
                  Fill out the form below to apply for the hackathon.
                  {isSaving && <span className="ml-2">(Saving...)</span>}
                  {lastSaved && !isSaving && (
                    <div className="mt-2 text-xs">
                      Last saved:{" "}
                      {new Date(lastSaved).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  )}
                </CardDescription>
              </CardHeader> */}
              <CardContent style={{
                padding: isMobile ? uiConfig.spacing.mobile.containerPadding : uiConfig.spacing.containerPadding
              }}>
                <ApplicationForm
                  formData={formData}
                  onChange={handleFormChange}
                  onSubmit={(data) => {
                    if (data) {
                      // If data is directly provided, bypass the confirmation dialog
                      handleFormSubmit(data);
                    } else {
                      // Otherwise, go through the regular flow with validation
                      prepareSubmission();
                    }
                  }}
                  isSubmitted={["submitted", "accepted", "waitlisted", "confirmed"].includes(applicationStatus)}
                  isSubmitting={isSubmitting}
                />
              </CardContent>
            </TabsContent>

            <TabsContent value="status" className="mt-0">
              <CardHeader style={{
                padding: isMobile ? uiConfig.spacing.mobile.containerPadding : uiConfig.spacing.containerPadding
              }}>
                <CardTitle 
                  className="text-2xl"
                  style={{
                    fontSize: isMobile ? uiConfig.typography.fontSize.mobile.sectionTitle : uiConfig.typography.fontSize.sectionTitle,
                    fontWeight: uiConfig.typography.fontWeight.bold,
                    color: colors.theme.primary
                  }}
                >
                  Application Status
                </CardTitle>
                <CardDescription style={{ 
                  color: colors.palette.foreground,
                  fontSize: isMobile ? uiConfig.typography.fontSize.mobile.helperText : uiConfig.typography.fontSize.helperText
                }}>
                  Check the status of your hackathon application.
                </CardDescription>
              </CardHeader>
              <CardContent style={{
                padding: isMobile ? uiConfig.spacing.mobile.containerPadding : uiConfig.spacing.containerPadding
              }}>
                <ApplicationStatus status={applicationStatus} />
              </CardContent>
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
