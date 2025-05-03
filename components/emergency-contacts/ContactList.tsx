import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ContactCard from "./ContactCard";
import ContactForm from "./ContactForm";

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

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const { toast } = useToast();

  // Convert fetchContacts to useCallback to use in dependency array
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/contacts");
      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }
      const data = await response.json();
      setContacts(data.contacts);
      setError(null);
    } catch (err) {
      setError("Error loading contacts. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load emergency contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      // Remove the deleted contact from state
      setContacts(contacts.filter(contact => contact.id !== id));
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (contact: Contact) => {
    // Make sure we're passing the complete contact object with notificationPreferences
    setEditingContact({
      ...contact,
      notificationPreferences: contact.notificationPreferences || {
        email: false,
        sms: false,
        voice: false
      }
    });
    setShowForm(true);
  };

  const handleSetPrimary = async (id: string) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPrimaryContact: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to update primary contact");
      }

      // Refresh contacts after update
      await fetchContacts();
      toast({
        title: "Success",
        description: "Primary contact updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update primary contact",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (formData: Omit<Contact, "id">) => {
    try {
      if (editingContact) {
        // Update existing contact
        const response = await fetch(`/api/contacts/${editingContact.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to update contact");
        }

        toast({
          title: "Success",
          description: "Contact updated successfully",
        });
      } else {
        // Add new contact
        const response = await fetch("/api/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to add contact");
        }

        toast({
          title: "Success",
          description: "Contact added successfully",
        });
      }

      // Refresh contacts and reset form
      await fetchContacts();
      setShowForm(false);
      setEditingContact(null);
    } catch (err) {
      toast({
        title: "Error",
        description: editingContact ? "Failed to update contact" : "Failed to add contact",
        variant: "destructive",
      });
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading emergency contacts...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Emergency Contacts</CardTitle>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Add Contact</Button>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/15 text-destructive p-4 mb-4 rounded-md">
            {error}
          </div>
        )}

        {showForm ? (
          <ContactForm 
            onSubmit={handleFormSubmit} 
            onCancel={handleCancelForm} 
            initialData={editingContact || undefined}
          />
        ) : (
          <>
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No emergency contacts found</p>
                <Button onClick={() => setShowForm(true)}>Add Your First Contact</Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {contacts.map((contact) => (
                  <ContactCard 
                    key={contact.id}
                    contact={contact}
                    onDelete={() => handleDelete(contact.id)}
                    onEdit={() => handleEdit(contact)}
                    onSetPrimary={() => handleSetPrimary(contact.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}