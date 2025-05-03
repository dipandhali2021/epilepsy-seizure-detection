import { authMiddleware, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/", 
  "/api/webhook/register", 
  "/sign-in", 
  "/sign-up",
  "/api/device-alert", // Allow Raspberry Pi alerts without auth
  "/api/alerts/acknowledge",
  "/api/voice/status-callback"
   // Make alert acknowledgment endpoint public
];

// Regular expressions for dynamic public routes
const publicPathRegexes = [
  /^\/alerts\/[A-Za-z0-9_-]+\/acknowledge.*$/ // Matches any alert acknowledgment page with query params
];

export default authMiddleware({
  publicRoutes,
  ignoredRoutes: ["/api/webhook"], // Clerk webhooks
  async afterAuth(auth, req) {
    const path = req.nextUrl.pathname;
    
    // Check if the path matches any of our dynamic public route patterns
    const isPublicPathByRegex = publicPathRegexes.some(regex => regex.test(path));
    const isPublicPath = publicRoutes.includes(path) || isPublicPathByRegex;
    
    // // Handle unauthenticated users trying to access protected routes
    // if (!auth.userId && !isPublicPath) {
    //   return NextResponse.redirect(new URL("/sign-in", req.url));
    // }

    if (auth.userId) {
      try {
        const user = await clerkClient.users.getUser(auth.userId); // Fetch user data from Clerk
        const role = user.publicMetadata.role as string | undefined;

        // Admin role redirection logic
        if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }

        // Prevent non-admin users from accessing admin routes
        if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Redirect authenticated users trying to access public routes (except certain endpoints)
        const shouldSkipRedirect = path === "/api/device-alert" || 
                                  path === "/api/alerts/acknowledge" ||
                                  path === "/" ||
                                  isPublicPathByRegex;
                                  
        if (isPublicPath && !shouldSkipRedirect) { 
          return NextResponse.redirect(
            new URL(
              role === "admin" ? "/admin/dashboard" : "/dashboard",
              req.url
            )
          );
        }
      } catch (error) {
        console.error("Error fetching user data from Clerk:", error);
        return NextResponse.redirect(new URL("/error", req.url));
      }
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
