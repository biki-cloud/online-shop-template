"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { CartItem } from "@/lib/core/domain/cart.domain";
import type { Product } from "@/lib/core/domain/product.domain";
import { formatPrice } from "@/lib/shared/utils";

interface AnimatedCartItemsProps {
  items: (CartItem & {
    product: Product | null;
  })[];
}

export function AnimatedCartItems({ items }: AnimatedCartItemsProps) {
  return (
    <AnimatePresence>
      <div className="space-y-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50"
          >
            {item.product?.imageUrl && (
              <div className="relative h-24 w-24 overflow-hidden rounded-md">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="object-cover w-full h-full transform transition-transform hover:scale-110"
                />
              </div>
            )}
            <div className="flex-1 space-y-1">
              <h3 className="font-medium">{item.product?.name}</h3>
              <p className="text-sm text-muted-foreground">
                数量: {item.quantity}
              </p>
              <p className="font-medium">
                {item.product &&
                  formatPrice(
                    Number(item.product.price) * item.quantity,
                    item.product.currency
                  )}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
