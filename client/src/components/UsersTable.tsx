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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  User,
  Store,
  Crown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { User as UserType } from "@/type";
import { AuthContext } from "@/ContextApi";
import { baseUrl, configure } from "@/lib/utils";
import axios from "axios";

interface UsersTableProps {
  users: UserType[];
  onUsersUpdate: () => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function UsersTable({
  users: initialUsers,
  onUsersUpdate,
  pagination: initialPagination,
}: UsersTableProps) {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    page: 1,
    limit: 10,
  });

  const config = configure(user.token);

  useEffect(() => {
    setUsers(initialUsers);
    setPagination(initialPagination);
  }, [initialUsers, initialPagination]);

  const applyFilters = async (newPage?: number) => {
    setLoading(true);
    try {
      const params: any = {
        page: newPage || filters.page,
        limit: filters.limit,
      };
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;

      const { data } = await axios.get(`${baseUrl}/user`, {
        params,
        ...config,
      });

      setUsers(data.users);
      setPagination(data.pagination);

      if (newPage) {
        setFilters((prev) => ({ ...prev, page: newPage }));
      }
    } catch (err) {
      console.error("Failed to filter users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    applyFilters(newPage);
  };

  const clearFilters = () => {
    setFilters({ search: "", role: "", page: 1, limit: 10 });
    onUsersUpdate();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="w-4 h-4" />;
      case "STORE_OWNER":
        return <Store className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "STORE_OWNER":
        return "default";
      default:
        return "secondary";
    }
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
            placeholder="Search by name, email, or address..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={filters.role}
            onValueChange={(value) => handleFilterChange("role", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">Normal User</SelectItem>
              <SelectItem value="STORE_OWNER">Store Owner</SelectItem>
              <SelectItem value="ADMIN">Administrator</SelectItem>
            </SelectContent>
          </Select>
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <div className="flex justify-center items-center">
                    <div className="border-primary border-b-2 rounded-full w-6 h-6 animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell
                    className="max-w-[200px] truncate"
                    title={user.address}
                  >
                    {user.address}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getRoleVariant(user.role)}
                      className="flex items-center gap-1 w-fit"
                    >
                      {getRoleIcon(user.role)}
                      {user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && users.length === 0 && (
          <div className="py-8 text-muted-foreground text-center">
            No users found
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-between items-center px-2">
          <div className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} users
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
