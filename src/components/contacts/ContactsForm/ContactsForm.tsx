"use client";

import { useState } from "react";

import { Container } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";

export function ContactsForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
  }

  return (
    <section className="bg-surface-muted py-20">
      <Container>
        <div className="mx-auto max-w-[600px]">
          <div className="mb-8 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
              Обратная связь
            </span>
            <h2 className="mt-3 text-3xl font-bold text-brand-graphite">
              Оставьте заявку
            </h2>
            <p className="mt-3 text-sm text-brand-graphite/60">
              Мы перезвоним в течение 15 минут и ответим на ваши вопросы.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-card border border-border-subtle bg-brand-white p-8"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-brand-graphite"
                >
                  Имя
                </label>
                <TextInput
                  id="name"
                  placeholder="Как вас зовут?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-medium text-brand-graphite"
                >
                  Телефон
                </label>
                <TextInput
                  id="phone"
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-brand-graphite"
                >
                  Сообщение
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Опишите ваш объект или задачу..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="rounded-control bg-brand-white text-brand-graphite placeholder:text-brand-graphite/50 focus:border-brand-blue h-auto w-full resize-none border border-border-subtle px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit" fullWidth size="lg">
                Отправить заявку
              </Button>
            </div>

            <p className="mt-4 text-center text-xs text-brand-graphite/50">
              Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности.
            </p>
          </form>
        </div>
      </Container>
    </section>
  );
}
