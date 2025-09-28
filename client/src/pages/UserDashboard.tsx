import { useState, useEffect, useContext } from "react";
import { StoreSkeleton } from "../components/StoreSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import { AuthContext } from "@/ContextApi";
import { baseUrl, configure } from "@/lib/utils";
import axios from "axios";
import { StoreCard } from "../components/StoreCard";
import { toast } from "sonner";

export function UserDashboard() {
  const { user } = useContext(AuthContext);
  const config = configure(user.token);

  const [searchQuery, setSearchQuery] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<any[]>([]);

  async function fetchStores(query = "", showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const { data } = await axios.get(`${baseUrl}/stores`, {
        params: { search: query },
        ...config,
      });
      console.log(data);
      setStores(data.stores);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    let query = "";
    if (searchQuery) query += searchQuery;
    if (addressFilter) query += (query ? " " : "") + addressFilter;
    fetchStores(query);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setAddressFilter("");
    fetchStores();
  };

  const handleRating = async (storeId: string, rating: number) => {
    try {
      await axios.post(
        `${baseUrl}/ratings`,
        { storeId, value: rating },
        config
      );
      toast.success("Rating submitted successfully");
      fetchStores(getCurrentQuery(), false);
    } catch (err: any) {
      console.error("Failed to submit rating:", err);
      throw err;
    }
  };

  const getCurrentQuery = () => {
    let query = "";
    if (searchQuery) query += searchQuery;
    if (addressFilter) query += (query ? " " : "") + addressFilter;
    return query;
  };

  const hasActiveFilters = searchQuery || addressFilter;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Browse Stores</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
              <Input
                type="text"
                placeholder="Search stores by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>

          {hasActiveFilters && (
            <div className="text-muted-foreground text-sm">
              Showing results for:
              {searchQuery && <span className="ml-1">"{searchQuery}"</span>}
              {addressFilter && (
                <span className="ml-1">in "{addressFilter}"</span>
              )}
            </div>
          )}

          {loading ? (
            <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <StoreSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
                {stores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onRate={handleRating}
                  />
                ))}
              </div>

              {stores.length === 0 && (
                <div className="py-12 text-center">
                  <MapPin className="mx-auto mb-4 w-16 h-16 text-muted-foreground" />
                  <h3 className="mb-2 font-medium text-lg">No stores found</h3>
                  <p className="text-muted-foreground">
                    {hasActiveFilters
                      ? "Try adjusting your search criteria or clear filters."
                      : "No stores are currently registered on the platform."}
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} className="mt-4">
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
