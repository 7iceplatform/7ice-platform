import Link from "next/link";

import { company } from "@/config/company";

export function HeaderTop() {
  return (
    <div className="hidden border-b border-white/5 bg-[#0B1120] lg:block">
      <div className="mx-auto flex h-10 max-w-[1440px] items-center justify-between px-8">

        <span className="text-xs text-slate-400">
          {company.city}
        </span>

        <div className="flex items-center gap-6">

          <Link
            href={company.phoneHref}
            className="text-xs text-slate-300 hover:text-white"
          >
            {company.phone}
          </Link>

          <Link
            href={`mailto:${company.email}`}
            className="text-xs text-slate-300 hover:text-white"
          >
            {company.email}
          </Link>

        </div>

      </div>
    </div>
  );
}