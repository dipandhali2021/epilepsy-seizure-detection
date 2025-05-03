"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/Pagination";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { AlertTriangleIcon, BellIcon, BellRing } from "lucide-react";
import { NotificationStatus } from "./NotificationStatus";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
  type: "email" | "sms" | "voice";
  recipient: string;
  status: "success" | "failed";
  timestamp: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  contact: {
    name: string;
    email?: string;
    phone?: string;
  };
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

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

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
      
      if (filterType) {
        url += `&type=${filterType}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }
      const data = await response.json();
      
      // Sort alerts by timestamp first, then by createdAt
      const sortedAlerts = [...(data.alerts || [])].sort((a, b) => {
        const timestampA = new Date(a.timestamp).getTime();
        const timestampB = new Date(b.timestamp).getTime();
        
        if (timestampA !== timestampB) {
          return timestampB - timestampA;
        }
        
        const createdAtA = new Date(a.createdAt).getTime();
        const createdAtB = new Date(b.createdAt).getTime();
        return createdAtB - createdAtA;
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

  useEffect(() => {
    fetchAlerts(pagination.page);
  }, [pagination.page, pagination.limit, fetchAlerts, filterType]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  if (loading && alerts.length === 0) {
    return (
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="h-16 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 animate-pulse" />
              <div className="p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 animate-pulse">
                        <div className="h-8 w-8 bg-muted rounded-lg mr-3" />
                        <div className="flex-1">
                          <div className="h-4 w-28 bg-muted rounded mb-1" />
                          <div className="h-3 w-20 bg-muted rounded" />
                        </div>
                        <div className="h-5 w-20 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (alerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <div className="mx-auto bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
          <BellRing className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-xl font-medium mb-3">No Alerts Found</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {filterType 
            ? `No ${filterType} alerts have been recorded yet.` 
            : "You'll see alerts here when your epilepsy prediction device detects a potential seizure."}
        </p>
        <Link href="/alerts/test">
          <Button className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white border-0 gap-2">
            <BellRing className="h-4 w-4" />
            Test the Alert System
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-200 text-red-800 p-4 mb-6 rounded-xl"
        >
          {error}
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              variants={itemVariants}
              layout
              className="group"
            >
              <Card className="overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all duration-200 hover:shadow-lg">
                <div className={`p-4 ${
                  alert.type === 'onset' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : 'bg-gradient-to-r from-amber-500 to-amber-600'
                } text-white flex justify-between items-center`}>
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
                  <Badge variant="outline" className="text-white border-white/20 bg-white/10">
                    {Math.round(alert.confidence * 100)}% Confidence
                  </Badge>
                </div>
                
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Timestamp</p>
                      <p className="font-medium">
                        {format(new Date(alert.timestamp), "PPP p")}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Device ID</p>
                      <p className="font-medium font-mono">{alert.deviceId}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Notifications</h4>
                    {alert.notificationsSent && alert.notificationsSent.length > 0 ? (
                      <div className="space-y-2">
                        {alert.notificationsSent.map((notification) => (
                          <NotificationStatus key={notification.id} notification={notification} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                        No notifications sent (test alert)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </motion.div>
  );
}