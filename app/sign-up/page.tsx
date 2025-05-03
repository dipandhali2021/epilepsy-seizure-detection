"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, BrainCircuit, ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const signUpImage = "/helmet-side.png"; // Replace with your image path

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-background">
        <div className="animate-pulse text-blue-500 flex flex-col items-center">
          <BrainCircuit className="h-12 w-12 mb-4" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2));
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  }

  async function onPressVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status !== "complete") {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2));
      const error = err as { errors?: Array<{ message: string }> };
      setError(error.errors?.[0]?.message || "An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  }

  async function signUpWithGoogle() {
    if (!isLoaded) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      console.error("error", err);
      const error = err as { message?: string };
      setError(error.message || "Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-background overflow-hidden">
      <div className="flex flex-col md:flex-row w-full items-center">
        {/* Left side - Image */}
        <motion.div 
          className="hidden md:block md:w-1/2 h-screen bg-blue-600/5 dark:bg-slate-800/20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="relative h-full w-full p-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 dark:from-blue-900/20 dark:to-indigo-900/10"></div>
            
            <div className="relative w-full max-w-lg">
              <motion.div
                className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-30 animate-blob"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 10, 0] }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
              ></motion.div>
              <motion.div
                className="absolute top-10 -right-4 w-72 h-72 bg-indigo-300 dark:bg-indigo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-30 animate-blob animation-delay-2000"
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.4, 1], rotate: [0, -10, 0] }}
                transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
              ></motion.div>
              <motion.div
                className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-30 animate-blob animation-delay-4000"
                initial={{ scale: 0.8 }}
                animate={{ scale: [1.2, 0.8, 1.2], rotate: [0, 5, 0] }}
                transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
              ></motion.div>
              
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <Image 
                    src={signUpImage} 
                    alt="EpiCap System" 
                    width={600} 
                    height={600}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
                </div>
                
                <motion.div 
                  className="absolute bottom-5 left-5 right-5 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <h3 className="text-xl font-bold text-white mb-2">Join Our Community</h3>
                  <p className="text-white/80 text-sm">
                    Get access to our advanced epilepsy prediction system and help us improve lives.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Right side - Sign Up Form */}
        <motion.div 
          className="w-full md:w-1/2 px-6 py-10 md:py-20 flex justify-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="w-full max-w-md border-slate-200 dark:border-slate-700 shadow-xl">
            <CardHeader className="space-y-2">
              <div className="flex justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BrainCircuit className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">
                Sign Up for EpiCap
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Create an account to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!pendingVerification ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2 py-5 border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 transition-all"
                      onClick={signUpWithGoogle}
                      disabled={isLoading}
                    >
                      <Image 
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                        alt="Google logo" 
                        width={18} 
                        height={18} 
                      />
                      <span>Continue with Google</span>
                    </Button>
                  </motion.div>

                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </motion.div>

                  <motion.form 
                    onSubmit={submit} 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input
                        type="email"
                        id="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        required
                        disabled={isLoading}
                        className="py-6"
                        placeholder="name@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="py-6"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Password must be at least 8 characters long.
                      </p>
                    </div>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert variant="destructive" className="text-sm">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Creating account...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </motion.form>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      We&apos;ve sent a verification code to <strong>{emailAddress}</strong>. Please check your inbox and enter the code below.
                    </p>
                  </div>
                  
                  <form onSubmit={onPressVerify} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-sm font-medium">Verification Code</Label>
                      <Input
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter the 6-digit code"
                        required
                        disabled={isLoading}
                        className="py-6 text-center text-lg tracking-widest"
                        maxLength={6}
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Verifying...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Verify Email <Check className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                    
                    <div className="text-center mt-4">
                      <button 
                        type="button" 
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={() => setPendingVerification(false)}
                        disabled={isLoading}
                      >
                        &larr; Back to sign up
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
