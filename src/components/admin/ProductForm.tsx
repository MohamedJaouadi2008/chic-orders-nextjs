"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProductSizeSelector } from "./ProductSizeSelector";
import { ImageInputManager } from "./ImageInputManager";
import { Loader2 } from "lucide-react";
import type { Product, Category } from "@/types/database";

const productSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(200, "Nom trop long"),
  slug: z.string().trim().max(200, "Slug trop long").optional(),
  description: z.string().trim().max(2000, "Description trop longue").optional(),
  price: z.coerce.number().positive("Le prix doit être supérieur à 0"),
  stock: z.coerce.number().int().min(0, "Le stock ne peut pas être négatif"),
  category_id: z.string().optional(),
  season: z.enum(["summer", "winter", "all_season"]).optional(),
  is_active: z.boolean(),
  discount_value: z.coerce.number().min(0, "La valeur doit être positive").optional(),
  discount_type: z.enum(["percent", "fixed"]).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSubmit: (data: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    stock: number;
    category_id?: string;
    season?: string;
    size_options: string[];
    images: string[];
    is_active: boolean;
    discount_value?: number;
    discount_type?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({
  product,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}: ProductFormProps) {
  const [sizeOptions, setSizeOptions] = useState<string[]>(product?.size_options || []);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [formError, setFormError] = useState<string | null>(null);
  const [hasDiscount, setHasDiscount] = useState<boolean>(
    (product as any)?.discount_value > 0
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      description: product?.description || "",
      price: product?.price || 0,
      stock: product?.stock || 0,
      category_id: product?.category_id || "",
      season: (product as any)?.season || "all_season",
      is_active: product?.is_active ?? true,
      discount_value: (product as any)?.discount_value || 0,
      discount_type: (product as any)?.discount_type || "percent",
    },
  });

  // Auto-generate slug from name (only for new products)
  const watchName = form.watch("name");
  useEffect(() => {
    if (!product && watchName) {
      const currentSlug = form.getValues("slug");
      if (!currentSlug || currentSlug === generateSlug(form.getValues("name").slice(0, -1))) {
        form.setValue("slug", generateSlug(watchName));
      }
    }
  }, [watchName, product, form]);

  const handleSubmit = async (values: ProductFormValues) => {
    setFormError(null);

    // Validate images
    if (images.length === 0) {
      setFormError("Au moins une image requise");
      return;
    }
    if (images.length > 6) {
      setFormError("Maximum 6 images autorisées");
      return;
    }

    // Validate sizes
    if (sizeOptions.length === 0) {
      setFormError("Au moins une taille requise");
      return;
    }

    await onSubmit({
      name: values.name,
      slug: values.slug || generateSlug(values.name),
      description: values.description || undefined,
      price: values.price,
      stock: values.stock,
      category_id: values.category_id || undefined,
      season: values.season || undefined,
      size_options: sizeOptions,
      images: images,
      is_active: values.is_active,
      discount_value: hasDiscount ? values.discount_value : 0,
      discount_type: hasDiscount ? values.discount_type : "percent",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du produit *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Jean taille haute..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (URL)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="auto-généré si vide" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} placeholder="Description du produit..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (TND) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock *</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Season Selector */}
        <FormField
          control={form.control}
          name="season"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Saison</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une saison" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all_season">Toutes saisons</SelectItem>
                  <SelectItem value="summer">Été (L'Été)</SelectItem>
                  <SelectItem value="winter">Hiver (L'Hiver)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <ProductSizeSelector value={sizeOptions} onChange={setSizeOptions} />

        <ImageInputManager value={images} onChange={setImages} />

        {/* Product Discount Section */}
        <div className="space-y-3 p-4 border border-border rounded-md">
          <div className="flex items-center gap-2">
            <Switch
              checked={hasDiscount}
              onCheckedChange={setHasDiscount}
            />
            <Label>Appliquer une réduction</Label>
          </div>

          {hasDiscount && (
            <div className="space-y-3 pt-2">
              <FormField
                control={form.control}
                name="discount_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de réduction</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="percent" id="discount-percent" />
                          <Label htmlFor="discount-percent" className="font-normal cursor-pointer">
                            Pourcentage (%)
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="fixed" id="discount-fixed" />
                          <Label htmlFor="discount-fixed" className="font-normal cursor-pointer">
                            Montant fixe (TND)
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Valeur de la réduction {form.watch("discount_type") === "percent" ? "(%)" : "(TND)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max={form.watch("discount_type") === "percent" ? 100 : undefined}
                        step={form.watch("discount_type") === "percent" ? 1 : 0.01}
                        {...field}
                        className="w-32"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0">Produit actif</FormLabel>
            </FormItem>
          )}
        />

        {formError && (
          <p className="text-sm text-destructive text-center">{formError}</p>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {product ? "Modifier" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
