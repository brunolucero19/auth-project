"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Fetch user profile on mount
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/users/profile");
        setUser(data);
      } catch (error) {
        // If 401, try refreshing token (Axios interceptor should handle this, if configured)
        // Or redirect to login
        // For now, assuming interceptor is working or redirection needed
        // console.error("Profile fetch error", error);
        // router.push("/auth/login"); // Let the page component handle redirect or interceptor
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <LayoutDashboard className="h-6 w-6" />
            <span className="sr-only">Acme Inc</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/profile"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Profile
          </Link>
          {user?.role === 'ADMIN' && (
            <Link
              href="/dashboard/admin"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Admin
            </Link>
          )}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <LayoutDashboard className="h-6 w-6" />
                <span className="sr-only">Acme Inc</span>
              </Link>
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className="text-muted-foreground hover:text-foreground"
              >
                Profile
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/dashboard/admin"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Admin
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial">
          </div>
          {user && (
              <span className="text-sm font-medium mr-2">{user.name || user.email}</span>
          )}
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
             <LogOut className="h-5 w-5" />
             <span className="sr-only">Logout</span>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
