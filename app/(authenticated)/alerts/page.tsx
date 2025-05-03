"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AlertList } from "@/components/alerts/AlertList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, BellIcon, AlertTriangle, Bell } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-background pt-6 pb-16">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-red-500/5 dark:bg-red-500/5 blur-3xl rounded-full -translate-y-1/4 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-amber-500/5 dark:bg-amber-500/5 blur-3xl rounded-full translate-y-1/4 -translate-x-1/4"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
              <div className="shrink-0">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-100 to-red-100 dark:from-amber-900/30 dark:to-red-900/30 flex items-center justify-center">
                  <BellIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              
              <div className="text-center lg:text-left flex-1">
                <div className="inline-flex items-center mb-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  Alert Management System
                </div>
                <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-amber-600 to-red-600 text-transparent bg-clip-text">
                  Alert History
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Track and manage your epilepsy prediction alerts
                </p>
              </div>

              <div className="shrink-0">
                <Link href="/alerts/test">
                  <Button className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white border-0 gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Test Alert System
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700"
          >
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full p-1 bg-slate-100 dark:bg-slate-900 rounded-t-2xl border-b border-slate-200 dark:border-slate-700">
                <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 rounded-xl">
                  <Bell className="h-4 w-4 mr-2" />
                  All Alerts
                </TabsTrigger>
                <TabsTrigger value="predictions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 rounded-xl">
                  <BellIcon className="h-4 w-4 mr-2" />
                  Predictions
                </TabsTrigger>
                <TabsTrigger value="onsets" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 rounded-xl">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Seizure Onsets
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="p-6">
                <AlertList filterType={null} />
              </TabsContent>
              <TabsContent value="predictions" className="p-6">
                <AlertList filterType="prediction" />
              </TabsContent>
              <TabsContent value="onsets" className="p-6">
                <AlertList filterType="onset" />
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}