import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="relationship">Relationship</Label>
        <Input
          id="relationship"
          name="relationship"
          value={formData.relationship}
          onChange={handleChange}
          placeholder="Parent, Spouse, Sibling, etc."
        />
        {errors.relationship && (
          <p className="text-sm text-destructive">{errors.relationship}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPrimaryContact"
          checked={formData.isPrimaryContact}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isPrimaryContact: checked === true }))
          }
        />
        <Label htmlFor="isPrimaryContact" className="font-normal">
          Set as primary emergency contact
        </Label>
      </div>

      <div className="space-y-2 border rounded-md p-4 mt-4">
        <Label className="font-medium mb-2 block">Notification Preferences</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="emailPref"
              checked={formData.notificationPreferences?.email || false}
              onCheckedChange={(checked) => handleNotificationPrefChange("email", checked === true)}
            />
            <Label htmlFor="emailPref" className="font-normal">
              Email Notifications
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="smsPref"
              checked={formData.notificationPreferences?.sms || false}
              onCheckedChange={(checked) => handleNotificationPrefChange("sms", checked === true)}
            />
            <Label htmlFor="smsPref" className="font-normal">
              SMS Notifications
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="voicePref"
              checked={formData.notificationPreferences?.voice || false}
              onCheckedChange={(checked) => handleNotificationPrefChange("voice", checked === true)}
            />
            <Label htmlFor="voicePref" className="font-normal">
              Voice Call Notifications
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Contact" : "Add Contact"}
        </Button>
      </div>
    </form>
  );
}