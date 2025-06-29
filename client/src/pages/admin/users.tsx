import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search,
  Shield,
  Calendar
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function UsersPage() {
  const { toast } = useToast();
  const { admin, isLoading } = useAdminAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !admin) {
      window.location.href = "/admin/login";
      return;
    }
  }, [admin, isLoading]);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const { data: admins, isLoading: adminsLoading } = useQuery({
    queryKey: ["/api/admin/list"],
    retry: false,
  });

  if (isLoading || !admin) {
    return <div>Loading...</div>;
  }

  const filteredUsers = Array.isArray(users) ? users.filter((user: any) => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredAdmins = Array.isArray(admins) ? admins.filter((admin: any) => 
    admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const totalUsers = (users as any)?.length || 0;
  const activeUsers = Array.isArray(users) ? users.filter((user: any) => user.isActive).length : 0;
  const totalAdmins = (admins as any)?.length || 0;

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Kullanıcı Yönetimi" 
          description="Sistem kullanıcılarını ve adminleri yönetin" 
        />
        
        <div className="content-area">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-50">Kullanıcı Yönetimi</h2>
                <p className="text-slate-400">Sistem kullanıcılarını ve adminleri görüntüleyin</p>
              </div>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                title="Toplam Kullanıcı"
                value={totalUsers}
                icon={Users}
                iconColor="bg-blue-600"
              />
              <StatsCard
                title="Aktif Kullanıcı"
                value={activeUsers}
                icon={UserCheck}
                iconColor="bg-green-600"
              />
              <StatsCard
                title="Toplam Admin"
                value={totalAdmins}
                icon={Shield}
                iconColor="bg-purple-600"
              />
            </div>

            {/* Search */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Kullanıcı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-600 text-slate-50"
                />
              </div>
            </div>

            {/* Admin Users Table */}
            <Card className="dashboard-card">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-lg font-semibold text-slate-50 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-purple-400" />
                  Admin Kullanıcıları
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-900">
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">Kullanıcı Adı</TableHead>
                        <TableHead className="text-slate-400">Email</TableHead>
                        <TableHead className="text-slate-400">Durum</TableHead>
                        <TableHead className="text-slate-400">Son Giriş</TableHead>
                        <TableHead className="text-slate-400">Oluşturulma</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminsLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                            Yükleniyor...
                          </TableCell>
                        </TableRow>
                      ) : filteredAdmins.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                            {searchTerm ? "Arama kriterine uygun admin bulunamadı" : "Henüz admin kullanıcısı yok"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAdmins.map((admin: any) => (
                          <TableRow key={admin.id} className="border-slate-700 hover:bg-slate-900/50">
                            <TableCell className="text-slate-50 font-medium">
                              {admin.username}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {admin.email || "Belirtilmemiş"}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={admin.isActive ? "default" : "secondary"}
                                className={admin.isActive 
                                  ? "bg-green-900 text-green-300" 
                                  : "bg-slate-700 text-slate-400"
                                }
                              >
                                {admin.isActive ? "Aktif" : "Pasif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {admin.lastLoginAt 
                                ? new Date(admin.lastLoginAt).toLocaleDateString('tr-TR')
                                : "Henüz giriş yapmamış"
                              }
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {admin.createdAt 
                                ? new Date(admin.createdAt).toLocaleDateString('tr-TR')
                                : "-"
                              }
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Regular Users Table */}
            <Card className="dashboard-card">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-lg font-semibold text-slate-50 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  Normal Kullanıcılar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-900">
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">Kullanıcı Adı</TableHead>
                        <TableHead className="text-slate-400">Email</TableHead>
                        <TableHead className="text-slate-400">Durum</TableHead>
                        <TableHead className="text-slate-400">Oluşturulma</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                            Yükleniyor...
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                            {searchTerm ? "Arama kriterine uygun kullanıcı bulunamadı" : "Henüz normal kullanıcı yok"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user: any) => (
                          <TableRow key={user.id} className="border-slate-700 hover:bg-slate-900/50">
                            <TableCell className="text-slate-50 font-medium">
                              {user.username}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {user.email || "Belirtilmemiş"}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={user.isActive ? "default" : "secondary"}
                                className={user.isActive 
                                  ? "bg-green-900 text-green-300" 
                                  : "bg-slate-700 text-slate-400"
                                }
                              >
                                {user.isActive ? "Aktif" : "Pasif"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {user.createdAt 
                                ? new Date(user.createdAt).toLocaleDateString('tr-TR')
                                : "-"
                              }
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
