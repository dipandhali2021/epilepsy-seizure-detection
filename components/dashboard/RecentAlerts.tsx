import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AlertTriangleIcon, BellIcon } from "lucide-react";
import Link from "next/link";

interface Alert {
  id: string;
  timestamp: string;
  type: "prediction" | "onset";
  confidence: number;
}

export default function RecentAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAlerts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/alerts?limit=5");
        if (!response.ok) {
          throw new Error("Failed to fetch alerts");
        }
        
        const data = await response.json();
        setAlerts(data.alerts || []);
      } catch (error) {
        console.error("Error fetching recent alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAlerts();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <span className="text-muted-foreground">Loading recent alerts...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No alerts recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div className="flex items-center">
                  {alert.type === "onset" ? (
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <AlertTriangleIcon className="h-4 w-4 text-red-600" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                      <BellIcon className="h-4 w-4 text-amber-600" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium flex items-center">
                      {alert.type === "onset" ? "Seizure Detected" : "Seizure Predicted"}
                      <Badge 
                        variant="outline" 
                        className="ml-2 text-xs"
                      >
                        {Math.round(alert.confidence * 100)}%
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(alert.timestamp), "PPP p")}
                    </div>
                  </div>
                </div>
                
              </div>
            ))}
            
            <div className="flex justify-center pt-2">
              <Link href="/alerts" passHref>
                <Button variant="outline" size="sm">
                  View All Alerts
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}