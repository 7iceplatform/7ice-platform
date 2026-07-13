"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AuthActions } from "./AuthActions";

function scrollToQuiz() {
  const el = document.getElementById("quiz");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

interface HeaderActionsProps {
  phone?: string;
}

export function HeaderActions({
  phone = "+7 (495) 000-00-00",
}: Readonly<HeaderActionsProps>) {
  return (
    <div className="hidden items-center gap-6 lg:flex">
      <Link
        href={`tel:${phone.replace(/\D/g, "")}`}
        className="text-sm font-semibold transition-colors hover:text-brand-blue"
      >
        {phone}
      </Link>

      <Button onClick={scrollToQuiz}>Получить расчет</Button>

      <AuthActions />
    </div>
  );
}
