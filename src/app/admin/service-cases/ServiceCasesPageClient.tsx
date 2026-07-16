"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ServiceCasesTable } from "@/components/admin/ServiceCasesTable/ServiceCasesTable";

interface ServiceCase {
  id: string;
  caseNumber: number;
  type: string;
  severity: string;
  status: string;
  title: string;
  contact: { id: string; firstName: string; lastName: string } | null;
  company: { id: string; name: string } | null;
  workOrderNumber: number | null;
  createdAt: string;
}

export function ServiceCasesPageClient() {
  const [cases, setCases] = useState<ServiceCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/service-cases", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCases(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-0">
      {loading ? (
        <div className="p-6 text-center text-sm text-brand-graphite/70">Загрузка...</div>
      ) : (
        <ServiceCasesTable cases={cases} />
      )}
    </Card>
  );
}
