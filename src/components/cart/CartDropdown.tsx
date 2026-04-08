"use client";
import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { CartCheckoutModal } from "./CartCheckoutModal";
import { formatPrice } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CartDropdown() {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    setIsOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="relative p-2 text-foreground/60 hover:text-foreground transition-colors"
            aria-label="Panier"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 sm:w-96 p-0"
          align="end"
          sideOffset={8}
        >
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Panier ({totalItems})</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <ShoppingCart className="mx-auto mb-3 opacity-30" size={40} />
              <p>Votre panier est vide</p>
            </div>
          ) : (
            <>
              <ScrollArea className="max-h-[300px]">
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}`}
                      className="flex gap-3"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 flex-shrink-0 bg-muted/30 overflow-hidden">
                        <img
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Taille: {item.size}
                        </p>
                        <p className="text-sm font-medium text-primary mt-1">
                          {formatPrice(item.product.final_price * item.quantity)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeFromCart(item.product.id, item.size)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="flex items-center gap-1 border border-border rounded-md">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size,
                                item.quantity - 1
                              )
                            }
                            className="p-1 hover:bg-muted transition-colors"
                            aria-label="Diminuer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size,
                                item.quantity + 1
                              )
                            }
                            className="p-1 hover:bg-muted transition-colors"
                            aria-label="Augmenter"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-lg font-semibold text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full btn-luxury"
                >
                  Commander
                </Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>

      <CartCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
