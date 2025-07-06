import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Books from "@/pages/books";
import Reservations from "@/pages/reservations";
import Profile from "@/pages/profile";
import AdminUsers from "@/pages/admin/users";
import AdminInventory from "@/pages/admin/inventory";
import Payment from "@/pages/payment";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/books" component={Books} />
          <Route path="/reservations" component={Reservations} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/inventory" component={AdminInventory} />
          <Route path="/payment" component={Payment} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
