import { redirect } from "next/navigation";
import { getSessionService } from "@/lib/di/container";
import { getOrderById, getOrderItems } from "@/app/actions/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/shared/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Package, Truck, CreditCard } from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const sessionService = getSessionService();
  const session = await sessionService.get();
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const orderId = parseInt(id);
  const order = await getOrderById(orderId);

  if (!order) {
    redirect("/orders");
  }

  // 他のユーザーの注文は見れないようにする
  if (order.userId !== session.userId) {
    redirect("/orders");
  }

  // 支払い済みの注文のみ表示
  if (order.status !== "paid") {
    redirect("/orders");
  }

  const orderItems = await getOrderItems(orderId);
  const orderDate = new Date(order.createdAt);

  return (
    <div className="container max-w-4xl py-12">
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="space-y-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">注文詳細</CardTitle>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white hover:bg-white/30"
            >
              支払い完了
            </Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Package className="h-4 w-4" />
              <span>注文番号: {order.id}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CreditCard className="h-4 w-4" />
              <span>
                {orderDate.toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {orderItems.map((item, index) => (
                <div key={item.id}>
                  <div className="flex items-start space-x-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-lg border bg-gray-50">
                      {item.product?.imageUrl && (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 96px) 100vw, 96px"
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium leading-none">
                        {item.product?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        数量: {item.quantity}
                      </p>
                      <p className="font-medium text-purple-600">
                        {formatPrice(
                          Number(item.price) * item.quantity,
                          item.currency
                        )}
                      </p>
                    </div>
                  </div>
                  {index < orderItems.length - 1 && (
                    <Separator className="my-6" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-6 space-y-4">
            <Separator />
            <div className="flex items-center justify-between pt-4">
              <div className="text-lg font-semibold">合計</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatPrice(Number(order.totalAmount), order.currency)}
              </div>
            </div>
            {order.shippingAddress && (
              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Truck className="h-4 w-4" />
                  <span>配送先住所:</span>
                </div>
                <p className="mt-1 text-sm">{order.shippingAddress}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
