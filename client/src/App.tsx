import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import UserInterface from "@/pages/user-interface";
import AdminLogin from "@/pages/admin-login";
import Dashboard from "@/pages/admin/dashboard";
import Keys from "@/pages/admin/keys";
import Services from "@/pages/admin/services";
import Users from "@/pages/admin/users";
import Logs from "@/pages/admin/logs";
import Settings from "@/pages/admin/settings";
import AdminOrders from "@/pages/admin/orders";
import AdminOrderSearch from "@/pages/admin-order-search";
import OrderSearch from "@/pages/order-search";
import ApiManagement from "@/pages/admin/api-management";
import AdminKeyStats from "@/pages/admin-key-stats";
import ApiBalances from "@/pages/admin/api-balances";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";

function Router() {
  const { isAuthenticated: isUserAuthenticated } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();

  return (
    <Switch>
      {/* Home route - conditional based on user auth */}
      <Route path="/">
        {isUserAuthenticated ? <Home /> : <Landing />}
      </Route>
      
      {/* Public routes */}
      <Route path="/auth" component={Auth} />
      <Route path="/user" component={UserInterface} />
      <Route path="/order-search" component={OrderSearch} />
      
      {/* Admin login routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin-login" component={AdminLogin} />
      
      {/* Admin main route - redirect to dashboard */}
      <Route path="/admin">
        {isAdminAuthenticated ? <Dashboard /> : <AdminLogin />}
      </Route>
      
      {/* Protected admin routes */}
      <Route path="/admin/dashboard">
        {isAdminAuthenticated ? <Dashboard /> : <AdminLogin />}
      </Route>
      <Route path="/admin/keys">
        {isAdminAuthenticated ? <Keys /> : <AdminLogin />}
      </Route>
      <Route path="/admin/services">
        {isAdminAuthenticated ? <Services /> : <AdminLogin />}
      </Route>
      <Route path="/admin/api-management">
        {isAdminAuthenticated ? <ApiManagement /> : <AdminLogin />}
      </Route>
      <Route path="/admin/api-balances">
        {isAdminAuthenticated ? <ApiBalances /> : <AdminLogin />}
      </Route>
      <Route path="/admin/users">
        {isAdminAuthenticated ? <Users /> : <AdminLogin />}
      </Route>
      <Route path="/admin/logs">
        {isAdminAuthenticated ? <Logs /> : <AdminLogin />}
      </Route>
      <Route path="/admin/settings">
        {isAdminAuthenticated ? <Settings /> : <AdminLogin />}
      </Route>
      <Route path="/admin/orders">
        {isAdminAuthenticated ? <AdminOrders /> : <AdminLogin />}
      </Route>
      <Route path="/admin/order-search">
        {isAdminAuthenticated ? <AdminOrderSearch /> : <AdminLogin />}
      </Route>
      <Route path="/admin/key-stats">
        {isAdminAuthenticated ? <AdminKeyStats /> : <AdminLogin />}
      </Route>
      
      {/* 404 fallback */}
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