import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Store, RectangleEllipsis } from "lucide-react";
import { AuthContext } from "@/ContextApi";
import { Link } from "react-router";

export function Header() {
  const { user, logout } = useContext(AuthContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getAvatarFallback = () => {
    return user?.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="top-0 z-50 sticky bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b">
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16 container">
        <Link to="/" className="flex items-center space-x-2">
          <Store className="w-6 h-6" />
          <span className="font-bold text-lg sm:text-xl">StoreRatings</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative hover:bg-accent rounded-full w-9 h-9"
                >
                  <Avatar className="w-9 h-9">
                    <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="shadow-lg rounded-xl w-56"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {user.email}
                    </p>
                    <p className="text-muted-foreground text-xs capitalize">
                      {user.role.toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/update-password"
                    className="flex items-center cursor-pointer"
                  >
                    <RectangleEllipsis className="mr-2 w-4 h-4" />
                    Update Password
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 w-4 h-4" />
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hover:bg-accent hover:text-accent-foreground"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="rounded-lg">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
