"use client";

import { motion } from "framer-motion";
import { CircuitBoard, WifiIcon, ServerIcon } from "lucide-react";
import DeviceStatus from "@/components/dashboard/DeviceStatus";
import Image from "next/image";
import { useState, useEffect } from "react";

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

export default function DevicePage() {
  const [apiEndpoint, setApiEndpoint] = useState("");

  useEffect(() => {
    setApiEndpoint(`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/device-alert`);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-background pt-6 pb-16">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-blue-500/5 dark:bg-blue-500/5 blur-3xl rounded-full -translate-y-1/4 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-indigo-500/5 dark:bg-indigo-500/5 blur-3xl rounded-full translate-y-1/4 -translate-x-1/4"></div>
      
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
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                  <CircuitBoard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className="text-center lg:text-left flex-1">
                <div className="inline-flex items-center mb-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  Device Management
                </div>
                <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                  EEG Prediction Device
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Configure and monitor your epilepsy prediction device
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <DeviceStatus />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6"
          >
            <h2 className="flex items-center gap-2 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              <ServerIcon className="h-5 w-5 text-blue-600" />
              API Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-400">
                    Connection Instructions
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm">
                    Send predictions from your Raspberry Pi to this endpoint:
                  </p>
                  
                  <div className="bg-gradient-to-r from-slate-100 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 p-3 rounded-md font-mono text-xs overflow-x-auto mb-4 border border-slate-200 dark:border-slate-700">
                    POST {apiEndpoint}
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 mb-2 text-sm">
                    Format:
                  </p>
                  <div className="bg-gradient-to-r from-slate-100 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 p-3 rounded-md font-mono text-xs overflow-x-auto border border-slate-200 dark:border-slate-700">
                    {`{"device_id": "DEV-XXXXX", "timestamp": "2025-05-02T12:00:00Z", "prediction": 1}`}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
                  <div className="flex items-start gap-2">
                    <WifiIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Connection Status</h4>
                      <p className="text-xs text-blue-700/90 dark:text-blue-400/90">
                        Your device will automatically connect to our servers when properly configured with the device ID
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-[16/9] relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
                  <Image 
                    src="/circuit_diagram.png" 
                    alt="Device Connection Diagram" 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 h-24 w-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-2xl rounded-full"></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
