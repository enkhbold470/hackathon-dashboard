"use client";

import { useState, useEffect } from "react";
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
  | "rejected"
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

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch("/api/db/get-application");
        if (!response.ok) {
          throw new Error("Failed to fetch application data");
        }
        const data = await response.json();

        if (data.application) {
          setFormData(data.application);
          setApplicationStatus(data.application.status || "not_started");

          if (
            ["submitted", "accepted", "rejected", "confirmed"].includes(
              data.application.status
            )
          ) {
            setActiveTab("status");
          }

          if (data.application.status === "accepted") {
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

  const handleFormChange = async (newData: Record<string, any>) => {
    const updatedFormData = { ...formData, ...newData };
    setFormData(updatedFormData);

    if (applicationStatus === "not_started") {
      setApplicationStatus("in_progress");
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/db/save-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedFormData,
          status: applicationStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save application draft");
      }

      setLastSaved(new Date());
    } catch (error: any) {
      toast.error(`Failed to save changes: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const prepareSubmission = () => {
    const requiredFields = ["cwid", "full_name"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      const missingFieldLabels = missingFields.map((field) =>
        field === "cwid" ? "CWID" : field === "full_name" ? "Full Name" : field
      );

      toast.error(
        `Please fill in all required fields: ${missingFieldLabels.join(", ")}`
      );
      return;
    }

    if (!formData.agree_to_terms) {
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

    setSubmissionData(data);
    setShowConfirmDialog(true);
  };

  const handleFormSubmit = async (data?: Record<string, any>) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setShowConfirmDialog(false);

    const submissionPayload = data || submissionData;

    try {
      const response = await fetch("/api/db/submit-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error && typeof result.error === "string") {
          throw new Error(result.error);
        }
        throw new Error("Failed to submit application");
      }

      setFormData(result.application);
      setApplicationStatus("submitted");
      setActiveTab("status");
      toast.success("Application submitted successfully!");
    } catch (error: any) {
      toast.error(`Submission failed: ${error.message}`);
      setSubmissionData({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAttendance = async () => {
    try {
      const response = await fetch("/api/db/confirm-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to confirm attendance");
      }

      setApplicationStatus("confirmed");
      toast.success("Attendance confirmed!");
    } catch (error: any) {
      toast.error(`Failed to confirm attendance: ${error.message}`);
    }
  };
  
  const handleDeclineAttendance = async () => {
    try {
      const response = await fetch("/api/db/decline-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to decline attendance");
      }

      setApplicationStatus("rejected");
      toast.success("Attendance declined. We hope to see you at another event!");
    } catch (error: any) {
      toast.error(`Failed to decline attendance: ${error.message}`);
    }
  };

  return (
    <div className="w-full max-w-5xl py-8 px-4">
      {isExploding && (
        <Confetti
          width={width || 300}
          height={height || 300}
          recycle={false}
          numberOfPieces={500}
          onConfettiComplete={() => setIsExploding(false)}
        />
      )}

      <h1 className="text-4xl font-bold mb-6 text-center">
        Hackathon Application
      </h1>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your application? You won't be
              able to make changes after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleFormSubmit(submissionData)}
              className="bg-theme-primary text-white hover:bg-theme-primary/90"
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger
            value="application"
            disabled={
              ["submitted", "accepted", "rejected", "confirmed"].includes(
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
            }}
          >
            Application Status
          </TabsTrigger>
        </TabsList>

        <Card
          style={{
            backgroundColor: colors.theme.background,
            borderColor: colors.theme.inputBorder,
          }}
          className="border-2 shadow-xl"
        >
          <TabsContent value="application" className="mt-0">
            <CardHeader>
              <CardTitle className="text-2xl">Hackathon Application</CardTitle>
              <CardDescription style={{ color: colors.palette.foreground }}>
                Fill out the form below to apply for the hackathon.
                {lastSaved && (
                  <div className="mt-2 text-xs">
                    Last saved:{" "}
                    {new Date(lastSaved).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationForm
                formData={formData}
                onChange={handleFormChange}
                onSubmit={prepareSubmission}
                isSubmitted={["submitted", "accepted", "rejected", "confirmed"].includes(applicationStatus)}
                isLoading={isLoading || isSubmitting}
              />
            </CardContent>
          </TabsContent>

          <TabsContent value="status" className="mt-0">
            <CardHeader>
              <CardTitle className="text-2xl">Application Status</CardTitle>
              <CardDescription style={{ color: colors.palette.foreground }}>
                Check the status of your hackathon application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationStatus status={applicationStatus} />
            </CardContent>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
