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

const keySchema = z.object({
  name: z.string().optional(),
  type: z.string().default("single-use"),
  serviceId: z.number().optional(),
  maxQuantity: z.number().min(1).optional(),
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

  const { data: services } = useQuery({
    queryKey: ["/api/services/all"],
    retry: false,
  });

  const form = useForm<z.infer<typeof keySchema>>({
    resolver: zodResolver(keySchema),
    defaultValues: {
      name: "",
      type: "single-use",
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof keySchema>) => {
      await apiRequest("POST", "/api/keys", data);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Key başarıyla oluşturuldu",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/keys/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
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
                  <FormLabel className="text-slate-300">
                    Key Adı (Opsiyonel)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Örn: Ocak Kampanyası"
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Key Türü</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-slate-50">
                        <SelectValue placeholder="Key türü seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-900 border-slate-600">
                      <SelectItem value="single-use">Tek Kullanımlık</SelectItem>
                      <SelectItem value="limited">Sınırlı Kullanım (5x)</SelectItem>
                      <SelectItem value="daily">Günlük Key</SelectItem>
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
                  <FormLabel className="text-slate-300">Servis Seçin (Opsiyonel)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-slate-50">
                        <SelectValue placeholder="Servis seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-900 border-slate-600">
                      {services?.map((service: Service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("serviceId") && (
              <FormField
                control={form.control}
                name="maxQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Maksimum Miktar</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Örn: 250"
                        className="bg-slate-900 border-slate-600 text-slate-50"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-slate-400">
                      Key sahibi bu miktara kadar sipariş verebilir (0-{field.value || 0} arası)
                    </p>
                  </FormItem>
                )}
              />
            )}
            <div className="flex items-center space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => onOpenChange(false)}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={createKeyMutation.isPending}
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
