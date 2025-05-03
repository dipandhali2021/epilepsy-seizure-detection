import { Metadata } from "next";
import { TestAlert } from "@/components/alerts/TestAlert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Test Alert System",
  description: "Test your epilepsy alert notification system",
};

export default function TestAlertPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mt-4">Test Alert System</h1>
          <p className="text-muted-foreground">
            Test your epilepsy prediction notification system to ensure it works properly
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <TestAlert />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Before Testing</CardTitle>
            <CardDescription>
              Make sure you&apos;ve completed these steps before testing alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">✓ Add Emergency Contacts</h3>
                <p className="text-sm text-muted-foreground">
                  Ensure you&apos;ve added at least one emergency contact. 
                  Designating a primary contact is recommended.
                </p>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">✓ Set Up Device ID</h3>
                <p className="text-sm text-muted-foreground">
                  Check that you have a valid device ID generated. 
                  This ID links your Raspberry Pi to your account.
                </p>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">✓ Inform Your Contacts</h3>
                <p className="text-sm text-muted-foreground">
                  Let your emergency contacts know that you&apos;re planning to test the system,
                  so they&apos;re aware that any alerts they receive are just tests.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 text-blue-800 p-4 rounded-md border border-blue-200">
              <h4 className="font-medium mb-1">What happens during a test?</h4>
              <p className="text-sm">
                When you send a test alert, the system simulates a seizure prediction from your device. 
                Your emergency contacts will receive notifications via email and SMS (if configured), just as they
                would during an actual alert. You can use this to verify the entire notification pipeline works correctly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}