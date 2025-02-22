"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/shared/utils";
import { Order, OrderItem } from "@/lib/core/domain/order";

interface OrderListProps {
  orders: (Order & { items: OrderItem[] })[];
}

export function OrderList({ orders }: OrderListProps) {
  return (
    <div className="grid gap-4">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Link
            href={`/orders/${order.id}`}
            className="block transition-all duration-200 hover:scale-[1.02]"
          >
            <Card className="overflow-hidden border-none shadow-md hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">
                        注文番号: {order.id}
                      </h3>
                      <Badge variant="secondary" className="ml-2">
                        支払い完了
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      注文日:{" "}
                      {new Date(order.createdAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">
                          {formatPrice(
                            Number(order.totalAmount),
                            order.currency
                          )}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {order.items.length}点の商品
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="relative w-16 h-16 overflow-hidden rounded-lg border"
                      >
                        {item.product?.imageUrl && (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="relative w-16 h-16 flex items-center justify-center rounded-lg bg-gray-100">
                        <span className="text-sm text-gray-600">
                          +{order.items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
