import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { WorkOrdersTable } from "@/components/admin/WorkOrdersTable/WorkOrdersTable";

export const metadata: Metadata = {
  title: "Заказы",
};

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-graphite">Заказы</h1>
          <p className="mt-2 text-sm text-brand-graphite/70">
            Управление заказами на монтаж и обслуживание.
          </p>
        </div>
        <Link href={"/admin/orders/new" as Route}>
          <Button>Новый заказ</Button>
        </Link>
      </div>

      <WorkOrdersTable />
    </div>
  );
}
