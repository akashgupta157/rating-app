import { useState, useEffect, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Store as StoreType } from "../type";
import axios from "axios";
import { baseUrl, configure } from "@/lib/utils";
import { AuthContext } from "@/ContextApi";

interface StoresTableProps {
  stores: StoreType[];
  onStoresUpdate: () => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function StoresTable({
  stores: initialStores,
  onStoresUpdate,
  pagination: initialPagination,
}: StoresTableProps) {
  const { user } = useContext(AuthContext);
  const [stores, setStores] = useState<StoreType[]>(initialStores);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
  });
  const config = configure(user.token);

  useEffect(() => {
    setStores(initialStores);
    setPagination(initialPagination);
  }, [initialStores, initialPagination]);

  const applyFilters = async (newPage?: number) => {
    setLoading(true);
    try {
      const params: any = {
        page: newPage || filters.page,
        limit: filters.limit,
      };
      if (filters.search) params.search = filters.search;
      const { data } = await axios.get(`${baseUrl}/stores`, {
        params,
        ...config,
      });
      setStores(data.stores);
      setPagination(data.pagination);

      if (newPage) {
        setFilters((prev) => ({ ...prev, page: newPage }));
      }
    } catch (err) {
      console.error("Failed to filter stores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    applyFilters(newPage);
  };

  const clearFilters = () => {
    setFilters({ search: "", page: 1, limit: 10 });
    onStoresUpdate();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getPageNumbers = () => {
    const pages = [];
    const currentPage = pagination.page;
    const totalPages = pagination.pages;

    pages.push(1);

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    if (startPage > 2) {
      pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="flex sm:flex-row flex-col gap-4">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Search by store name or address..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => applyFilters()} disabled={loading}>
            <Filter className="mr-2 w-4 h-4" />
            Apply Filters
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <div className="flex justify-center items-center">
                    <div className="border-primary border-b-2 rounded-full w-6 h-6 animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell>{store.email}</TableCell>
                  <TableCell
                    className="max-w-[200px] truncate"
                    title={store.address}
                  >
                    {store.address}
                  </TableCell>
                  <TableCell>
                    {store.owner ? (
                      <div>
                        <div className="font-medium">{store.owner.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {store.owner.email}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">No Owner</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {store.overallRating ? (
                      <div className="flex items-center gap-1">
                        <Star
                          className={`w-4 h-4 fill-current ${getRatingColor(
                            store.overallRating
                          )}`}
                        />
                        <span className={getRatingColor(store.overallRating)}>
                          {store.overallRating.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          ({store.totalRatings || 0})
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline">No Ratings</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(store.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && stores.length === 0 && (
          <div className="py-8 text-muted-foreground text-center">
            No stores found
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-between items-center px-2">
          <div className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} stores
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {getPageNumbers().map((page, index) => (
              <Button
                key={index}
                variant={page === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  typeof page === "number" ? handlePageChange(page) : null
                }
                disabled={page === "..." || loading}
                className={page === "..." ? "cursor-default" : ""}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages || loading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
