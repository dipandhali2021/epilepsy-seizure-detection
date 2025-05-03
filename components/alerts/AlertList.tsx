"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/Pagination";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { AlertTriangleIcon, BellIcon, BellRing } from "lucide-react";
import { NotificationStatus } from "./NotificationStatus";
import Link from "next/link";

interface Alert {
  id: string;
  userId: string;
  deviceId: string;
  timestamp: string;
  type: "prediction" | "onset";
  confidence: number;
  notificationsSent: NotificationSent[];
  createdAt: string;
  updatedAt: string;
}

interface NotificationSent {
  id: string;
  alertId: string;
  contactId: string;
  type: "email" | "sms";
  recipient: string;
  status: "success" | "failed";
  timestamp: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface AlertListProps {
  filterType: "prediction" | "onset" | null;
}

export function AlertList({ filterType }: AlertListProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
  });
  const { toast } = useToast();

  const fetchAlerts = useCallback(async (page: number) => {
    try {
      setLoading(true);
      let url = `/api/alerts?page=${page}&limit=${pagination.limit}`;
      
      // Add filter for alert type if specified
      if (filterType) {
        url += `&type=${filterType}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }
      const data = await response.json();
      
      // Sort alerts by timestamp first, then by createdAt if timestamps are identical
      const sortedAlerts = [...(data.alerts || [])].sort((a, b) => {
        // Compare timestamps first
        const timestampA = new Date(a.timestamp).getTime();
        const timestampB = new Date(b.timestamp).getTime();
        
        if (timestampA !== timestampB) {
          return timestampB - timestampA; // Newest timestamp first
        }
        
        // If timestamps are identical, sort by createdAt
        const createdAtA = new Date(a.createdAt).getTime();
        const createdAtB = new Date(b.createdAt).getTime();
        return createdAtB - createdAtA; // Newest creation date first
      });
      
      setAlerts(sortedAlerts);
      setPagination(data.pagination || {
        total: 0,
        pages: 1,
        page: 1,
        limit: 10,
      });
      setError(null);
    } catch (err) {
      setError("Error loading alerts. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load epilepsy alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, toast, filterType]);

  // Fetch alerts on component mount and when page changes
  useEffect(() => {
    fetchAlerts(pagination.page);
  }, [pagination.page, pagination.limit, fetchAlerts, filterType]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  if (loading && alerts.length === 0) {
    return <div className="flex justify-center p-8">Loading alert history...</div>;
  }

  if (alerts.length === 0) {
    return (
      <Card className="w-full mt-6">
        <CardContent className="text-center py-10">
          <div className="mx-auto bg-muted rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <BellRing className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Alerts Found</h3>
          <p className="text-muted-foreground mb-6">
            {filterType 
              ? `No ${filterType} alerts have been recorded yet.` 
              : "You'll see alerts here when your epilepsy prediction device detects a potential seizure."}
          </p>
          <Link href="/alerts/test">
            <Button>
              Test the Alert System
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {filterType 
            ? `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Alerts` 
            : "All Alerts"}
        </CardTitle>
        <Link href="/alerts/test">
          <Button variant="outline">Test Alert System</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/15 text-destructive p-4 mb-4 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="overflow-hidden">
              <div className={`p-4 ${alert.type === 'onset' ? 'bg-red-500' : 'bg-amber-500'} text-white flex justify-between items-center`}>
                <div className="flex items-center">
                  {alert.type === "onset" ? (
                    <AlertTriangleIcon className="h-5 w-5 mr-2" />
                  ) : (
                    <BellIcon className="h-5 w-5 mr-2" />
                  )}
                  <span className="font-medium capitalize">
                    {alert.type === "onset" ? "Seizure Detected" : "Seizure Predicted"}
                  </span>
                </div>
                <div>
                  <Badge variant="outline" className="text-white border-white">
                    {Math.round(alert.confidence * 100)}% Confidence
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Timestamp</p>
                    <p className="font-medium">
                      {format(new Date(alert.timestamp), "PPP p")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Device ID</p>
                    <p className="font-medium">{alert.deviceId}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Notifications</h4>
                  {alert.notificationsSent && alert.notificationsSent.length > 0 ? (
                    <div className="space-y-2">
                      {alert.notificationsSent.map((notification) => (
                        <NotificationStatus key={notification.id} notification={notification} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No notifications sent (test alert)</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}