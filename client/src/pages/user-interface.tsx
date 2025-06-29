import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ServiceCard from "@/components/user/service-card";
import { 
  KeyRound, 
  CheckCircle, 
  Instagram, 
  Heart, 
  Youtube, 
  Music,
  Info,
  Rocket,
  Search
} from "lucide-react";
import { Service } from "@shared/schema";

const orderSchema = z.object({
  keyValue: z.string().min(1, "Key gereklidir"),
  serviceId: z.number({ required_error: "Servis seçimi gereklidir" }),
  targetUrl: z.string().url("Geçerli bir URL girin"),
  quantity: z.number().min(1, "Miktar en az 1 olmalıdır"),
});

export default function UserInterface() {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [keyValidated, setKeyValidated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [keyInfo, setKeyInfo] = useState<{serviceId?: number, maxQuantity?: number} | null>(null);

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services"],
    retry: false,
  });

  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      keyValue: "",
      targetUrl: "",
    },
  });

  const validateKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest("POST", "/api/validate-key", { key });
      return response.json();
    },
    onSuccess: (data) => {
      setKeyValidated(true);
      setKeyInfo({ serviceId: data.serviceId, maxQuantity: data.maxQuantity });
      if (data.serviceId) {
        const service = servicesToShow?.find((s: any) => s.id === data.serviceId);
        toast({
          title: "Key Geçerli",
          description: data.maxQuantity 
            ? `Bu key sadece "${service?.name}" servisi için kullanılabilir. Maksimum ${data.maxQuantity} adet.`
            : `Bu key sadece "${service?.name}" servisi için kullanılabilir.`,
        });
        setSelectedService(data.serviceId);
        form.setValue("serviceId", data.serviceId);
      } else {
        toast({
          title: "Key Geçerli",
          description: "Key doğrulandı, sipariş verebilirsiniz",
        });
      }
    },
    onError: (error) => {
      setKeyValidated(false);
      setKeyInfo(null);
      toast({
        title: "Geçersiz Key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof orderSchema>) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sipariş Başarılı",
        description: "Siparişiniz başarıyla işleme alındı",
      });
      form.reset();
      setSelectedService(null);
      setKeyValidated(false);
    },
    onError: (error) => {
      toast({
        title: "Sipariş Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleKeyValidation = () => {
    const key = form.getValues("keyValue");
    if (key) {
      validateKeyMutation.mutate(key);
    }
  };

  const onSubmit = (data: z.infer<typeof orderSchema>) => {
    if (!keyValidated) {
      toast({
        title: "Key Doğrulanmadı",
        description: "Lütfen önce key'inizi doğrulayın",
        variant: "destructive",
      });
      return;
    }
    createOrderMutation.mutate(data);
  };

  const getServiceIcon = (platform: string, type: string) => {
    if (platform === "instagram") {
      return type === "followers" ? Instagram : Heart;
    }
    if (platform === "youtube") {
      return Youtube;
    }
    if (platform === "tiktok") {
      return Music;
    }
    return KeyRound;
  };

  const getServiceColor = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "bg-gradient-to-br from-purple-500 to-pink-500";
      case "youtube":
        return "bg-red-600";
      case "tiktok":
        return "bg-black";
      default:
        return "bg-blue-600";
    }
  };

  // Default services if none exist
  const defaultServices = [
    { id: 1, name: "Instagram Takipçi", platform: "instagram", type: "followers", description: "Gerçek ve aktif takipçiler" },
    { id: 2, name: "Instagram Beğeni", platform: "instagram", type: "likes", description: "Hızlı ve güvenli beğeniler" },
    { id: 3, name: "YouTube İzlenme", platform: "youtube", type: "views", description: "Organik video izlenmeleri" },
    { id: 4, name: "TikTok Takipçi", platform: "tiktok", type: "followers", description: "Trend takipçiler" },
  ];

  const servicesToShow = services?.length > 0 ? services : defaultServices;

    const filteredServices = servicesToShow?.filter((service: Service | any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      service.name.toLowerCase().includes(searchLower) ||
      service.description.toLowerCase().includes(searchLower) ||
      service.platform.toLowerCase().includes(searchLower) ||
      service.type.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">KeyPanel</h1>
                <p className="text-sm text-slate-400">Sosyal Medya Servisleri</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={() => window.location.href = '/'}
            >
              Ana Sayfa
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* User Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-50 mb-2">
              Sosyal Medya Servisleri
            </h2>
            <p className="text-slate-400">
              Key'inizi girin ve istediğiniz servisi seçin
            </p>
          </div>

          {/* Key Input */}
          <Card className="glass-card slide-up" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Access Key
              </label>
              <div className="relative">
                <Input
                  placeholder="Key'inizi buraya girin..."
                  className="bg-background border-border text-foreground pr-12 focus:border-primary transition-all duration-300"
                  value={form.watch("keyValue")}
                  onChange={(e) => {
                    form.setValue("keyValue", e.target.value);
                    setKeyValidated(false);
                    setKeyInfo(null);
                    setSelectedService(null);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-300"
                  onClick={handleKeyValidation}
                  disabled={validateKeyMutation.isPending || !form.watch("keyValue")}
                >
                  {keyValidated ? (
                    <CheckCircle className="w-5 h-5 text-green-500 glow-effect" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Key'iniz tek kullanımlıktır ve sadece bir kez kullanılabilir
              </p>
            </CardContent>
          </Card>

          {/* Service Selection */}
          <Card className="glass-card slide-up" style={{animationDelay: '0.3s'}}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Servis Seçin
              </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Search Services */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Servis ara... (örn: Instagram, takipçi, beğeni)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground"
                  />
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicesLoading ? (
                  <div className="col-span-full text-center text-muted-foreground">
                    Servisler yükleniyor...
                  </div>
                ) : (
                    filteredServices?.length === 0 ? (
                    <div className="col-span-full text-center text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                      <p>Arama kriterinize uygun servis bulunamadı</p>
                    </div>
                  ) : (
                  filteredServices?.map((service: Service | any) => (
                    <ServiceCard
                      key={service.id}
                      name={service.name}
                      description={service.description}
                      icon={getServiceIcon(service.platform, service.type)}
                      iconColor={getServiceColor(service.platform)}
                      isSelected={selectedService === service.id}
                      onClick={() => {
                        if (keyInfo?.serviceId && keyInfo.serviceId !== service.id) {
                          toast({
                            title: "Servis Kısıtlaması",
                            description: "Bu key sadece belirli bir servis için kullanılabilir",
                            variant: "destructive",
                          });
                          return;
                        }
                        setSelectedService(service.id);
                        form.setValue("serviceId", service.id);
                      }}
                    />
                  ))
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Form */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-50">
                Sipariş Detayları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="targetUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">
                          Profil/Video Linki
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://instagram.com/username"
                            className="bg-slate-900 border-slate-600 text-slate-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">
                          İstediğiniz Miktarı Yazın
                          {keyInfo?.maxQuantity && (
                            <span className="text-blue-400 ml-2">
                              (Maksimum: {keyInfo.maxQuantity})
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={keyInfo?.maxQuantity ? `1-${keyInfo.maxQuantity} arası` : "Örn: 1000"}
                            className="bg-slate-900 border-slate-600 text-slate-50"
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              if (keyInfo?.maxQuantity && value > keyInfo.maxQuantity) {
                                toast({
                                  title: "Limit Aşıldı",
                                  description: `Maksimum ${keyInfo.maxQuantity} adet girebilirsiniz`,
                                  variant: "destructive",
                                });
                                return;
                              }
                              field.onChange(value);
                            }}
                            min="1"
                            max={keyInfo?.maxQuantity || undefined}
                          />
                        </FormControl>
                        <FormMessage />
                        {keyInfo?.maxQuantity && (
                          <p className="text-xs text-slate-400">
                            Bu key ile 0-{keyInfo.maxQuantity} arasında sipariş verebilirsiniz
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-3 p-4 bg-slate-900 rounded-lg">
                    <Info className="w-5 h-5 text-blue-400" />
                    <p className="text-sm text-slate-300">
                      Siparişiniz 5-15 dakika içerisinde başlayacak ve 1-24 saat içerisinde tamamlanacaktır.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={createOrderMutation.isPending || !keyValidated || !selectedService}
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    {createOrderMutation.isPending ? "İşleniyor..." : "Siparişi Start Et"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}