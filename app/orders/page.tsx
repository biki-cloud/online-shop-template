import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionService } from "@/lib/di/container";
import { getUserOrders, getOrderItems } from "@/app/actions/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/shared/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

// Client Componentとして分離
import { OrderList } from "@/components/orders/order-list";

export default async function OrdersPage() {
  const sessionService = getSessionService();
  const session = await sessionService.get();
  if (!session) {
    redirect("/sign-in");
  }

  const orders = await getUserOrders(session.userId);
  const completedOrders = orders.filter((order) => order.status === "paid");

  // 各注文のアイテム情報を取得
  const ordersWithItems = await Promise.all(
    completedOrders.map(async (order) => {
      const items = await getOrderItems(order.id);
      return { ...order, items };
    })
  );

  return (
    <div className="container max-w-4xl py-24">
      <Card className="bg-white/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold text-primary">
            注文履歴
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[600px] pr-4">
            {ordersWithItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <svg
                  className="w-12 h-12 mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p>注文履歴がありません</p>
              </div>
            ) : (
              <OrderList orders={ordersWithItems} />
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
