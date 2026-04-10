import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminSettings, useUpdateSettings } from "@/hooks/useAdminSales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Linkedin, Phone, AlertCircle, Send, Eye, EyeOff, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
const AdminSettingsPage = () => {
  const {
    data: settings,
    isLoading
  } = useAdminSettings();
  const updateSettings = useUpdateSettings();
  const [showBotToken, setShowBotToken] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [formData, setFormData] = useState({
    whatsapp_number: "+216 ",
    telegram_username: "",
    delivery_zones: "Hors Tunisie",
    show_footer_credit: true,
    telegram_bot_token: "",
    telegram_chat_id: "",
    notifications_enabled: true,
    low_stock_threshold: 10
  });

  // Auto-format phone number as XX XXX XXX with +216 prefix
  const formatPhoneNumber = (value: string) => {
    let phone = value.replace(/[^\d+]/g, '');
    if (!phone.startsWith('+216')) {
      phone = '+216' + phone.replace('+', '');
    }
    const digits = phone.slice(4).replace(/\D/g, '');
    let formatted = '+216 ';
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 8);
    return formatted.trim();
  };

  // Auto-remove @ from telegram username
  const formatTelegram = (value: string) => {
    return value.replace(/@/g, '');
  };
  useEffect(() => {
    if (settings) {
      setFormData({
        whatsapp_number: settings.whatsapp_number || "+216 ",
        telegram_username: settings.telegram_username || "",
        delivery_zones: settings.delivery_zones || "Hors Tunisie",
        show_footer_credit: settings.show_footer_credit,
        telegram_bot_token: settings.telegram_bot_token || "",
        telegram_chat_id: settings.telegram_chat_id || "",
        notifications_enabled: settings.notifications_enabled,
        low_stock_threshold: settings.low_stock_threshold || 10
      });
    }
  }, [settings]);
  const testTelegramNotification = async () => {
    if (!formData.telegram_bot_token || !formData.telegram_chat_id) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord configurer le token du bot et l'ID du chat.",
        variant: "destructive"
      });
      return;
    }
    setTestingNotification(true);
    try {
      const {
        error
      } = await supabase.functions.invoke("notify-order", {
        body: {
          product_name: "Test Product",
          size_selected: "M",
          final_price: 100,
          original_price: 120,
          discount_applied: 17,
          client_name: "Test Client",
          client_phone: "+216 28 534 675",
          client_city: "Tunis",
          client_address: "123 Test Street",
          notes: "Test notification - Si vous voyez ce message, Telegram fonctionne !"
        }
      });
      if (error) throw error;
      toast({
        title: "Notification envoyée",
        description: "Vérifiez votre Telegram pour le message de test."
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de l'envoi de la notification de test.",
        variant: "destructive"
      });
    } finally {
      setTestingNotification(false);
    }
  };
  const handleSave = async () => {
    try {
      // Check if user is authenticated
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour sauvegarder les paramètres.",
          variant: "destructive"
        });
        return;
      }
      const updateData = {
        whatsapp_number: formData.whatsapp_number.trim() || null,
        telegram_username: formData.telegram_username.trim() || null,
        telegram_bot_token: formData.telegram_bot_token.trim() || null,
        telegram_chat_id: formData.telegram_chat_id.trim() || null,
        delivery_zones: formData.delivery_zones.trim() || null,
        show_footer_credit: formData.show_footer_credit,
        notifications_enabled: formData.notifications_enabled,
        low_stock_threshold: formData.low_stock_threshold
      };
      await updateSettings.mutateAsync(updateData);
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos modifications ont été enregistrées."
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder les paramètres.",
        variant: "destructive"
      });
    }
  };
  if (isLoading) {
    return <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>;
  }
  return <AdminLayout>
      <div className="space-y-6 w-full max-w-4xl">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Paramètres</h1>
          <p className="text-muted-foreground">Configuration de votre boutique</p>
        </div>

        {/* Contact Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Contact</CardTitle>
            <CardDescription>Informations de contact affichées aux clients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Numéro WhatsApp</Label>
              <Input value={formData.whatsapp_number} onChange={e => setFormData({
              ...formData,
              whatsapp_number: formatPhoneNumber(e.target.value)
            })} placeholder="+216 XX XXX XXX" />
            </div>

            <div className="space-y-2">
              <Label>Nom d'utilisateur Telegram</Label>
              <Input value={formData.telegram_username} onChange={e => setFormData({
              ...formData,
              telegram_username: formatTelegram(e.target.value)
            })} placeholder="missboutique" />
            </div>

          </CardContent>
        </Card>

        {/* Telegram Notifications */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="w-5 h-5" />
              Notifications Telegram
            </CardTitle>
            <CardDescription>
              Recevez les nouvelles commandes directement sur Telegram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Activer les notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les commandes sur Telegram
                </p>
              </div>
              <Switch checked={formData.notifications_enabled} onCheckedChange={checked => setFormData({
              ...formData,
              notifications_enabled: checked
            })} />
            </div>

            <div className="space-y-2">
              <Label>Token du Bot</Label>
              <div className="relative">
                <Input type={showBotToken ? "text" : "password"} value={formData.telegram_bot_token} onChange={e => setFormData({
                ...formData,
                telegram_bot_token: e.target.value
              })} placeholder="123456789:ABCdefGHI..." className="pr-10" />
                <button type="button" onClick={() => setShowBotToken(!showBotToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Obtenez-le via @BotFather sur Telegram
              </p>
            </div>

            <div className="space-y-2">
              <Label>Chat ID</Label>
              <Input value={formData.telegram_chat_id} onChange={e => setFormData({
              ...formData,
              telegram_chat_id: e.target.value
            })} placeholder="123456789" />
              <p className="text-xs text-muted-foreground">
                Envoyez un message à votre bot, puis visitez: api.telegram.org/bot&lt;TOKEN&gt;/getUpdates
              </p>
            </div>

            <Button type="button" variant="outline" onClick={testTelegramNotification} disabled={testingNotification || !formData.telegram_bot_token || !formData.telegram_chat_id} className="w-full border-primary text-foreground hover:bg-primary/10">
              {testingNotification ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Tester la notification
            </Button>
          </CardContent>
        </Card>

        {/* Stock Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              Gestion du Stock
            </CardTitle>
            <CardDescription>Paramètres d'alerte de stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Seuil de stock faible</Label>
              <Input type="number" min="1" max="100" value={formData.low_stock_threshold} onChange={e => setFormData({
              ...formData,
              low_stock_threshold: parseInt(e.target.value) || 10
            })} placeholder="10" />
              <p className="text-xs text-muted-foreground">
                Les produits avec un stock inférieur à ce nombre seront marqués comme "stock faible"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Livraison</CardTitle>
            <CardDescription>Zones de livraison indisponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Zones indisponibles</Label>
              <Input value={formData.delivery_zones} onChange={e => setFormData({
              ...formData,
              delivery_zones: e.target.value
            })} placeholder="Hors Tunisie" />
              <p className="text-xs text-muted-foreground">
                Zones où la livraison n'est pas disponible
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Affichage</CardTitle>
            <CardDescription>Options d'affichage du site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Afficher le crédit portfolio</Label>
                <p className="text-sm text-muted-foreground">
                  "Conçu et développé avec passion par Mohamed Jaouadi" dans le footer
                </p>
              </div>
              <Switch checked={formData.show_footer_credit} onCheckedChange={checked => setFormData({
              ...formData,
              show_footer_credit: checked
            })} />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={updateSettings.isPending} className="btn-luxury">
          {updateSettings.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Sauvegarder
        </Button>

        {/* Emergency Contact Section */}
        <Card className="bg-card border-border mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Support & Crédits
            </CardTitle>
            <CardDescription>En cas d'urgence, veuillez contacter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ahmed Hammed */}
            <div className="space-y-2">
              <h4 className="font-medium text-primary text-lg">Ahmed Hammed</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+216 28 534 675</span>
              </div>
              <Button variant="outline" size="sm" className="mt-2 border-foreground/30 text-foreground hover:bg-foreground/10" onClick={() => window.open("https://linkedin.com/in/ahmed-hammed", "_blank")}>
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </div>

            {/* Mohamed Jaouadi */}
            <div className="space-y-2 pt-4 border-t border-border">
              <h4 className="font-medium text-primary text-lg">Mohamed Jaouadi</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+216 95 672 911</span>
              </div>
              <Button variant="outline" size="sm" className="mt-2 border-foreground/30 text-foreground hover:bg-foreground/10" onClick={() => window.open("https://www.linkedin.com/in/mohamed-jaouaditn", "_blank")}>
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </div>

            {/* Business Number */}
            
          </CardContent>
        </Card>
      </div>
    </AdminLayout>;
};
export default AdminSettingsPage;