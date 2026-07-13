import { HeaderTop } from "./HeaderTop";
import { Container } from "../Container";
import { DesktopNavigation } from "../DesktopNavigation";
import { HeaderActions } from "../HeaderActions";
import { Logo } from "../Logo";

import type { HeaderProps } from "./Header.types";

export function Header({
  navigation,
}: Readonly<HeaderProps>) {
  return (
    <>
      <HeaderTop />

      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <Container size="wide">
          <div className="flex h-[88px] items-center justify-between">
            <Logo />

            <DesktopNavigation
              items={navigation}
            />

            <HeaderActions />
          </div>
        </Container>
      </header>
    </>
  );
}