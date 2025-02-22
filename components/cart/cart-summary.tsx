"use client";

import { Button } from "@/components/ui/button";
import { CartItem, Product } from "@/lib/infrastructure/db/schema";
import { formatPrice } from "@/lib/shared/utils";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

interface CartSummaryProps {
  items: (CartItem & {
    product: Product | null;
  })[];
}

export function CartSummary({ items }: CartSummaryProps) {
  const router = useRouter();

  const subtotal = items.reduce(
    (total, item) =>
      total + (item.product ? Number(item.product.price) * item.quantity : 0),
    0
  );

  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>注文内容</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">小計</span>
              <span>{formatPrice(subtotal, "JPY")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">消費税（10%）</span>
              <span>{formatPrice(tax, "JPY")}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>合計</span>
              <span className="text-lg">{formatPrice(total, "JPY")}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={items.length === 0}
          >
            レジに進む
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
