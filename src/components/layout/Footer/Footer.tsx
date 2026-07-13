import { Container } from "../Container";
import { Logo } from "../Logo";

import type { FooterProps } from "./Footer.types";

export function Footer({
  copyright = `© ${new Date().getFullYear()} 7ice`,
}: Readonly<FooterProps>) {
  return (
    <footer className="border-t border-border">
      <Container size="wide">
        <div className="flex min-h-24 items-center justify-between py-6">
          <Logo />

          <span className="text-sm text-muted-foreground">
            {copyright}
          </span>
        </div>
      </Container>
    </footer>
  );
}