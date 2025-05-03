"use client";

import { motion } from "framer-motion";
import { ShieldIcon } from "lucide-react";
import DeviceStatus from "@/components/dashboard/DeviceStatus";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function DevicePage() {
  const [apiEndpoint, setApiEndpoint] = useState("");

  useEffect(() => {
    setApiEndpoint(`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/device-alert`);
  }, []);

  return (
    <div className="container mx-auto px-4 max-w-6xl py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <ShieldIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Device Management</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Configure and monitor your epilepsy prediction device
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          <DeviceStatus />

          <motion.div
            className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h4 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-400">
                  Connection Instructions
                </h4>
                <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm">
                  Send predictions from your Raspberry Pi to this endpoint:
                </p>
                
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md font-mono text-xs overflow-x-auto mb-4">
                  POST {apiEndpoint}
                </div>

                <p className="text-slate-700 dark:text-slate-300 mb-2 text-sm">
                  Format:
                </p>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md font-mono text-xs overflow-x-auto">
                  {`{"device_id": "DEV-DERZK4", "timestamp": "2025-05-02T12:00:00Z", "prediction": 1}`}
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="relative h-48 w-full">
                  <Image 
                    src="/circuit_diagram.png" 
                    alt="Device Connection Diagram" 
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
