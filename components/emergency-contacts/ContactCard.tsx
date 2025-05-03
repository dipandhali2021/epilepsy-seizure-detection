import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MailIcon, PhoneIcon, Pencil, Trash2, StarIcon, Bell } from "lucide-react";

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
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-lg">{contact.name}</h3>
            <p className="text-muted-foreground text-sm">{contact.relationship}</p>
          </div>
          {contact.isPrimaryContact && (
            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Primary</Badge>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            <MailIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{contact.email}</span>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{contact.phone}</span>
          </div>
          
          <div className="mt-3 pt-3 border-t flex items-center">
            <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm mr-2">Notifications:</span>
            <div className="flex gap-2">
              {contact.notificationPreferences?.email && (
                <Badge variant="outline" className="text-xs">Email</Badge>
              )}
              {contact.notificationPreferences?.sms && (
                <Badge variant="outline" className="text-xs">SMS</Badge>
              )}
              {contact.notificationPreferences?.voice && (
                <Badge variant="outline" className="text-xs">Voice</Badge>
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
      <CardFooter className="bg-muted/50 p-3 flex justify-between">
        <div>
          {!contact.isPrimaryContact && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSetPrimary}
              className="mr-2"
            >
              <StarIcon className="h-4 w-4 mr-1" />
              Set Primary
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}