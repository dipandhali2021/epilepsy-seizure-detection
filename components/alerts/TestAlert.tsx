"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertOctagon, AlertTriangle, CheckCircle, Phone, Mail, MessageSquare, Info, BellRing } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

export function TestAlert() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ 
    success?: boolean; 
    message?: string; 
    alertId?: string;
    deviceId?: string;
    error?: string;
  } | null>(null);
  const [notificationType, setNotificationType] = useState<"all" | "sms" | "email" | "voice">("all");
  
  const { toast } = useToast();

  const sendTestAlert = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      
      const response = await fetch('/api/test/device-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          notificationType 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          alertId: data.alertId,
          deviceId: data.deviceId
        });
        toast({
          title: 'Test Alert Sent',
          description: data.message,
        });
      } else {
        setResult({
          success: false,
          error: data.error || data.details || 'Failed to send test alert'
        });
        toast({
          variant: 'destructive',
          title: 'Alert Test Failed',
          description: data.error || data.details || 'Failed to send test alert',
        });
      }
    } catch (error) {
      console.error('Error sending test alert:', error);
      setResult({
        success: false,
        error: 'An unexpected error occurred'
      });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send test alert due to a system error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BellRing className="h-5 w-5 text-amber-500" />
          Test Alert System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-br from-amber-50 to-red-50 dark:from-amber-900/10 dark:to-red-900/10 p-4 rounded-xl border border-amber-100/50 dark:border-amber-800/20">
          <div className="flex items-start">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">About SMS Messages</h4>
              <p className="text-xs text-amber-700/90 dark:text-amber-400/90">
                Messages sent from a Twilio trial account will include &quot;Sent from your Twilio trial account&quot; 
                in the message body. To remove this message, you&apos;ll need to upgrade to a paid Twilio account.
              </p>
            </div>
          </div>
        </div>
          
        <div>
          <p className="font-medium mb-3">Select notification type to test:</p>
          <RadioGroup 
            defaultValue="all"
            value={notificationType}
            onValueChange={(value) => setNotificationType(value as "all" | "sms" | "email" | "voice")}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            <div>
              <RadioGroupItem value="all" id="all" className="peer sr-only" />
              <Label
                htmlFor="all"
                className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-amber-500 dark:peer-data-[state=checked]:border-amber-400 [&:has([data-state=checked])]:border-amber-500 dark:[&:has([data-state=checked])]:border-amber-400 transition-all"
              >
                <AlertTriangle className="mb-2 h-5 w-5 text-amber-500" />
                All
              </Label>
            </div>
            
            <div>
              <RadioGroupItem value="sms" id="sms" className="peer sr-only" />
              <Label
                htmlFor="sms"
                className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-purple-500 dark:peer-data-[state=checked]:border-purple-400 [&:has([data-state=checked])]:border-purple-500 dark:[&:has([data-state=checked])]:border-purple-400 transition-all"
              >
                <MessageSquare className="mb-2 h-5 w-5 text-purple-500" />
                SMS
              </Label>
            </div>
            
            <div>
              <RadioGroupItem value="email" id="email" className="peer sr-only" />
              <Label
                htmlFor="email"
                className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-blue-500 dark:peer-data-[state=checked]:border-blue-400 [&:has([data-state=checked])]:border-blue-500 dark:[&:has([data-state=checked])]:border-blue-400 transition-all"
              >
                <Mail className="mb-2 h-5 w-5 text-blue-500" />
                Email
              </Label>
            </div>
            
            <div>
              <RadioGroupItem value="voice" id="voice" className="peer sr-only" />
              <Label
                htmlFor="voice"
                className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-green-500 dark:peer-data-[state=checked]:border-green-400 [&:has([data-state=checked])]:border-green-500 dark:[&:has([data-state=checked])]:border-green-400 transition-all"
              >
                <Phone className="mb-2 h-5 w-5 text-green-500" />
                Voice Call
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-xl p-4 border ${
                result.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30 text-green-900 dark:text-green-100' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-900 dark:text-red-100'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                  ) : (
                    <AlertOctagon className="h-5 w-5 text-red-500 dark:text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">
                    {result.success ? 'Alert Test Successful' : 'Alert Test Failed'}
                  </h3>
                  <div className="mt-2 text-sm opacity-90">
                    {result.success ? (
                      <>
                        <p className="mb-1">{result.message}</p>
                        {result.alertId && (
                          <p className="mb-1">
                            <span className="font-semibold">Alert ID:</span> {result.alertId}
                          </p>
                        )}
                        {result.deviceId && (
                          <p>
                            <span className="font-semibold">Device ID:</span> {result.deviceId}
                          </p>
                        )}
                      </>
                    ) : (
                      <p>{result.error}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={sendTestAlert} 
          disabled={isLoading} 
          className="w-full bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white"
        >
          <BellRing className="h-4 w-4 mr-2" />
          {isLoading ? 'Sending Test Alert...' : 'Send Test Alert'}
        </Button>
      </CardFooter>
    </Card>
  );
}