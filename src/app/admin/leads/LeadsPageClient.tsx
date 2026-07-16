"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LeadsTable } from "@/components/admin/LeadsTable/LeadsTable";

interface Lead {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string;
  status: string;
  campaign: string | null;
  createdAt: string;
}

export function LeadsPageClient() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/leads", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setLeads(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-0">
      {loading ? (
        <div className="p-6 text-center text-sm text-brand-graphite/70">Загрузка...</div>
      ) : (
        <LeadsTable leads={leads} />
      )}
    </Card>
  );
}
