import { Metadata } from "next";
import Link from "next/link";
import { AlertList } from "@/components/alerts/AlertList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Alerts",
  description: "View and manage your epilepsy prediction alerts",
};

export default function AlertsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            View and manage your epilepsy prediction alerts
          </p>
        </div>
        <Link href="/alerts/test">
          <Button variant="secondary" className="gap-2">
            <PlayCircle className="h-4 w-4" />
            Test Alert System
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="onsets">Seizure Onsets</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <AlertList filterType={null} />
        </TabsContent>
        <TabsContent value="predictions" className="mt-6">
          <AlertList filterType="prediction" />
        </TabsContent>
        <TabsContent value="onsets" className="mt-6">
          <AlertList filterType="onset" />
        </TabsContent>
      </Tabs>
    </div>
  );
}