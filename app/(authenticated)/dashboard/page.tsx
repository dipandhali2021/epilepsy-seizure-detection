"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Stats from "@/components/dashboard/Stats";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import DeviceStatus from "@/components/dashboard/DeviceStatus";
import ContactList from "@/components/emergency-contacts/ContactList";
import {AlertList} from "@/components/alerts/AlertList";
import { PlusCircleIcon, BellIcon, UserCircleIcon, SettingsIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function Dashboard() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "overview");
  const [apiEndpoint, setApiEndpoint] = useState(`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/device-alert`);

  useEffect(() => {
    // Set the API endpoint for client-side rendering
    console.log("API Endpoint:", apiEndpoint);
    setApiEndpoint(`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/device-alert`);
  }, [apiEndpoint]);

  // Update the active tab when the URL parameter changes
  useEffect(() => {
    if (tabParam && ["overview", "contacts", "alerts", "device"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="container mx-auto p-4 max-w-6xl mb-8">
      <h1 className="text-3xl font-bold mb-2">
        Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
      </h1>
      <p className="text-muted-foreground mb-8">
        Manage your epilepsy prediction device and emergency contacts
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <UserCircleIcon className="h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <BellIcon className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="device" className="flex items-center gap-2">
            <PlusCircleIcon className="h-4 w-4" />
            Device
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Stats />
          <div className="grid gap-6 md:grid-cols-2">
            <RecentAlerts />
            <DeviceStatus />
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <ContactList />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertList filterType={null}/>
        </TabsContent>

        <TabsContent value="device">
          <div className="space-y-6">
            <DeviceStatus />
          
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
