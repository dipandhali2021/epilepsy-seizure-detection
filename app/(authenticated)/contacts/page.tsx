"use client";

import { motion } from "framer-motion";
import ContactList from "@/components/emergency-contacts/ContactList";
import { UserCircleIcon } from "lucide-react";

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

export default function ContactsPage() {
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
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
              <div className="shrink-0">
                <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <UserCircleIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className="text-center lg:text-left flex-1">
                <div className="inline-flex items-center mb-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  Emergency Contact Management
                </div>
                <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">
                  Emergency Contacts
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage your emergency contacts for alerts and notifications
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700"
          >
            <ContactList />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}