import type { Metadata } from "next";

import { PublicLayout } from "@/components/layout";
import { CatalogHero } from "@/components/catalog/CatalogHero";
import { CatalogCategories } from "@/components/catalog/CatalogCategories";
import { CatalogProducts } from "@/components/catalog/CatalogProducts";
import { CatalogCTA } from "@/components/catalog/CatalogCTA";

export const metadata: Metadata = {
  title: "Каталог",
  description:
    "Кондиционеры, вентиляция и VRF-системы для квартир, домов и офисов. Подбор оборудования с гарантией и монтажом за 1 день.",
};

export default function CatalogPage() {
  return (
    <PublicLayout>
      <CatalogHero />
      <CatalogCategories />
      <CatalogProducts />
      <CatalogCTA />
    </PublicLayout>
  );
}
