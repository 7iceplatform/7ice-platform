import { Header } from "../Header";
import { Footer } from "../Footer";
import { Main } from "../Main";
import { Page } from "../Page";

import { mainNavigation } from "@/config/navigation/main-navigation";

import type { PublicLayoutProps } from "./PublicLayout.types";

export function PublicLayout({
  children,
}: Readonly<PublicLayoutProps>) {
  return (
    <Page>
      <Header navigation={mainNavigation} />

      <Main>
        {children}
      </Main>

      <Footer />
    </Page>
  );
}