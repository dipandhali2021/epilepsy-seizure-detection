"use client";

import { motion } from "framer-motion";
import ContactList from "@/components/emergency-contacts/ContactList";
import { UserCircleIcon } from "lucide-react";

export default function ContactsPage() {
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
            <UserCircleIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Emergency Contacts</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your emergency contacts for alerts and notifications
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          <ContactList />
        </div>
      </motion.div>
    </div>
  );
}