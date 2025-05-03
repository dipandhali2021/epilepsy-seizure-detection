import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Mail, MessageSquare, PhoneCall, Crown, X } from "lucide-react";

interface Contact {
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

interface ContactFormProps {
  onSubmit: (data: Contact) => void;
  onCancel: () => void;
  initialData?: Contact;
}

export default function ContactForm({ onSubmit, onCancel, initialData }: ContactFormProps) {
  const [formData, setFormData] = useState<Contact>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    relationship: initialData?.relationship || "",
    isPrimaryContact: initialData?.isPrimaryContact || false,
    notificationPreferences: {
      email: initialData?.notificationPreferences?.email ?? true,
      sms: initialData?.notificationPreferences?.sms ?? true,
      voice: initialData?.notificationPreferences?.voice ?? true
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Phone number is invalid (10-15 digits)";
    }
    
    if (!formData.relationship.trim()) {
      newErrors.relationship = "Relationship is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNotificationPrefChange = (type: "email" | "sms" | "voice", checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences!,
        [type]: checked
      }
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-5 w-20 bg-muted rounded animate-pulse" />
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-5 w-28 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
          <div className="h-5 w-5 bg-muted rounded animate-pulse" />
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
        </div>

        <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
          <div className="h-5 w-36 bg-muted rounded animate-pulse" />
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-3 rounded-lg">
                <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                <div className="h-5 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {initialData ? "Edit Contact" : "Add New Contact"}
        </h2>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          className="hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship</Label>
          <Input
            id="relationship"
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
            placeholder="Parent, Spouse, Sibling, etc."
            className={errors.relationship ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.relationship && (
            <p className="text-sm text-red-500">{errors.relationship}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john.doe@example.com"
          className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 123-4567"
          className={errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
        <Checkbox
          id="isPrimaryContact"
          checked={formData.isPrimaryContact}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isPrimaryContact: checked === true }))
          }
        />
        <div className="flex items-center">
          <Crown className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
          <Label htmlFor="isPrimaryContact" className="font-normal">
            Set as primary emergency contact
          </Label>
        </div>
      </div>

      <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
        <Label className="font-medium block">Notification Preferences</Label>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-3 rounded-lg">
            <Checkbox
              id="emailPref"
              checked={formData.notificationPreferences?.email || false}
              onCheckedChange={(checked) => handleNotificationPrefChange("email", checked === true)}
            />
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
              <Label htmlFor="emailPref" className="font-normal">
                Email
              </Label>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-3 rounded-lg">
            <Checkbox
              id="smsPref"
              checked={formData.notificationPreferences?.sms || false}
              onCheckedChange={(checked) => handleNotificationPrefChange("sms", checked === true)}
            />
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
              <Label htmlFor="smsPref" className="font-normal">
                SMS
              </Label>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-3 rounded-lg">
            <Checkbox
              id="voicePref"
              checked={formData.notificationPreferences?.voice || false}
              onCheckedChange={(checked) => handleNotificationPrefChange("voice", checked === true)}
            />
            <div className="flex items-center">
              <PhoneCall className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
              <Label htmlFor="voicePref" className="font-normal">
                Voice Call
              </Label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-slate-200 dark:border-slate-700"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {initialData ? "Update Contact" : "Add Contact"}
        </Button>
      </div>
    </form>
  );
}