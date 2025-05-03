"use client";

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { useDebounceValue } from "usehooks-ts";
import { 
  BellIcon, 
  UserIcon, 
  AlertTriangleIcon,
  CircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  deviceId: string | null;
  createdAt: string;
  updatedAt: string;
  lastSignIn: string;
  imageUrl: string;
  _count: {
    emergencyContacts: number;
    alerts: number;
  };
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(searchQuery, 300);
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alertStats, setAlertStats] = useState({
    total: 0,
    predictions: 0,
    onsets: 0,
    acknowledged: 0,
  });

  const fetchUsers = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const queryParam = debouncedQuery ? `&query=${encodeURIComponent(debouncedQuery)}` : "";
        const response = await fetch(
          `/api/admin/users?page=${page}&limit=${pagination.limit}${queryParam}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);

        // Fetch alert statistics
        fetchAlertStats();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedQuery, pagination.limit, toast]
  );

  const fetchAlertStats = async () => {
    try {
      const response = await fetch("/api/admin/alerts/stats");
      if (response.ok) {
        const data = await response.json();
        setAlertStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch alert stats:", error);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [debouncedQuery, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will be triggered by the debounced value effect
  };

  /* const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });

      // Refresh the user list
      fetchUsers(pagination.page);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  }; */

  const getDeviceStatusBadge = (deviceId: string | null, lastSignIn: string) => {
    if (!deviceId) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          <CircleIcon className="h-3 w-3 mr-1" />
          No Device
        </Badge>
      );
    }

    // For demo purposes, we'll use a simple heuristic to determine device status
    const lastSignInDate = new Date(lastSignIn);
    const now = new Date();
    const hoursSinceLastSignIn = (now.getTime() - lastSignInDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastSignIn < 24) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    } else if (hoursSinceLastSignIn < 72) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          <AlertTriangleIcon className="h-3 w-3 mr-1" />
          Inactive
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          <XCircleIcon className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl mb-8">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Manage users and monitor epilepsy prediction alerts
      </p>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <BellIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seizure Predictions</CardTitle>
            <BellIcon className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.predictions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seizure Detections</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.onsets}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex space-x-2 mb-6">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or device ID"
              className="flex-grow"
            />
            <Button type="submit">Search</Button>
          </form>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {debouncedQuery ? "No users found matching your search." : "No users found."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-2 bg-muted p-3 font-medium">
                <div className="col-span-3">User</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Device</div>
                <div className="col-span-1 text-center">Contacts</div>
                <div className="col-span-1 text-center">Alerts</div>
                <div className="col-span-2">Registered</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {users.map((user) => (
                <div key={user.id} className="grid grid-cols-12 gap-2 p-3 items-center border-t">
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {user.imageUrl ? (
                          <Image src={user.imageUrl} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <UserIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role}
                    </Badge>
                  </div>

                  <div className="col-span-2">
                    {getDeviceStatusBadge(user.deviceId, user.lastSignIn)}
                  </div>

                  <div className="col-span-1 text-center">
                    {user._count.emergencyContacts}
                  </div>

                  <div className="col-span-1 text-center">
                    {user._count.alerts}
                  </div>

                  <div className="col-span-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                      <span>{format(new Date(user.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/users/${user.id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {pagination.pages > 1 && (
          <CardFooter className="flex justify-center pt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => fetchUsers(page)}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
