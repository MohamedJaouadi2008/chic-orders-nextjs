"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollAreaMobile } from "@/components/ui/scroll-area";
import { useCreateOrder } from "@/hooks/useOrders";
import type { ProductWithPrice, OrderFormData } from "@/types/database";
import { formatPrice } from "@/lib/formatters";
import { Loader2, CheckCircle } from "lucide-react";

const orderSchema = z.object({
  client_name: z.string().min(2, "Nom requis").max(100, "Nom trop long"),
  client_phone: z.string().min(8, "Numéro invalide").max(20, "Numéro trop long"),
  client_city: z.string().min(2, "Ville requise").max(100, "Ville trop longue"),
  client_address: z.string().min(5, "Adresse requise").max(500, "Adresse trop longue"),
  client_email: z.string().email("Email invalide").max(255, "Email trop long").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes trop longues").optional(),
});

interface OrderModalProps {
  product: ProductWithPrice;
  selectedSize: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderModal({ product, selectedSize, isOpen, onClose }: OrderModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [orderShortId, setOrderShortId] = useState<string | null>(null);
  const createOrder = useCreateOrder();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      client_name: "",
      client_phone: "",
      client_city: "",
      client_address: "",
      client_email: "",
      notes: "",
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    try {
      const result = await createOrder.mutateAsync({
        product,
        formData: {
          ...data,
          size_selected: selectedSize,
        },
      });
      setWhatsappUrl(result.whatsappUrl);
      setOrderShortId(result.shortId);
      setIsSuccess(true);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    if (isSuccess) {
      setIsSuccess(false);
      setWhatsappUrl(null);
      setOrderShortId(null);
      form.reset();
    }
    onClose();
  };

  const handleWhatsAppClick = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background border-border max-h-[90vh] p-0">
        {isSuccess ? (
          <div className="text-center py-8 px-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <DialogTitle className="text-xl font-light mb-2">
              Commande Confirmée
            </DialogTitle>
            {orderShortId && (
              <p className="text-lg font-mono font-semibold text-primary mb-2">
                #{orderShortId}
              </p>
            )}
            <p className="text-muted-foreground mb-4">
              Merci pour votre commande! Nous vous contacterons bientôt.
            </p>
            <div className="flex flex-col gap-3">
              {whatsappUrl && (
                <Button 
                  onClick={handleWhatsAppClick} 
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  📱 Confirmer via WhatsApp
                </Button>
              )}
              <Button onClick={handleClose} variant="outline">
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl font-light tracking-wide">
                Commander
              </DialogTitle>
            </DialogHeader>
            
            <ScrollAreaMobile className="max-h-[70vh]">
              <div className="px-6 pb-6">

            {/* Order Summary */}
            <div className="py-4 border-b border-border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">Taille: {selectedSize}</p>
                </div>
                <div className="text-right">
                  {product.discount_percent > 0 ? (
                    <>
                      <p className="font-medium text-primary">
                        {formatPrice(product.final_price)}
                      </p>
                      <p className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.original_price)}
                      </p>
                    </>
                  ) : (
                    <p className="font-medium">{formatPrice(product.final_price)}</p>
                  )}
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="client_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+212 6XX XXX XXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input placeholder="Casablanca" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse de livraison</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Adresse complète" 
                          rows={2}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (optionnel)</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="votre@email.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Instructions spéciales..." 
                          rows={2}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {createOrder.error && (
                  <p className="text-sm text-destructive">
                    {createOrder.error.message}
                  </p>
                )}

                <Button 
                  type="submit" 
                  className="w-full btn-luxury"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    "Confirmer la commande"
                  )}
                </Button>
              </form>
            </Form>
              </div>
            </ScrollAreaMobile>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
