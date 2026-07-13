import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="7ice"
      className="flex items-center"
    >
      <Image
        src="/brand/logo.svg"
        alt="7ice"
        width={140}
        height={46}
        priority
      />
    </Link>
  );
}