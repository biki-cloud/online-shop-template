"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem, Product } from "@/lib/infrastructure/db/schema";
import { formatPrice } from "@/lib/shared/utils";
import { useState } from "react";
import { updateCartItemQuantity, removeFromCart } from "@/app/actions/cart";
import { Loader2, Trash2, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface CartItemsProps {
  items: (CartItem & {
    product: Product | null;
  })[];
}

export function CartItems({ items }: CartItemsProps) {
  const [loading, setLoading] = useState<number | null>(null);
  const router = useRouter();

  const handleQuantityChange = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    setLoading(itemId);
    await updateCartItemQuantity(itemId, quantity);
    setLoading(null);
    router.refresh();
  };

  const handleRemove = async (itemId: number) => {
    setLoading(itemId);
    await removeFromCart(itemId);
    setLoading(null);
    router.refresh();
  };

  if (items.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">カートは空です</p>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-4 p-1">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="relative w-32 h-32 overflow-hidden rounded-lg">
                    <Image
                      src={item.product?.imageUrl ?? ""}
                      alt={item.product?.name ?? ""}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                      sizes="128px"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium leading-none">
                          {item.product?.name ?? ""}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.product?.description ?? ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id)}
                        disabled={loading === item.id}
                        className="h-8 w-8"
                      >
                        {loading === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-lg">
                        {item.product?.price && item.product?.currency
                          ? formatPrice(
                              Number(item.product.price),
                              item.product.currency
                            )
                          : "-"}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={loading === item.id || item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-16 text-center"
                          min={1}
                          disabled={loading === item.id}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={loading === item.id}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
