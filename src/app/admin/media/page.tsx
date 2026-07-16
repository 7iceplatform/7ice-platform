import type { Metadata } from "next";

import { MediaLibrary } from "@/components/admin/MediaLibrary/MediaLibrary";

export const metadata: Metadata = {
  title: "Медиа",
};

export default function AdminMediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-graphite">Медиа</h1>
        <p className="mt-2 text-sm text-brand-graphite/70">
          Загрузка и управление файлами: изображения, документы.
        </p>
      </div>

      <MediaLibrary />
    </div>
  );
}
