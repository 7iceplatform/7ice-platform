import type { Metadata } from "next";

import { PublicLayout } from "@/components/layout";
import { ContactsHero } from "@/components/contacts/ContactsHero";
import { ContactsInfo } from "@/components/contacts/ContactsInfo";
import { ContactsForm } from "@/components/contacts/ContactsForm";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Свяжитесь с нами для консультации, расчета стоимости или записи на замер. Москва и Московская область.",
};

export default function ContactsPage() {
  return (
    <PublicLayout>
      <ContactsHero />
      <ContactsInfo />
      <ContactsForm />
    </PublicLayout>
  );
}
