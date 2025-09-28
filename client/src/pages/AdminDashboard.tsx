import { useCallback, useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Store, Star } from "lucide-react";
import axios from "axios";
import { baseUrl, configure } from "@/lib/utils";
import { AuthContext } from "@/ContextApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddModal } from "@/components/AddModal";
import { UsersTable } from "@/components/UsersTable";
import type { User as UserType } from "@/type";
import { StoresTable } from "@/components/StoresTable";
import { useNavigate } from "react-router";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

interface UsersData {
  users: UserType[];
  pagination: Pagination;
}

interface StoresData {
  stores: any[];
  pagination: Pagination;
}

export function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<UsersData | null>(null);
  const [stores, setStores] = useState<StoresData | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.token) return;

    const config = configure(user.token);

    setLoading(true);
    setError(null);

    try {
      const [statsResponse, usersResponse, storesResponse] = await Promise.all([
        axios.get(`${baseUrl}/dashboard/stats`, config),
        axios.get(`${baseUrl}/user`, config),
        axios.get(`${baseUrl}/stores`, config),
      ]);

      setStats(statsResponse.data);
      setUsers(usersResponse.data);
      setStores(storesResponse.data);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (user?.role === "USER") {
      navigate("/");
    } else if (user?.role === "STORE_OWNER") {
      navigate("/owner-dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const defaultPagination: Pagination = {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <p className="mb-4 text-destructive">{error}</p>
          <button
            onClick={loadData}
            className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-primary-foreground"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6 container">
      <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          description="All registered users"
        />
        <StatCard
          title="Total Stores"
          value={stats?.totalStores ?? 0}
          icon={Store}
          description="Stores on platform"
        />
        <StatCard
          title="Total Ratings"
          value={stats?.totalRatings ?? 0}
          icon={Star}
          description="Ratings submitted"
        />
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="stores" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Stores
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full sm:w-auto">
            <AddModal onUserAdded={loadData} />
          </div>
        </div>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersTable
                users={users?.users || []}
                onUsersUpdate={loadData}
                pagination={users?.pagination || defaultPagination}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores">
          <Card>
            <CardHeader>
              <CardTitle>Store Management</CardTitle>
            </CardHeader>
            <CardContent>
              <StoresTable
                stores={stores?.stores || []}
                onStoresUpdate={loadData}
                pagination={stores?.pagination || defaultPagination}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  description: string;
}) => (
  <Card className="shadow-sm hover:shadow-md rounded-xl transition-shadow">
    <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
      <CardTitle className="font-medium text-sm">{title}</CardTitle>
      <div className="bg-muted p-2 rounded-md">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="font-bold text-3xl">{value.toLocaleString()}</div>
      <p className="text-muted-foreground text-xs">{description}</p>
    </CardContent>
  </Card>
);
