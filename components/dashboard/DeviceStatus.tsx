import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CircuitBoard, 
  WifiIcon, 
  WifiOffIcon,
  RefreshCwIcon,
  ClipboardIcon,
  PlusCircleIcon,
  ArrowBigRight,
  Sparkle
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
        const response = await fetch(`/api/users/device-info?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.deviceId) {
            setDeviceId(data.deviceId);
            if (data.lastActive) {
              setLastActive(new Date(data.lastActive));
            } else {
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
        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
          Not Registered
        </Badge>
      );
    }

    if (lastActive) {
      const now = new Date();
      const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 1) {
        return (
          <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 animate-pulse">
            <WifiIcon className="h-3 w-3 mr-1" />
            Online
          </Badge>
        );
      } else if (diffHours < 24) {
        return (
          <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
            <WifiIcon className="h-3 w-3 mr-1" />
            Idle ({Math.floor(diffHours)}h ago)
          </Badge>
        );
      }
    }
    
    return (
      <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
        <WifiOffIcon className="h-3 w-3 mr-1" />
        Offline
      </Badge>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900/50 border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <motion.span 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CircuitBoard className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" /> 
            Device Status
          </motion.span>
          <Button
            variant="outline" 
            size="icon" 
            onClick={refreshDeviceStatus}
            disabled={loading || generating}
            className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {loading || generating ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex justify-center py-8"
            >
              <RefreshCwIcon className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
            </motion.div>
          ) : deviceId ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-600 dark:text-slate-400">Connection Status</div>
                <div>{getStatusBadge()}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-slate-600 dark:text-slate-400">Device ID</div>
                <div className="flex items-center">
                  <motion.code 
                    className="bg-gradient-to-r from-slate-100 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 px-3 py-1.5 rounded-lg text-sm flex-grow border border-slate-200 dark:border-slate-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {deviceId}
                  </motion.code>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={copyDeviceId}
                    className="ml-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ClipboardIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => generateDeviceId(true)}
                    className="text-xs bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                    disabled={generating}
                  >
                    <ArrowBigRight className="h-3 w-3 mr-1" />
                    Regenerate ID
                  </Button>
                </div>
                <motion.p 
                  className="text-xs text-slate-500 dark:text-slate-400 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Use this ID to configure your Raspberry Pi device
                </motion.p>
              </div>
              
              {lastActive && (
                <motion.div 
                  className="space-y-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-sm text-slate-600 dark:text-slate-400">Last Active</div>
                  <div className="flex items-center gap-2">
                    <Sparkle className="h-3 w-3 text-blue-500" />
                    <span>
                      {lastActive.toLocaleString(undefined, { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      })}
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 text-center"
            >
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                No prediction device registered yet
              </p>
              <Button 
                onClick={() => generateDeviceId(false)}
                disabled={generating}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 mb-4"
              >
                <PlusCircleIcon className="h-4 w-4 mr-2" />
                Generate Device ID
              </Button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A device ID is needed to connect your Raspberry Pi to the epilepsy prediction system
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}