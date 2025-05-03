"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Stats from "@/components/dashboard/Stats";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import DeviceStatus from "@/components/dashboard/DeviceStatus";
import { 
  BrainCircuit, 
  ActivityIcon,
} from "lucide-react";
import Image from "next/image";

// Animation variants
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

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-background pt-6 pb-16">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full -translate-y-1/4 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full translate-y-1/4 -translate-x-1/4"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header with info card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
              <div className="shrink-0">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/30 border-4 border-white dark:border-slate-700 shadow-md">
                  {user?.imageUrl ? (
                    <Image 
                      src={user.imageUrl} 
                      alt={user?.firstName || "Profile"} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-blue-600 text-white text-2xl font-bold">
                      {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center lg:text-left flex-1">
                <div className="inline-flex items-center mb-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <BrainCircuit className="w-3 h-3 mr-1" /> Epilepsy Prediction System
                </div>
                <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">
                  Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0]}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Monitor and manage your epilepsy prediction device
                </p>
              </div>
              
              <div className="hidden lg:block">
                <motion.div 
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">System Active</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Stats and Activity */}
            <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
              <Stats />
              
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-700 dark:text-blue-400">
                  <ActivityIcon className="mr-2 h-5 w-5" />
                  Recent Alerts
                </h3>
                <RecentAlerts />
              </motion.div>
            </motion.div>

            {/* Right Column - Quick Links and Device Status */}
            <motion.div variants={itemVariants} className="lg:col-span-4 space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
                
                <DeviceStatus />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


