import { useEffect, useState } from "react";

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Alerts */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Alerts</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{data.totalAlerts}</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total alerts recorded</span>
        </div>
      </div>

      {/* Seizure Predictions */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Seizure Predictions</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{data.predictionAlerts}</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Predicted seizure events</span>
        </div>
      </div>

      {/* Seizure Detections */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Seizure Detections</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-red-600 dark:text-red-500">{data.onsetAlerts}</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Detected seizure events</span>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Emergency Contacts</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">{data.contactsCount}</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Registered contacts</span>
        </div>
      </div>
    </div>
  );
}