import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { HeaderActionsProps } from "./HeaderActions.types";

export function HeaderActions({
  phone = "+7 (495) 000-00-00",
}: Readonly<HeaderActionsProps>) {
  return (
    <div className="hidden items-center gap-6 lg:flex">
      <Link
        href={`tel:${phone.replace(/\D/g, "")}`}
        className="text-sm font-semibold transition-colors hover:text-primary"
      >
        {phone}
      </Link>

      <Button>
        Получить расчет
      </Button>
    </div>
  );
}