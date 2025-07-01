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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
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
  Calendar,
  UserPlus,
  Ban,
  CheckCircle,
  Crown,
  LogIn
} from "lucide-react";

// Admin oluşturma formu için schema
const createAdminSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

// Normal kullanıcı oluşturma formu için schema
const createUserSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

type CreateAdminForm = z.infer<typeof createAdminSchema>;
type CreateUserForm = z.infer<typeof createUserSchema>;

export default function UsersPage() {
  const { toast } = useToast();
  const { admin, isLoading } = useAdminAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !admin) {
      window.location.href = "/admin/login";
      return;
    }
  }, [admin, isLoading]);

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!admin,
  });

  // Fetch admin users
  const { data: adminUsers, isLoading: adminUsersLoading } = useQuery({
    queryKey: ["/api/admin/list"],
    enabled: !!admin,
  });

  // Create admin mutation
  const createAdminMutation = useMutation({
    mutationFn: async (data: CreateAdminForm) => {
      const response = await apiRequest("POST", "/api/admin/create", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Yeni admin kullanıcı oluşturuldu.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/list"] });
      setCreateAdminOpen(false);
      createAdminForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Hata!",
        description: error.message || "Admin oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Suspend admin mutation
  const suspendAdminMutation = useMutation({
    mutationFn: async ({ id, suspend }: { id: number; suspend: boolean }) => {
      const response = await apiRequest("PUT", `/api/admin/${id}/suspend`, { suspend });
      return response;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Başarılı!",
        description: variables.suspend ? "Hesap askıya alındı." : "Hesap aktif edildi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/list"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata!",
        description: error.message || "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${id}/role`, { role });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Kullanıcı rolü güncellendi.",
      });
      // Hem normal kullanıcılar hem de admin listesini güncelle
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/list"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata!",
        description: error.message || "Rol güncellenemedi.",
        variant: "destructive",
      });
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserForm) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Yeni kullanıcı oluşturuldu.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setCreateUserOpen(false);
      createUserForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Hata!",
        description: error.message || "Kullanıcı oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Create admin form
  const createAdminForm = useForm<CreateAdminForm>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Create user form
  const createUserForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onCreateAdmin = (data: CreateAdminForm) => {
    createAdminMutation.mutate(data);
  };

  const onCreateUser = (data: CreateUserForm) => {
    createUserMutation.mutate(data);
  };

  if (isLoading || !admin) {
    return <div>Loading...</div>;
  }

  // Calculate stats
  const usersArray = Array.isArray(users) ? users : [];
  const adminUsersArray = Array.isArray(adminUsers) ? adminUsers : [];
  
  const userStats = {
    total: usersArray.length,
    active: usersArray.filter((user: any) => user.isActive !== false).length,
    admins: adminUsersArray.length,
    suspended: adminUsersArray.filter((admin: any) => admin.isActive === false).length,
  };

  const filteredUsers = usersArray.filter((user: any) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdmins = adminUsersArray.filter((admin: any) =>
    admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Kullanıcı Yönetimi" 
          description="Sistem kullanıcılarını ve adminleri yönetin"
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-[#020617]">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Toplam Kullanıcı"
              value={userStats.total}
              icon={Users}
              iconColor="text-blue-500"
            />
            <StatsCard
              title="Aktif Kullanıcı"
              value={userStats.active}
              icon={UserCheck}
              iconColor="text-green-500"
            />
            <StatsCard
              title="Admin Sayısı"
              value={userStats.admins}
              icon={Shield}
              iconColor="text-purple-500"
            />
            <StatsCard
              title="Askıya Alınan"
              value={userStats.suspended}
              icon={UserX}
              iconColor="text-red-500"
            />
          </div>

          {/* Search and Actions */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Kullanıcı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Kullanıcı Oluştur
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
                      </DialogHeader>
                      <Form {...createUserForm}>
                        <form onSubmit={createUserForm.handleSubmit(onCreateUser)} className="space-y-4">
                          <FormField
                            control={createUserForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Kullanıcı Adı</FormLabel>
                                <FormControl>
                                  <Input placeholder="kullanici_adi" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createUserForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>E-posta</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="kullanici@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createUserForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Şifre</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="********" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex gap-2 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setCreateUserOpen(false)}
                              className="flex-1"
                            >
                              İptal
                            </Button>
                            <Button
                              type="submit"
                              disabled={createUserMutation.isPending}
                              className="flex-1"
                            >
                              {createUserMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Admin Ekle
                      </Button>
                    </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Admin Oluştur</DialogTitle>
                    </DialogHeader>
                    <Form {...createAdminForm}>
                      <form onSubmit={createAdminForm.handleSubmit(onCreateAdmin)} className="space-y-4">
                        <FormField
                          control={createAdminForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kullanıcı Adı</FormLabel>
                              <FormControl>
                                <Input placeholder="admin_kullanici" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createAdminForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-posta</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="admin@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createAdminForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Şifre</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreateAdminOpen(false)}
                            className="flex-1"
                          >
                            İptal
                          </Button>
                          <Button
                            type="submit"
                            disabled={createAdminMutation.isPending}
                            className="flex-1"
                          >
                            {createAdminMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Admin Users Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Kullanıcılar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {adminUsersLoading ? (
                <div>Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı Adı</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Son Giriş</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.map((adminUser: any) => (
                      <TableRow key={adminUser.id}>
                        <TableCell className="font-medium">{adminUser.username}</TableCell>
                        <TableCell>{adminUser.email || "Belirtilmemiş"}</TableCell>
                        <TableCell>
                          {adminUser.lastLoginAt 
                            ? new Date(adminUser.lastLoginAt).toLocaleDateString('tr-TR')
                            : "Hiç giriş yapmamış"
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={adminUser.isActive !== false ? "default" : "destructive"}>
                            {adminUser.isActive !== false ? "Aktif" : "Askıya Alındı"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {admin?.username === "akivi" && adminUser.username !== "akivi" && (
                            <Button
                              variant={adminUser.isActive !== false ? "destructive" : "default"}
                              size="sm"
                              onClick={() => suspendAdminMutation.mutate({
                                id: adminUser.id,
                                suspend: adminUser.isActive !== false
                              })}
                              disabled={suspendAdminMutation.isPending}
                            >
                              {adminUser.isActive !== false ? (
                                <>
                                  <Ban className="w-4 h-4 mr-1" />
                                  Askıya Al
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Aktif Et
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Regular Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sistem Kullanıcıları
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div>Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>İsim</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Kayıt Tarihi</TableHead>
                      <TableHead>İşlemler</TableHead>
                      <TableHead>Giriş</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: any) => (
                      <TableRow key={`${user.type}-${user.id}`}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.username || user.firstName || user.name || "Belirtilmemiş"}</TableCell>
                        <TableCell>{user.email || "Belirtilmemiş"}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                            {user.role === 'admin' ? <Crown className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                            {user.role === 'admin' ? 'Admin' : 'Normal Üye'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.createdAt 
                            ? new Date(user.createdAt).toLocaleDateString('tr-TR')
                            : "Bilinmiyor"
                          }
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role || 'user'}
                            onValueChange={(role) => updateUserRoleMutation.mutate({ id: user.id, role })}
                            disabled={updateUserRoleMutation.isPending}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Normal Üye</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-20"
                            onClick={async () => {
                              try {
                                // Direct login API call
                                const response = await fetch('/api/auth/auto-login', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: user.id })
                                });
                                
                                if (response.ok) {
                                  window.location.href = '/';
                                } else {
                                  toast({
                                    title: "Hata",
                                    description: "Giriş yapılamadı",
                                    variant: "destructive"
                                  });
                                }
                              } catch (error) {
                                toast({
                                  title: "Hata", 
                                  description: "Giriş yapılamadı",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            <LogIn className="w-4 h-4 mr-1" />
                            Giriş
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}