"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangleIcon, CheckCircleIcon, XCircleIcon, AlertCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";

interface AcknowledgePageProps {
  params: {
    id: string;
  };
}

export default function AcknowledgePage({ params }: AcknowledgePageProps) {
  const searchParams = useSearchParams();
  const contactId = searchParams.get("contact");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const [isFirst, setIsFirst] = useState<boolean>(false);

  useEffect(() => {
    const acknowledgeAlert = async () => {
      if (!contactId) {
        setStatus("error");
        setMessage("Missing contact information. Cannot acknowledge alert.");
        return;
      }

      try {
        // The alert ID comes from the URL params
        console.log(`Acknowledging alert ${params.id} for contact ${contactId}`);
        
        const response = await fetch(`/api/alerts/acknowledge`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alertId: params.id,
            contactId,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setIsFirst(data.isFirstAcknowledgment || false);
          
          const message = data.isFirstAcknowledgment
            ? "You're the first to acknowledge this alert! Thank you for your prompt response."
            : "Alert has been successfully acknowledged. Thank you for your response.";
            
          setMessage(message);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to acknowledge alert. Please try again.");
          console.error("Server error:", data);
        }
      } catch (error) {
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again later.");
        console.error("Error acknowledging alert:", error);
      }
    };

    // Execute immediately when the page loads
    acknowledgeAlert();
  }, [params.id, contactId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg border p-8 shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {status === "loading" && (
            <div className="animate-pulse">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertTriangleIcon className="h-8 w-8 text-blue-500" />
              </div>
              <h1 className="mt-4 text-xl font-bold">Processing Acknowledgment</h1>
              <p className="text-muted-foreground">Please wait while we process your acknowledgment...</p>
            </div>
          )}

          {status === "success" && (
            <>
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="mt-4 text-xl font-bold">Alert Acknowledged</h1>
              <p className="text-muted-foreground">{message}</p>
              
              {isFirst && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    As the first person to acknowledge this alert, emergency responders will prioritize your information. 
                    Please be prepared to provide details about the patient&apos;s condition if contacted.
                  </p>
                </div>
              )}
            </>
          )}

          {status === "error" && (
            <>
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircleIcon className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="mt-4 text-xl font-bold">Error</h1>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}

          {/* <div className="mt-8">
            {status !== "loading" && (
              <Link href="/" passHref>
                <Button className="px-6">Return to Homepage</Button>
              </Link>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}