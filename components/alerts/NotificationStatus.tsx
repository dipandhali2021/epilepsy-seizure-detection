import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Mail, Phone, CheckCircle2, PhoneCall, Clock } from "lucide-react";
import { format } from "date-fns";

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
    contact:{
      name: string;
      email?: string;
      phone?: string;
    }
  };
}

export function NotificationStatus({ notification }: NotificationSentProps) {
  console.log("notification", notification);
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
    <div className="flex flex-col p-2 rounded-md border bg-muted/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {notification.type === "email" ? (
            <Mail className="h-4 w-4 text-muted-foreground" />
          ) : notification.type === "sms" ? (
            <Phone className="h-4 w-4 text-muted-foreground" />
          ) : (
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <div className="text-sm">{formattedRecipient}</div>
            <div className="text-xs text-muted-foreground">Sent at {sentTime}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notification.acknowledged ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 gap-1 border-green-200">
              <CheckCircle2 className="h-3 w-3" />
              Acknowledged
            </Badge>
          ) : (
            <Badge variant={notification.status === "success" ? "outline" : "destructive"} className={notification.status === "success" ? "gap-1" : "gap-1"}>
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
        <div className="mt-1 ml-6 text-xs flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Acknowledged on {acknowledgedTime} by {notification.contact.name}</span>
        </div>
      )}
    </div>
  );
}

// Helper function to format phone numbers
function formatPhoneNumber(phone: string): string {
  // Basic phone formatting - this can be enhanced based on your needs
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
  
  // Return original if no formatting applies
  return phone;
}