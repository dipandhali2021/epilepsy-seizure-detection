"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BadgeCheck, BrainCircuit, ShieldAlert, Users, ArrowRight, ChevronRight } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const { isSignedIn } = useAuth();
  
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero Section with blended model and text */}
      <section className="relative min-h-[100vh] flex items-center">
        {/* Full-screen 3D model as background - shifted to the right */}
        <div className="absolute inset-0 z-0 flex justify-end">
          <div className="w-full lg:w-2/3 h-full relative right-0">
            <iframe 
              src='https://my.spline.design/untitled-F5HwPA2LYHaIvSIYXe8uEPtm/?zoom=1.7&cameraPosition=-20,-1,2&cameraTarget=0,0,0' 
              frameBorder='0' 
              width='100%' 
              height='100%'
              title="Spline 3D Model Background"
              className="w-full h-full"
            ></iframe>
          </div>
          
          {/* Gradient overlay - lighter and more white */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent z-10 dark:from-slate-900/90 dark:via-slate-800/60"></div>
        </div>
        
        {/* Content overlay */}
        <div className="container mx-auto px-6 z-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6 text-slate-800 dark:text-white"
            >
              <motion.div 
                className="bg-blue-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-full inline-flex items-center mb-2 text-sm font-medium border border-blue-400/30"
                variants={fadeIn}
              >
                <BrainCircuit className="mr-2 h-4 w-4" />
                Powered by advanced neural network models
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-800 dark:text-white"
                variants={fadeIn}
              >
                <span className="text-blue-500 dark:text-blue-300">EpiCap</span>  - Epilepsy Prediction System
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-slate-600 dark:text-slate-300"
                variants={fadeIn}
              >
                An advanced early warning system that helps predict and detect epileptic seizures before they occur, providing critical time for intervention.
              </motion.p>

              <motion.p 
                className="text-lg md:text-xl font-medium text-blue-600 dark:text-blue-300 italic"
                variants={fadeIn}
              >
                "Sleep, snack, and study in peace—EpiCap's your personal seizure shield."
              </motion.p>
              
              <motion.div variants={fadeIn} className="pt-4">
                {!isSignedIn ? (
                  <div className="flex flex-wrap gap-4">
                    <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8">
                      <Link href="/sign-up" className="flex items-center">
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-blue-400 text-blue-600 dark:text-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-8">
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                  </div>
                ) : (
                  <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8">
                    <Link href="/dashboard" className="flex items-center">
                      Go to Dashboard <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </motion.div>
            </motion.div>
            
            <div className="hidden lg:block">
              {/* Intentionally left blank for layout balance */}
            </div>
          </div>
        </div>

                
      </section>

      {/* Features Section with floating cards */}
      <section className="bg-white dark:bg-slate-900 py-24 px-6 relative">
        <div className="container mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Key Features
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-500 hover:shadow-blue-500/10 hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 rotate-3">
                <ShieldAlert className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Early Detection</h3>
              <p className="text-muted-foreground">
                Our system can predict seizures up to 30 minutes before they occur, giving valuable time for preparation and intervention.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-500 hover:shadow-blue-500/10 hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 rotate-3">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Emergency Contacts</h3>
              <p className="text-muted-foreground">
                Automatically notify caregivers and emergency contacts through SMS and email when a seizure is predicted or detected.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-500 hover:shadow-blue-500/10 hover:-translate-y-1 md:col-span-2 lg:col-span-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 rotate-3">
                <BadgeCheck className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Acknowledgment System</h3>
              <p className="text-muted-foreground">
                Track when emergency contacts have seen and acknowledged alerts, ensuring someone is responding to the situation.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Technology Section with frosted glass effect */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-black py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-2">
              <motion.div 
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-5"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square relative rounded-xl overflow-hidden">
                    <Image 
                      src="/circuit_diagram.png" 
                      alt="Circuit Diagram" 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="aspect-square relative rounded-xl overflow-hidden">
                    <Image 
                      src="/bioamp.png" 
                      alt="BioAmp Device" 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="aspect-square relative rounded-xl overflow-hidden">
                    <Image 
                      src="/rasberry_pi_pin.png" 
                      alt="Raspberry Pi" 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="aspect-square relative rounded-xl overflow-hidden">
                    <Image 
                      src="/model_architecture.png" 
                      alt="Model Architecture" 
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="md:col-span-3 space-y-8">
              {[1, 2, 3, 4].map((step, index) => (
                <motion.div 
                  key={step}
                  className="flex gap-5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{step}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {step === 1 && "Connect Your Device"}
                      {step === 2 && "Set Up Emergency Contacts"}
                      {step === 3 && "Receive Timely Alerts"}
                      {step === 4 && "Track Response"}
                    </h3>
                    <p className="text-muted-foreground">
                      {step === 1 && "Our system uses a Raspberry Pi connected to an EEG device to monitor brain activity patterns."}
                      {step === 2 && "Add family members, caregivers, or medical professionals as emergency contacts."}
                      {step === 3 && "Automatic alerts sent through multiple channels when a potential seizure is detected."}
                      {step === 4 && "Our acknowledgment system ensures someone always responds to alerts."}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* EEG Signal Section with wave effect */}
      <section className="py-24 px-6 bg-white dark:bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-50 to-transparent dark:from-slate-900 dark:to-transparent"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Understanding EEG Signals
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-semibold mb-5 text-blue-600 dark:text-blue-400">Normal EEG Signal</h3>
                <div className="aspect-video relative rounded-xl overflow-hidden">
                  <Image 
                    src="/norma_eeg_signal.png" 
                    alt="Normal EEG Signal" 
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-semibold mb-5 text-red-600">Pre-Seizure (Preictal) EEG Signal</h3>
                <div className="aspect-video relative rounded-xl overflow-hidden">
                  <Image 
                    src="/preictal_eeg_signal.png" 
                    alt="Preictal EEG Signal" 
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.p 
            className="text-center text-muted-foreground mt-10 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our AI model is trained to detect subtle differences between normal brain activity and patterns that precede seizures,
            giving users valuable time to prepare.
          </motion.p>
        </div>
      </section>

      {/* CTA Section with glass morphism */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 z-0"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-indigo-500/20 blur-3xl rounded-full translate-y-1/3 -translate-x-1/4"></div>
        
        <motion.div 
          className="container mx-auto max-w-4xl text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of users who are already using our system to help manage epilepsy more effectively.
            </p>
            {isSignedIn ? (
              <Button asChild size="lg" className="text-md px-10 py-6 bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                <Link href="/dashboard" className="flex items-center">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="text-md px-10 py-6 bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                <Link href="/sign-up" className="flex items-center">
                  Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">EpiCap - Epilepsy Prediction System</h3>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
          
          <div className="flex gap-8">
            <Link href="#" className="text-muted-foreground hover:text-blue-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-blue-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
