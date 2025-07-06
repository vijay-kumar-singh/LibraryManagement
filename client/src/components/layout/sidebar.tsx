import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  BookOpen, 
  Bookmark, 
  History, 
  User, 
  Users, 
  Package, 
  CreditCard, 
  FileText 
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: BarChart3,
      roles: ["user", "admin"]
    },
    {
      label: "Book Catalog",
      path: "/books",
      icon: BookOpen,
      roles: ["user", "admin"]
    },
    {
      label: "My Reservations",
      path: "/reservations",
      icon: Bookmark,
      roles: ["user", "admin"]
    },
    {
      label: "Borrowing History",
      path: "/history",
      icon: History,
      roles: ["user", "admin"]
    },
    {
      label: "Profile",
      path: "/profile",
      icon: User,
      roles: ["user", "admin"]
    }
  ];

  const adminItems = [
    {
      label: "User Management",
      path: "/admin/users",
      icon: Users,
      roles: ["admin"]
    },
    {
      label: "Inventory",
      path: "/admin/inventory",
      icon: Package,
      roles: ["admin"]
    },
    {
      label: "Payments & Fines",
      path: "/admin/payments",
      icon: CreditCard,
      roles: ["admin"]
    },
    {
      label: "Reports",
      path: "/admin/reports",
      icon: FileText,
      roles: ["admin"]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes((user as any)?.role || "user")
  );

  const filteredAdminItems = adminItems.filter(item => 
    item.roles.includes((user as any)?.role || "user")
  );

  return (
    <aside className="w-64 bg-white library-shadow min-h-screen">
      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer",
                    isActive(item.path)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
          
          {/* Admin Section */}
          {filteredAdminItems.length > 0 && (
            <div className="pt-6 border-t border-gray-200 mt-6">
              <p className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Administration
              </p>
              {filteredAdminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path}>
                    <div
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer",
                        isActive(item.path)
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
