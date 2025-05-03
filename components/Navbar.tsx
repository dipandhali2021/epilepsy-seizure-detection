"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { 
  LogOut, 
  BellIcon, 
  UserCircle, 
  LayoutDashboard, 
  CircuitBoard,
  Shield,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  
  // Determine if user is admin based on publicMetadata
  const isAdmin = user?.publicMetadata?.role === 'admin';

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <CircuitBoard className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-xl font-bold">EpiCap</span>
            </Link>
            {user && (
              <div className="hidden md:ml-6 md:flex md:space-x-4 items-center">
                <Link href="/" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium">
                Home
                </Link>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/contacts"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
                >
                  Contacts
                </Link>
                <Link
                  href="/alerts"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
                >
                  Alerts
                </Link>
                <Link
                  href="/device"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
                >
                  Device
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Button variant="outline" size="sm" asChild className="hidden md:flex mr-2">
                    <Link href="/admin/dashboard">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar>
                        <AvatarImage src={user.imageUrl} alt="User avatar" />
                        <AvatarFallback>
                          {user.firstName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {user.firstName || user.emailAddresses[0].emailAddress}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard?tab=overview" className="flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard?tab=contacts" className="flex items-center">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Emergency Contacts</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard?tab=alerts" className="flex items-center">
                        <BellIcon className="mr-2 h-4 w-4" />
                        <span>Alert History</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard?tab=device" className="flex items-center">
                        <CircuitBoard className="mr-2 h-4 w-4" />
                        <span>Device Setup</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard" className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href="/help" className="flex items-center">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Help & Support</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild className="mr-2">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
