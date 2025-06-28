import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/admin/dashboard";
import Keys from "@/pages/admin/keys";
import Services from "@/pages/admin/services";
import Users from "@/pages/admin/users";
import Logs from "@/pages/admin/logs";
import Settings from "@/pages/admin/settings";
import UserInterface from "@/pages/user-interface";
import AdminOrders from "@/pages/admin/orders";
import ApiManagement from "@/pages/admin/api-management";
import AdminLogin from "@/pages/admin/login";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/user" component={UserInterface} />

      {isAuthenticated ? (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/keys" component={Keys} />
          <Route path="/services" component={Services} />
          <Route path="/api-management" component={ApiManagement} />
          <Route path="/users" component={Users} />
          <Route path="/logs" component={Logs} />
          <Route path="/settings" component={Settings} />
          <Route path="/orders" component={AdminOrders} />
        </>
      ) : (
        <Route path="/" component={Landing} />
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