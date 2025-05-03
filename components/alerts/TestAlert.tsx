"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertOctagon, AlertTriangle, CheckCircle, PlayCircle, Phone, Mail, MessageSquare, Info } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Test Alert System
        </CardTitle>
        <CardDescription>
          Send a test alert to verify your emergency contact notification system is working properly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p className="mb-4">
            This will send a simulated seizure prediction alert from your device to all your emergency contacts.
            Use this feature to:
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Verify that your contacts receive notifications</li>
            <li>Test the acknowledgment system</li>
            <li>Ensure your device ID is properly configured</li>
          </ul>
          <p className="text-amber-600 font-semibold mb-6">
            Important: Please inform your emergency contacts before testing so they don&apos;t get unnecessarily alarmed.
          </p>
          
          <div className="bg-blue-50 rounded-md p-4 border border-blue-100 mb-6">
            <div className="flex items-start">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">About SMS Messages</h4>
                <p className="text-xs text-blue-800">
                  Messages sent from a Twilio trial account will include &qout;Sent from your Twilio trial account&qout; 
                  in the message body. To remove this message, you&apos;ll need to upgrade to a paid Twilio account.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="font-medium mb-2">Select notification type to test:</p>
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
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <AlertTriangle className="mb-2 h-5 w-5" />
                  All
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="sms" id="sms" className="peer sr-only" />
                <Label
                  htmlFor="sms"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <MessageSquare className="mb-2 h-5 w-5" />
                  SMS
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="email" id="email" className="peer sr-only" />
                <Label
                  htmlFor="email"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Mail className="mb-2 h-5 w-5" />
                  Email
                </Label>
              </div>
              
              <div>
                <RadioGroupItem value="voice" id="voice" className="peer sr-only" />
                <Label
                  htmlFor="voice"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Phone className="mb-2 h-5 w-5" />
                  Voice Call
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        {result && (
          <div className={`mt-6 p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertOctagon className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  {result.success ? 'Alert Test Successful' : 'Alert Test Failed'}
                </h3>
                <div className="mt-2 text-sm">
                  {result.success ? (
                    <>
                      <p className="mb-1">{result.message}</p>
                      {result.alertId && (
                        <p className="mb-1"><span className="font-semibold">Alert ID:</span> {result.alertId}</p>
                      )}
                      {result.deviceId && (
                        <p><span className="font-semibold">Device ID:</span> {result.deviceId}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-red-700">{result.error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={sendTestAlert} 
          disabled={isLoading} 
          className="w-full"
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          {isLoading ? 'Sending Test Alert...' : 'Send Test Alert'}
        </Button>
      </CardFooter>
    </Card>
  );
}