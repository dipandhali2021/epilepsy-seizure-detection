"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BadgeCheck, BrainCircuit, ShieldAlert, Users } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24 bg-gradient-to-b from-background to-muted">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-full inline-flex items-center mb-6 text-sm font-medium">
            <BrainCircuit className="mr-2 h-4 w-4" />
            Powered by advanced neural network models
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Epilepsy Prediction System
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            An advanced early warning system that helps predict and detect epileptic seizures before they occur, providing critical time for intervention.
          </p>
          
          {!isSignedIn ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-md px-8">
                <Link href="/sign-up">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-md px-8">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>
          ):(
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild  variant="outline" size="lg" className="text-md px-8">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <ShieldAlert className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Early Detection</h3>
              <p className="text-muted-foreground">
                Our system can predict seizures up to 30 minutes before they occur, giving valuable time for preparation and intervention.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Emergency Contacts</h3>
              <p className="text-muted-foreground">
                Automatically notify caregivers and emergency contacts through SMS and email when a seizure is predicted or detected.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <BadgeCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Acknowledgment System</h3>
              <p className="text-muted-foreground">
                Track when emergency contacts have seen and acknowledged alerts, ensuring someone is responding to the situation.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 px-6 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  [Device Illustration]
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Connect Your Device</h3>
                  <p className="text-muted-foreground">
                    Our system uses a Raspberry Pi connected to an EEG device to monitor brain activity patterns and detect pre-seizure states.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="font-bold text-blue-600">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Set Up Emergency Contacts</h3>
                  <p className="text-muted-foreground">
                    Add family members, caregivers, or medical professionals as emergency contacts who will be notified in case of a predicted seizure.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="font-bold text-blue-600">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Receive Timely Alerts</h3>
                  <p className="text-muted-foreground">
                    When the system detects a potential seizure, it automatically sends alerts to you and your emergency contacts through multiple channels.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="font-bold text-blue-600">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Track Response</h3>
                  <p className="text-muted-foreground">
                    The system tracks when alerts are seen and acknowledged, ensuring that someone is responding to the situation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-6 bg-blue-50 dark:bg-blue-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who are already using our system to help manage epilepsy more effectively.
          </p>
          {isSignedIn ? (
            <Button asChild size="lg" className="text-md px-8">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="text-md px-8">
              <Link href="/sign-up">Create Your Account</Link>
            </Button>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-6 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="font-bold text-lg">Epilepsy Prediction System</h3>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
          
          <div className="flex gap-6">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
