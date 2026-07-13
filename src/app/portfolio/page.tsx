import type { Metadata } from "next";

import { PublicLayout } from "@/components/layout";
import { PortfolioHero } from "@/components/portfolio/PortfolioHero";
import { PortfolioProjects } from "@/components/portfolio/PortfolioProjects";
import { PortfolioStats } from "@/components/portfolio/PortfolioStats";
import { PortfolioCTA } from "@/components/portfolio/PortfolioCTA";

export const metadata: Metadata = {
  title: "Портфолио",
  description:
    "Примеры выполненных проектов по монтажу и обслуживанию климатических систем в Москве и Московской области.",
};

export default function PortfolioPage() {
  return (
    <PublicLayout>
      <PortfolioHero />
      <PortfolioStats />
      <PortfolioProjects />
      <PortfolioCTA />
    </PublicLayout>
  );
}
