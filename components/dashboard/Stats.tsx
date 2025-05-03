import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon, BellIcon, UsersIcon } from "lucide-react";

// Define proper types for the alerts and contacts based on the schema
interface NotificationSent {
  id: string;
  contactId: string;
  type: 'email' | 'sms';
  recipient: string;
  status: 'success' | 'failed';
  timestamp: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

interface Alert {
  id: string;
  userId: string;
  deviceId: string;
  timestamp: string;
  type: 'prediction' | 'onset';
  confidence: number;
  notificationsSent: NotificationSent[];
}

interface StatsData {
  totalAlerts: number;
  predictionAlerts: number;
  onsetAlerts: number;
  contactsCount: number;
  acknowledgedRate: number;
}

export default function Stats() {
  const [data, setData] = useState<StatsData>({
    totalAlerts: 0,
    predictionAlerts: 0,
    onsetAlerts: 0,
    contactsCount: 0,
    acknowledgedRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch alert counts
        const alertsResponse = await fetch("/api/alerts?limit=1000");
        const contactsResponse = await fetch("/api/contacts");
        
        if (!alertsResponse.ok || !contactsResponse.ok) {
          console.error("Failed to fetch stats data");
          return;
        }
        
        const alertsData = await alertsResponse.json();
        const contactsData = await contactsResponse.json();
        
        const alerts = alertsData.alerts || [];
        const contacts = contactsData.contacts || [];
        
        // Calculate stats
        const totalAlerts = alerts.length;
        const predictionAlerts = alerts.filter((a:Alert) => a.type === "prediction").length;
        const onsetAlerts = alerts.filter((a:Alert) => a.type === "onset").length;
        const contactsCount = contacts.length;
        
        // Calculate acknowledgment rate
        let acknowledgedNotifications = 0;
        let totalNotifications = 0;
        
        alerts.forEach((alert:Alert) => {
          if (alert.notificationsSent && alert.notificationsSent.length > 0) {
            totalNotifications += alert.notificationsSent.length;
            acknowledgedNotifications += alert.notificationsSent.filter((n:NotificationSent) => n.acknowledged).length;
          }
        });
        
        const acknowledgedRate = totalNotifications > 0 
          ? (acknowledgedNotifications / totalNotifications) * 100 
          : 0;
        
        setData({
          totalAlerts,
          predictionAlerts,
          onsetAlerts,
          contactsCount,
          acknowledgedRate,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading stats...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          <BellIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalAlerts}</div>
          <p className="text-xs text-muted-foreground">
            Total alerts recorded
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Seizure Predictions</CardTitle>
          <BellIcon className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.predictionAlerts}</div>
          <p className="text-xs text-muted-foreground">
            Predicted seizure events
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Seizure Detections</CardTitle>
          <AlertTriangleIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.onsetAlerts}</div>
          <p className="text-xs text-muted-foreground">
            Detected seizure events
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emergency Contacts</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.contactsCount}</div>
          <p className="text-xs text-muted-foreground">
            Registered contacts
          </p>
        </CardContent>
      </Card>
    </div>
  );
}