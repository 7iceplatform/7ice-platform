import type { Metadata } from "next";

import { PublicLayout } from "@/components/layout";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutValues } from "@/components/about/AboutValues";
import { AboutTeam } from "@/components/about/AboutTeam";
import { AboutCTA } from "@/components/about/AboutCTA";

export const metadata: Metadata = {
  title: "О компании",
  description:
    "7ice — цифровая климатическая платформа. Проектируем, устанавливаем и обслуживаем климатические системы с 2018 года.",
};

export default function AboutPage() {
  return (
    <PublicLayout>
      <AboutHero />
      <AboutValues />
      <AboutTeam />
      <AboutCTA />
    </PublicLayout>
  );
}
