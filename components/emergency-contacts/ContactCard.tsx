import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MailIcon, PhoneIcon, Pencil, Trash2, StarIcon, Bell, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  isPrimaryContact: boolean;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    voice: boolean;
  };
}

interface ContactCardProps {
  contact: Contact;
  onDelete: () => void;
  onEdit: () => void;
  onSetPrimary: () => void;
}

export default function ContactCard({ contact, onDelete, onEdit, onSetPrimary }: ContactCardProps) {
  return (
    <Card className="group overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-lg flex items-center gap-2">
              {contact.name}
              {contact.isPrimaryContact && (
                <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Crown className="h-3 w-3 mr-1" />
                  Primary
                </Badge>
              )}
            </h3>
            <p className="text-muted-foreground text-sm">{contact.relationship}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
            <MailIcon className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400" />
            <span className="text-sm flex-1">{contact.email}</span>
          </div>
          <div className="flex items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
            <PhoneIcon className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400" />
            <span className="text-sm flex-1">{contact.phone}</span>
          </div>
        </div>
          
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <Bell className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400" />
            <span className="text-sm mr-3">Notifications:</span>
            <div className="flex gap-2">
              {contact.notificationPreferences?.email && (
                <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-0">Email</Badge>
              )}
              {contact.notificationPreferences?.sms && (
                <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-0">SMS</Badge>
              )}
              {contact.notificationPreferences?.voice && (
                <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-0">Voice</Badge>
              )}
              {!contact.notificationPreferences?.email && 
                !contact.notificationPreferences?.sms && 
                !contact.notificationPreferences?.voice && (
                <span className="text-xs text-muted-foreground">None enabled</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50 dark:bg-slate-900 p-4 flex justify-between opacity-80 group-hover:opacity-100 transition-opacity">
        <div>
          {!contact.isPrimaryContact && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSetPrimary}
              className="gap-2 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50"
            >
              <Crown className="h-4 w-4" />
              Set Primary
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete}
            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}