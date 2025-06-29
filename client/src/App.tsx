import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import UserInterface from "@/pages/user-interface";
import AdminLogin from "@/pages/admin-login";
import Dashboard from "@/pages/admin/dashboard";
import Keys from "@/pages/admin/keys";
import Services from "@/pages/admin/services";
import Users from "@/pages/admin/users";
import Logs from "@/pages/admin/logs";
import Settings from "@/pages/admin/settings";
import AdminOrders from "@/pages/admin/orders";
import ApiManagement from "@/pages/admin/api-management";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/user" component={UserInterface} />
      
      {/* Admin login */}
      <Route path="/admin/login" component={AdminLogin} />
      
      {/* Admin routes */}
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/keys" component={Keys} />
      <Route path="/admin/services" component={Services} />
      <Route path="/admin/api-management" component={ApiManagement} />
      <Route path="/admin/users" component={Users} />
      <Route path="/admin/logs" component={Logs} />
      <Route path="/admin/settings" component={Settings} />
      <Route path="/admin/orders" component={AdminOrders} />
      
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