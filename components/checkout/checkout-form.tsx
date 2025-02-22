"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Package, CreditCard } from "lucide-react";
import { AnimatedCartItems } from "@/components/checkout/animated-cart-items";
import type { CartItem } from "@/lib/core/domain/cart";
import type { Product } from "@/lib/core/domain/product";
import { formatPrice } from "@/lib/shared/utils";

interface CheckoutFormProps {
  cartItems: (CartItem & {
    product: Product | null;
  })[];
  subtotal: number;
  tax: number;
  total: number;
  onCheckout: () => Promise<void>;
}

export function CheckoutForm({
  cartItems,
  subtotal,
  tax,
  total,
  onCheckout,
}: CheckoutFormProps) {
  return (
    <div className="container max-w-5xl py-12 px-4 sm:py-24">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="space-y-8">
            <div className="flex items-center space-x-2 text-2xl font-semibold">
              <ShoppingCart className="h-8 w-8" />
              <h1>チェックアウト</h1>
            </div>

            <Card className="border-none shadow-none">
              <CardHeader className="px-0">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">注文内容</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <ScrollArea className="h-[400px] pr-4">
                  <AnimatedCartItems items={cartItems} />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:w-[380px]">
          <Card className="sticky top-8">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">注文の確認</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">小計</span>
                  <span>{formatPrice(subtotal, "JPY")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">消費税</span>
                  <span>{formatPrice(tax, "JPY")}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between font-medium">
                  <span>合計</span>
                  <span className="text-lg">{formatPrice(total, "JPY")}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <form action={onCheckout} className="w-full">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  注文を確定する
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
