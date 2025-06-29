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
  name: z.string().min(1, "Key adı gerekli"),
  type: z.string().default("single-use"),
  serviceId: z.number().min(1, "Servis seçimi gerekli"),
  maxQuantity: z.number().min(1, "Miktar en az 1 olmalı").max(250, "Miktar en fazla 250 olabilir"),
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
    queryKey: ["/api/admin/services/all"],
    retry: false,
  });

  const form = useForm<z.infer<typeof keySchema>>({
    resolver: zodResolver(keySchema),
    defaultValues: {
      name: "",
      type: "single-use",
      maxQuantity: 250,
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
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                        <SelectValue placeholder="Servis seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {servicesList.map((service: Service) => (
                        <SelectItem 
                          key={service.id} 
                          value={service.id.toString()}
                          className="text-slate-50 focus:bg-slate-600"
                        >
                          {service.name} - {service.platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Maksimum Miktar (1-250)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="250"
                      placeholder="250"
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