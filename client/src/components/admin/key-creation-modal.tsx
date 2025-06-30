import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Service } from "@shared/schema";
import { Search } from "lucide-react";

const keySchema = z.object({
  name: z.string().min(1, "Key adı gerekli"),
  type: z.string().default("single-use"),
  category: z.string().min(1, "Kategori seçimi gerekli"),
  serviceId: z.number().min(1, "Servis seçimi gerekli"),
  maxQuantity: z.number().min(1, "Miktar en az 1 olmalı"),
  validityDays: z.number().min(1, "Geçerlilik süresi en az 1 gün olmalı").max(365, "Geçerlilik süresi en fazla 365 gün olabilir").default(7),
  keyCount: z.number().min(1, "En az 1 key oluşturulmalı").max(500, "En fazla 500 key oluşturulabilir").default(1),
});

interface KeyCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const platformCategories = [
  { id: "youtube", name: "YouTube", icon: "📺", keywords: ["youtube", "yt"] },
  { id: "instagram", name: "Instagram", icon: "📷", keywords: ["instagram", "ig", "insta"] },
  { id: "twitter", name: "Twitter", icon: "🐦", keywords: ["twitter", "tweet", "x.com"] },
  { id: "tiktok", name: "TikTok", icon: "🎵", keywords: ["tiktok", "tik tok"] },
  { id: "kick", name: "Kick", icon: "🦵", keywords: ["kick"] },
  { id: "twitch", name: "Twitch", icon: "🎮", keywords: ["twitch"] },
  { id: "facebook", name: "Facebook", icon: "👥", keywords: ["facebook", "fb"] },
  { id: "telegram", name: "Telegram", icon: "✈️", keywords: ["telegram"] },
  { id: "spotify", name: "Spotify", icon: "🎶", keywords: ["spotify"] },
  { id: "other", name: "Diğer", icon: "🔧", keywords: [] }
];

