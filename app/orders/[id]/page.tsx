import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { getOrderById, getOrderItems } from "@/app/actions/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/shared/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

interface OrderDetailPageProps {
  params: { id: string };
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const order = await getOrderById(parseInt(params.id));
  if (!order || order.userId !== parseInt(user.id)) {
    redirect("/orders");
  }

  const orderItems = await getOrderItems(order.id);
  const subtotal = orderItems.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );
  const tax = Math.floor(subtotal * 0.1);
  const total = subtotal + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>注文詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">注文番号</p>
                <p className="text-sm text-gray-500">#{order.id}</p>
              </div>
              <Badge variant="outline">{order.status}</Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">注文商品</p>
              <ScrollArea className="h-72">
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="relative h-16 w-16">
                        {item.product?.imageUrl && (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {item.product?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          数量: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(Number(item.price) * item.quantity, "JPY")}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>小計</span>
                <span>{formatPrice(subtotal, "JPY")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>消費税</span>
                <span>{formatPrice(tax, "JPY")}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>合計</span>
                <span>{formatPrice(total, "JPY")}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
