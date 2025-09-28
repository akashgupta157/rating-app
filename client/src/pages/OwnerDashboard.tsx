import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Store, Star, Users, Calendar } from "lucide-react";
import type { Store as StoreType, Rating } from "../type";
import { AuthContext } from "@/ContextApi";
import { baseUrl, configure } from "@/lib/utils";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";

interface StoreOwnerDashboardData {
  store: StoreType & {
    averageRating: number;
    totalRatings: number;
  };
  recentRatings: Rating[];
}

export function OwnerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState<StoreOwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const config = configure(user.token);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${baseUrl}/dashboard/store-owner`,
        config
      );
      console.log(data);
      setData(data);
    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 bg-green-50";
    if (rating >= 3) return "text-yellow-600 bg-yellow-50";
    if (rating >= 2) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (user?.role === "USER") {
      navigate("/");
    } else if (user?.role === "ADMIN") {
      navigate("/admin-dashboard");
    }
  }, [user, navigate]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">No store data available.</p>
      </div>
    );
  }

  const { store, recentRatings } = data;

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 container">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Store className="w-6 h-6" />
                {store.name}
              </CardTitle>
              <p className="mt-1 text-muted-foreground">{store.address}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-blue-600 text-3xl">
                {store.averageRating.toFixed(1)}
              </div>
              <div className="text-muted-foreground text-sm">
                Average Rating
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">{store.totalRatings}</div>
                <div className="text-muted-foreground text-sm">
                  Total Ratings
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">{recentRatings.length}</div>
                <div className="text-muted-foreground text-sm">
                  Recent Reviews
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Customer Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRatings.length === 0 ? (
            <div className="py-8 text-muted-foreground text-center">
              <Star className="mx-auto mb-4 w-12 h-12 text-gray-300" />
              <p>No ratings yet</p>
              <p className="text-sm">
                Customer ratings will appear here once they start reviewing your
                store.
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRatings.map((rating) => (
                    <TableRow key={rating.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rating.user.name}</div>
                          <div className="text-muted-foreground text-sm">
                            {rating.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={getRatingColor(rating.value)}
                          >
                            {rating.value}/5
                          </Badge>
                          {renderStars(rating.value)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {rating.comment ? (
                          <p className="max-w-xs text-sm truncate">
                            {rating.comment}
                          </p>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No comment
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(rating.createdAt)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
