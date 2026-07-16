import type { Metadata } from "next";

import { PagesTable } from "@/components/admin/PagesTable";

export const metadata: Metadata = {
  title: "CMS — Страницы",
};

export default function AdminCmsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Страницы</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">
          Управление контентом страниц сайта.
        </p>
      </div>

      <PagesTable />
    </div>
  );
}
