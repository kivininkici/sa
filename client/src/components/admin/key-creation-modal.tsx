import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  serviceId: z.number().min(1, "Servis seçimi gerekli"),
  maxQuantity: z.number().min(1, "Miktar en az 1 olmalı"),
});

interface KeyCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KeyCreationModal({
  open,
  onOpenChange,
}: KeyCreationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");

  const { data: services } = useQuery({
    queryKey: ["/api/admin/services/all"],
    retry: false,
  });

  const form = useForm<z.infer<typeof keySchema>>({
    resolver: zodResolver(keySchema),
    defaultValues: {
      name: "",
      type: "single-use",
      maxQuantity: 1000,
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof keySchema>) => {
      await apiRequest("POST", "/api/admin/keys", data);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Key başarıyla oluşturuldu",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-50">Yeni Key Oluştur</DialogTitle>
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
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Servis Seç</FormLabel>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Servis ara..."
                        value={serviceSearchTerm}
                        onChange={(e) => setServiceSearchTerm(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-slate-50 pl-10"
                      />
                    </div>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                          <SelectValue placeholder="Servis seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-700 border-slate-600 max-h-60 overflow-y-auto">
                        {servicesList
                          .filter((service: Service) => 
                            serviceSearchTerm === "" || 
                            service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
                            service.platform.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
                            service.type?.toLowerCase().includes(serviceSearchTerm.toLowerCase())
                          )
                          .map((service: Service) => (
                            <SelectItem 
                              key={service.id} 
                              value={service.id.toString()}
                              className="text-slate-50 focus:bg-slate-600"
                            >
                              <div className="flex flex-col">
                                <span>{service.name}</span>
                                <span className="text-xs text-slate-400">{service.platform} - {service.type}</span>
                              </div>
                            </SelectItem>
                          ))}
                        {servicesList.filter((service: Service) => 
                          serviceSearchTerm === "" || 
                          service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
                          service.platform.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
                          service.type?.toLowerCase().includes(serviceSearchTerm.toLowerCase())
                        ).length === 0 && serviceSearchTerm !== "" && (
                          <div className="text-slate-400 text-center py-2 text-sm">
                            Arama için sonuç bulunamadı
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
                {createKeyMutation.isPending ? "Oluşturuluyor..." : "Key Oluştur"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}