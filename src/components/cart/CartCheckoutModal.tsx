"use client";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useCartOrder } from "@/hooks/useCartOrder";
import { formatPrice } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollAreaMobile } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, MessageCircle } from "lucide-react";

interface CartCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  client_name: string;
  client_phone: string;
  client_city: string;
  client_address: string;
  client_email: string;
  notes: string;
}

export function CartCheckoutModal({ isOpen, onClose }: CartCheckoutModalProps) {
  const { items, totalPrice, clearCart } = useCart();
  const { submitCartOrder, isSubmitting } = useCartOrder();

  const [formData, setFormData] = useState<FormData>({
    client_name: "",
    client_phone: "",
    client_city: "",
    client_address: "",
    client_email: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [orderComplete, setOrderComplete] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [orderShortIds, setOrderShortIds] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.client_name.trim()) {
      newErrors.client_name = "Le nom est requis";
    }
    if (!formData.client_phone.trim()) {
      newErrors.client_phone = "Le numéro de téléphone est requis";
    } else if (!/^[+\d\s-]{8,}$/.test(formData.client_phone)) {
      newErrors.client_phone = "Numéro de téléphone invalide";
    }
    if (!formData.client_city.trim()) {
      newErrors.client_city = "La ville est requise";
    }
    if (!formData.client_address.trim()) {
      newErrors.client_address = "L'adresse est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await submitCartOrder(items, formData);
    
    if (result.success) {
      setOrderComplete(true);
      setWhatsappUrl(result.whatsappUrl || null);
      setOrderShortIds(result.shortIds || []);
      clearCart();
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setOrderComplete(false);
      setWhatsappUrl(null);
      setOrderShortIds([]);
      setFormData({
        client_name: "",
        client_phone: "",
        client_city: "",
        client_address: "",
        client_email: "",
        notes: "",
      });
      setErrors({});
      onClose();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (items.length === 0 && !orderComplete) {
    return null;
  }

  const displayShortId = orderShortIds.length === 1 
    ? orderShortIds[0] 
    : orderShortIds.slice(0, 3).join(", ");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] p-0">
        {orderComplete ? (
          <div className="p-6 text-center space-y-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-xl font-semibold">Commande envoyée !</h2>
            {orderShortIds.length > 0 && (
              <p className="text-lg font-mono font-semibold text-primary">
                #{displayShortId}
              </p>
            )}
            <p className="text-muted-foreground">
              Merci pour votre commande. Nous vous contacterons bientôt pour
              confirmer.
            </p>
            {whatsappUrl && (
              <Button
                onClick={() => window.open(whatsappUrl, "_blank")}
                variant="outline"
                className="w-full gap-2"
              >
                <MessageCircle size={18} />
                Confirmer via WhatsApp
              </Button>
            )}
            <Button onClick={handleClose} className="w-full">
              Fermer
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Finaliser la commande</DialogTitle>
            </DialogHeader>

            <ScrollAreaMobile className="max-h-[70vh]">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="space-y-3 pb-4 border-b border-border">
                  <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Récapitulatif
                  </h4>
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}`}
                      className="flex justify-between items-start text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-muted-foreground">
                          Taille: {item.size} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.product.final_price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Informations de livraison
                  </h4>

                  <div className="space-y-2">
                    <Label htmlFor="client_name">Nom complet *</Label>
                    <Input
                      id="client_name"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                      placeholder="Votre nom"
                      className={errors.client_name ? "border-destructive" : ""}
                    />
                    {errors.client_name && (
                      <p className="text-xs text-destructive">{errors.client_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_phone">Téléphone *</Label>
                    <Input
                      id="client_phone"
                      name="client_phone"
                      type="tel"
                      value={formData.client_phone}
                      onChange={handleInputChange}
                      placeholder="+216 XX XXX XXX"
                      className={errors.client_phone ? "border-destructive" : ""}
                    />
                    {errors.client_phone && (
                      <p className="text-xs text-destructive">{errors.client_phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_city">Ville *</Label>
                    <Input
                      id="client_city"
                      name="client_city"
                      value={formData.client_city}
                      onChange={handleInputChange}
                      placeholder="Votre ville"
                      className={errors.client_city ? "border-destructive" : ""}
                    />
                    {errors.client_city && (
                      <p className="text-xs text-destructive">{errors.client_city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_address">Adresse complète *</Label>
                    <Textarea
                      id="client_address"
                      name="client_address"
                      value={formData.client_address}
                      onChange={handleInputChange}
                      placeholder="Rue, numéro, code postal..."
                      rows={2}
                      className={errors.client_address ? "border-destructive" : ""}
                    />
                    {errors.client_address && (
                      <p className="text-xs text-destructive">{errors.client_address}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_email">Email (optionnel)</Label>
                    <Input
                      id="client_email"
                      name="client_email"
                      type="email"
                      value={formData.client_email}
                      onChange={handleInputChange}
                      placeholder="votre@email.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Pour recevoir une confirmation de commande
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optionnel)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Instructions de livraison, etc."
                      rows={2}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-luxury h-12"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Confirmer la commande"
                  )}
                </Button>
              </form>
            </ScrollAreaMobile>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
