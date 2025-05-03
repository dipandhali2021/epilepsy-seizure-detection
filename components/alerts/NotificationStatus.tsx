import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Mail, MessageSquare, PhoneCall, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface NotificationSentProps {
  notification: {
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
    }
  };
}

// Helper function to format phone numbers
function formatPhoneNumber(phone: string): string {
  if (!phone) return phone;
  
  // For US/Canada numbers
  if (phone.length === 10) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
  } else if (phone.startsWith('+')) {
    // International number
    if (phone.length > 10) {
      return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;
    }
  }
  return phone;
}

export function NotificationStatus({ notification }: NotificationSentProps) {
  // Format the recipient for display
  const formattedRecipient = notification.type === "email" 
    ? notification.recipient 
    : formatPhoneNumber(notification.recipient);

  // Format timestamp
  const sentTime = new Date(notification.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Format acknowledgment time if available
  const acknowledgedTime = notification.acknowledgedAt 
    ? format(new Date(notification.acknowledgedAt), "MMM d, yyyy 'at' h:mm a") 
    : "Time not available";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col p-3 rounded-xl border ${
        notification.acknowledged
          ? "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900"
          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
      } transition-colors duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {notification.type === "email" ? (
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          ) : notification.type === "sms" ? (
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <PhoneCall className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          )}
          <div>
            <div className="text-sm font-medium">{formattedRecipient}</div>
            <div className="text-xs text-muted-foreground">Sent at {sentTime}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notification.acknowledged ? (
            <Badge 
              variant="outline" 
              className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              Acknowledged
            </Badge>
          ) : (
            <Badge 
              variant={notification.status === "success" ? "outline" : "destructive"} 
              className={
                notification.status === "success" 
                  ? "gap-1 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  : "gap-1"
              }
            >
              {notification.status === "success" ? (
                <><CheckCircle className="h-3 w-3" /> Delivered</>
              ) : (
                <><XCircle className="h-3 w-3" /> Failed</>
              )}
            </Badge>
          )}
        </div>
      </div>
      
      {notification.acknowledged && (
        <div className="mt-2 ml-11 text-xs flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Acknowledged on {acknowledgedTime} by {notification.contact.name}</span>
        </div>
      )}
    </motion.div>
  );
}