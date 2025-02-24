import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { container } from "@/lib/di/container";
import type { IOrderService } from "@/lib/core/services/interfaces/order.service";
import { OrderList } from "@/components/orders/order-list";
import { getOrderItems } from "@/app/actions/order";

export default async function OrdersPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const orderService = container.resolve<IOrderService>("OrderService");
  const orders = await orderService.findByUserId(parseInt(user.id));

  // 各注文の商品情報を取得
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => ({
      ...order,
      items: await getOrderItems(order.id),
    }))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderList orders={ordersWithItems} />
    </div>
  );
}
