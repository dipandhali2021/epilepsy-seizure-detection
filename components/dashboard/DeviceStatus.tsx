import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { 
  CircuitBoard, 
  WifiIcon, 
  WifiOffIcon,
  RefreshCwIcon,
  ClipboardIcon,
  PlusCircleIcon,
  ArrowBigRight
} from "lucide-react";

export default function DeviceStatus() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [lastActive, setLastActive] = useState<Date | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    const fetchDeviceStatus = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch the user's device ID from the database
        const response = await fetch(`/api/users/device-info?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.deviceId) {
            setDeviceId(data.deviceId);
            
            // Set last active time if provided
            if (data.lastActive) {
              setLastActive(new Date(data.lastActive));
            } else {
              // Default to current time as fallback
              setLastActive(new Date());
            }
          }
        }
      } catch (error) {
        console.error("Error fetching device status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceStatus();
  }, [user]);

  const copyDeviceId = () => {
    if (!deviceId) return;
    
    navigator.clipboard.writeText(deviceId);
    toast({
      title: "Copied",
      description: "Device ID copied to clipboard",
    });
  };

  const refreshDeviceStatus = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/users/device-info?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.deviceId) {
          setDeviceId(data.deviceId);
          
          // Update last active time if provided
          if (data.lastActive) {
            setLastActive(new Date(data.lastActive));
          }
        }
        toast({
          title: "Status Updated",
          description: "Device status has been refreshed.",
        });
      }
    } catch (error) {
      console.error("Error refreshing device status:", error);
      toast({
        title: "Update Failed",
        description: "Could not refresh device status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDeviceId = async (regenerate: boolean = false) => {
    if (!user) return;
    
    try {
      setGenerating(true);
      
      const response = await fetch('/api/users/generate-device-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          regenerate: regenerate
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.deviceId) {
          setDeviceId(data.deviceId);
          setLastActive(new Date());
          
          toast({
            title: regenerate ? "Device ID Regenerated" : "Device ID Generated",
            description: `Your device ID has been ${regenerate ? 're' : ''}generated successfully.`,
          });
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate device ID");
      }
    } catch (error) {
      console.error(`Error ${regenerate ? 're' : ''}generating device ID:`, error);
      toast({
        title: `${regenerate ? 'Re-g' : 'G'}eneration Failed`,
        description: `Failed to ${regenerate ? 're' : ''}generate device ID. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = () => {
    if (!deviceId) {
      return (
        <Badge variant="outline" className="bg-gray-200">
          Not Registered
        </Badge>
      );
    }

    if (lastActive) {
      const now = new Date();
      const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 1) {
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <WifiIcon className="h-3 w-3 mr-1" />
            Online
          </Badge>
        );
      } else if (diffHours < 24) {
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <WifiIcon className="h-3 w-3 mr-1" />
            Idle ({Math.floor(diffHours)}h ago)
          </Badge>
        );
      }
    }
    
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
        <WifiOffIcon className="h-3 w-3 mr-1" />
        Offline
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            <CircuitBoard className="h-5 w-5 mr-2" /> 
            Epilepsy Prediction Device
          </span>
          <Button
            variant="outline" 
            size="icon" 
            onClick={refreshDeviceStatus}
            disabled={loading || generating}
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading || generating ? (
          <div className="flex justify-center py-4">
            <RefreshCwIcon className="h-5 w-5 animate-spin" />
          </div>
        ) : deviceId ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Status</div>
              <div>{getStatusBadge()}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Device ID</div>
              <div className="flex items-center">
                <code className="bg-muted px-2 py-1 rounded text-sm flex-grow">
                  {deviceId}
                </code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={copyDeviceId}
                  className="ml-2"
                >
                  <ClipboardIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-end mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => generateDeviceId(true)}
                  className="text-xs"
                  disabled={generating}
                >
                  <ArrowBigRight className="h-3 w-3 mr-1" />
                  Regenerate ID
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use this ID to configure your Raspberry Pi device
              </p>
            </div>
            
            {lastActive && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Last Active</div>
                <div>
                  {lastActive.toLocaleString(undefined, { 
                    dateStyle: 'medium', 
                    timeStyle: 'short' 
                  })}
                </div>
              </div>
            )}

            <div className="pt-4">
              <h3 className="font-medium mb-2">Connect Your Device</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Send predictions from your Raspberry Pi to this endpoint:
              </p>
              <code className="bg-muted p-2 text-xs block rounded overflow-x-auto">
                POST {process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/device-alert
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Format: {`{ "device_id": "${deviceId}", "timestamp": "2025-05-02T12:00:00Z", "prediction": 1 }`}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-muted-foreground mb-4">
              No prediction device registered yet
            </p>
            <Button 
              onClick={() => generateDeviceId(false)}
              disabled={generating}
              className="mb-4"
            >
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Generate Device ID
            </Button>
            <p className="text-xs text-muted-foreground">
              A device ID is needed to connect your Raspberry Pi to the epilepsy prediction system
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}