"use client";

import { useEffect } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

export default function SSOCallback() {
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isSignInLoaded || !isSignUpLoaded) {
      return;
    }

    // Handle the sign in flow
    async function handleCallback() {
      try {
        // Get the OAuth verification from the URL 
        const verification = searchParams.get('__clerk_status') === 'complete';
        
        if (!verification) {
          console.error("OAuth verification failed");
          router.push("/sign-in?error=oauth_verification_failed");
          return;
        }
        
        if (signIn && signIn.status === "complete") {
          // Set the session active if sign-in is complete
          await setSignInActive({ session: signIn.createdSessionId });
          router.push("/dashboard");
          return;
        }
        
        if (signUp && signUp.status === "complete") {
          // Set the session active if sign-up is complete
          await setSignUpActive({ session: signUp.createdSessionId });
          router.push("/dashboard");
          return;
        }
        
        // If neither sign-in nor sign-up is complete, redirect to sign-in
        router.push("/sign-in?error=incomplete_authentication");
      } catch (err) {
        console.error("Authentication error:", err);
        router.push("/sign-in?error=oauth_callback_failed");
      }
    }

    handleCallback();
  }, [isSignInLoaded, isSignUpLoaded, signIn, signUp, setSignInActive, setSignUpActive, router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        <h1 className="text-xl font-semibold">Processing authentication...</h1>
        <p className="text-muted-foreground">You will be redirected shortly</p>
      </div>
    </div>
  );
}