import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ContactCard from "./ContactCard";
import ContactForm from "./ContactForm";
import { PlusCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const listVariants = {
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
    transition: { duration: 0.4 }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

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
    return (
      <Card className="w-full border-0 bg-transparent shadow-none">
        <CardHeader className="flex flex-row items-center justify-between p-6">
          <div className="h-7 w-32 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="h-10 bg-slate-50 dark:bg-slate-900 rounded-lg animate-pulse" />
                    <div className="h-10 bg-slate-50 dark:bg-slate-900 rounded-lg animate-pulse" />
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-muted rounded mr-3 animate-pulse" />
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-4 flex justify-between">
                  <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 bg-transparent shadow-none">
      <CardHeader className="flex flex-row items-center justify-between p-6">
        <CardTitle className="text-xl font-semibold">Your Contacts</CardTitle>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="h-5 w-5" />
            Add Contact
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-200 text-red-800 p-4 mb-6 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
            >
              <ContactForm 
                onSubmit={handleFormSubmit} 
                onCancel={handleCancelForm}
                initialData={editingContact || undefined}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {contacts.length === 0 ? (
                <motion.div 
                  variants={itemVariants}
                  className="text-center py-12 px-4"
                >
                  <div className="mb-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <PlusCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No contacts yet</h3>
                  <p className="text-muted-foreground mb-6">Add your first emergency contact to get started</p>
                  <Button onClick={() => setShowForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="h-5 w-5" />
                    Add Your First Contact
                  </Button>
                </motion.div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {contacts.map((contact) => (
                    <motion.div
                      key={contact.id}
                      variants={itemVariants}
                      layout
                    >
                      <ContactCard 
                        contact={contact}
                        onDelete={() => handleDelete(contact.id)}
                        onEdit={() => handleEdit(contact)}
                        onSetPrimary={() => handleSetPrimary(contact.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}