export default function KeyCreationModal({
  open,
  onOpenChange,
}: KeyCreationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const SERVICES_PER_PAGE = 25;

  const { data: services } = useQuery({
    queryKey: ["/api/admin/services/all"],
    retry: false,
  });

  const { data: apiSettings } = useQuery({
    queryKey: ["/api/admin/api-settings"],
    retry: false,
  });

  const form = useForm<z.infer<typeof keySchema>>({
    resolver: zodResolver(keySchema),
    defaultValues: {
      name: "",
      type: "single-use",
      category: "Instagram",
      maxQuantity: 1000,
      validityDays: 7,
      keyCount: 1,
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof keySchema>) => {
      // Find the selected service to determine which API to use
      const selectedService = servicesList.find(s => s.id === data.serviceId);
      if (!selectedService) {
        throw new Error("Servis bulunamadı");
      }

      // Determine API based on service platform
      let apiSettingsId;
      if (selectedService.platform === "MedyaBayim") {
        const medyaApi = Array.isArray(apiSettings) ? apiSettings.find(api => api.name === "Medya") : null;
        apiSettingsId = medyaApi?.id;
      } else if (selectedService.platform === "Resellers") {
        const resellersApi = Array.isArray(apiSettings) ? apiSettings.find(api => api.name === "Resellers") : null;
        apiSettingsId = resellersApi?.id;
      }

      if (!apiSettingsId) {
        throw new Error(`${selectedService.platform} API'si bulunamadı`);
      }

      const response = await apiRequest("POST", "/api/admin/keys", {
        ...data,
        apiSettingsId
      });
      
      return await response.json();
    },
    onSuccess: (result) => {
      const isMultiple = result.count > 1;
      toast({
        title: "Başarılı",
        description: isMultiple ? result.message : "Key başarıyla oluşturuldu",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof keySchema>) => {
    createKeyMutation.mutate(data);
  };

  const servicesList = Array.isArray(services) ? services : [];

  // Reset service selection when category changes
  const selectedCategory = form.watch("category");
  useEffect(() => {
    form.setValue("serviceId", 0); // Reset to empty value
    setServiceSearchTerm(""); // Clear search
    setCurrentPage(0); // Reset pagination
  }, [selectedCategory, form]);

  // Memoized filtering for better performance
  const filteredServices = useMemo(() => {
    let results: Service[] = servicesList;
    
    // Get current category from form
    const selectedCategory = form.watch("category");
    
    // Filter by category first
    if (selectedCategory && selectedCategory !== "other") {
      const categoryData = platformCategories.find(cat => cat.name === selectedCategory);
      if (categoryData && categoryData.keywords.length > 0) {
        results = results.filter((service: Service) => {
          const serviceName = service.name.toLowerCase();
          return categoryData.keywords.some(keyword => 
            serviceName.includes(keyword.toLowerCase())
          );
        });
      }
    }
    
    // Filter by search term
    if (serviceSearchTerm) {
      const searchLower = serviceSearchTerm.toLowerCase();
      
      // Check if search term is a number (service ID)
      if (/^\d+$/.test(serviceSearchTerm)) {
        const serviceId = parseInt(serviceSearchTerm);
        const exactMatch = results.find((service: Service) => service.id === serviceId);
        if (exactMatch) {
          results = [exactMatch];
        } else {
          // If no exact match, look for services containing the ID
          results = results.filter((service: Service) => 
            service.id.toString().includes(serviceSearchTerm)
          );
        }
      } else {
        // Text search
        results = results.filter((service: Service) => 
          service.name.toLowerCase().includes(searchLower) ||
          service.platform.toLowerCase().includes(searchLower) ||
          service.type?.toLowerCase().includes(searchLower) ||
          service.id.toString().includes(serviceSearchTerm)
        );
      }
    }
    
    // Apply pagination if no search term
    if (!serviceSearchTerm) {
      const startIndex = currentPage * SERVICES_PER_PAGE;
      results = results.slice(startIndex, startIndex + SERVICES_PER_PAGE);
    } else {
      results = results.slice(0, SERVICES_PER_PAGE);
    }
    
    return results;
  }, [servicesList, serviceSearchTerm, currentPage, SERVICES_PER_PAGE, form.watch("category")]);

  const totalPages = Math.ceil(servicesList.length / SERVICES_PER_PAGE);

  // Reset page when search term changes
  const handleSearchChange = (value: string) => {
    setServiceSearchTerm(value);
    setCurrentPage(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-50">Yeni Key Oluştur</DialogTitle>
          <DialogDescription className="text-slate-400">
            Tek kullanımlık key'ler oluşturun ve servis seçimi yapın
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Key Adı</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Örn: Instagram Beğeni Key"
                      className="bg-slate-700 border-slate-600 text-slate-50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Key Kategorisi</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="Kick">Kick</SelectItem>
                      <SelectItem value="Twitch">Twitch</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Telegram">Telegram</SelectItem>
                      <SelectItem value="Spotify">Spotify</SelectItem>
                      <SelectItem value="Diğer">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />



            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Servis Seç</FormLabel>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Servis ara... (ID: 7205 veya isim: Instagram)"
                        value={serviceSearchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-slate-50 pl-10"
                      />
                    </div>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50 h-auto min-h-[40px]">
                          {field.value ? (() => {
                            const selectedService = servicesList.find(s => s.id === field.value);
                            if (selectedService) {
                              const displayName = selectedService.name.length > 40 
                                ? selectedService.name.substring(0, 40) + '...' 
                                : selectedService.name;
                              return (
                                <div className="flex flex-col text-left py-1">
                                  <span className="text-sm font-medium truncate">#{selectedService.id} - {displayName}</span>
                                  <span className="text-xs text-slate-400">{selectedService.platform}</span>
                                </div>
                              );
                            }
                            return <SelectValue placeholder="Servis seçin" />;
                          })() : <SelectValue placeholder="Servis seçin" />}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-700 border-slate-600 max-h-60 overflow-y-auto w-full max-w-md">
                        {filteredServices.map((service: Service) => (
                          <SelectItem 
                            key={service.id} 
                            value={service.id.toString()}
                            className="text-slate-50 focus:bg-slate-600 w-full"
                          >
                            <div className="flex flex-col w-full min-w-0">
                              <span className="truncate text-sm font-medium" title={`#${service.id} - ${service.name}`}>
                                #{service.id} - {service.name.length > 45 ? service.name.substring(0, 45) + '...' : service.name}
                              </span>
                              <span className="text-xs text-slate-400 truncate" title={`${service.platform} - ${service.type}`}>
                                {service.platform} - {service.type}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                        {filteredServices.length === 0 && serviceSearchTerm !== "" && (
                          <div className="text-slate-400 text-center py-2 text-sm">
                            Arama için sonuç bulunamadı
                          </div>
                        )}
                        {!serviceSearchTerm && (
                          <div className="text-slate-400 text-center py-2 text-sm border-t border-slate-600">
                            <div className="flex items-center justify-between px-2 py-1">
                              <span>Sayfa {currentPage + 1} / {totalPages}</span>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                  disabled={currentPage === 0}
                                  className="h-6 px-2 text-slate-400 hover:text-slate-200"
                                >
                                  ←
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                  disabled={currentPage >= totalPages - 1}
                                  className="h-6 px-2 text-slate-400 hover:text-slate-200"
                                >
                                  →
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keyCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Oluşturulacak Key Miktarı</FormLabel>
                  <div className="space-y-3">
                    {/* Hızlı Seçim Butonları */}
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 5, 10, 25, 50, 100, 250, 500].map((count) => (
                        <Button
                          key={count}
                          type="button"
                          variant={field.value === count ? "default" : "outline"}
                          size="sm"
                          onClick={() => field.onChange(count)}
                          className={`text-xs ${
                            field.value === count 
                              ? "bg-blue-600 text-white" 
                              : "border-slate-600 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {count}
                        </Button>
                      ))}
                    </div>
                    {/* Özel Miktar Girişi */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#ffffff]">Özel Miktar (1-500)</label>
                      <Input
                        type="number"
                        min="1"
                        max="500"
                        placeholder="Özel miktar girin..."
                        className="bg-slate-700 border-slate-600 text-slate-50"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Maksimum Miktar</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1000"
                      className="bg-slate-700 border-slate-600 text-slate-50"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validityDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Geçerlilik Süresi (Gün)</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                        <SelectValue placeholder="Geçerlilik süresini seçin" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="1" className="text-slate-50 focus:bg-slate-600">1 Gün</SelectItem>
                        <SelectItem value="3" className="text-slate-50 focus:bg-slate-600">3 Gün</SelectItem>
                        <SelectItem value="7" className="text-slate-50 focus:bg-slate-600">1 Hafta</SelectItem>
                        <SelectItem value="14" className="text-slate-50 focus:bg-slate-600">2 Hafta</SelectItem>
                        <SelectItem value="30" className="text-slate-50 focus:bg-slate-600">1 Ay</SelectItem>
                        <SelectItem value="60" className="text-slate-50 focus:bg-slate-600">2 Ay</SelectItem>
                        <SelectItem value="90" className="text-slate-50 focus:bg-slate-600">3 Ay</SelectItem>
                        <SelectItem value="180" className="text-slate-50 focus:bg-slate-600">6 Ay</SelectItem>
                        <SelectItem value="365" className="text-slate-50 focus:bg-slate-600">1 Yıl</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={createKeyMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createKeyMutation.isPending 
                  ? `${form.watch("keyCount") || 1} Key Oluşturuluyor...` 
                  : `${form.watch("keyCount") || 1} Key Oluştur`
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}