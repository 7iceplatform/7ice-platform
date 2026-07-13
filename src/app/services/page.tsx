import type { Metadata } from "next";

import { PublicLayout } from "@/components/layout";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ServicesList } from "@/components/services/ServicesList";
import { ServicesProcess } from "@/components/services/ServicesProcess";
import { ServicesCTA } from "@/components/services/ServicesCTA";

export const metadata: Metadata = {
  title: "Услуги",
  description:
    "Проектирование, монтаж, обслуживание и ремонт климатических систем в Москве и Московской области.",
};

export default function ServicesPage() {
  return (
    <PublicLayout>
      <ServicesHero />
      <ServicesList />
      <ServicesProcess />
      <ServicesCTA />
    </PublicLayout>
  );
}
