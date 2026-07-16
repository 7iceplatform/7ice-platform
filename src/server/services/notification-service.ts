import { prisma } from "@/server/db/prisma";

interface CreateNotificationParams {
  title: string;
  body: string;
  channel?: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
  category?: "TRANSACTIONAL" | "OPERATIONAL" | "SECURITY" | "MARKETING";
  userId?: string;
  referenceType?: string;
  referenceId?: string;
  dedupKey?: string;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

let lastCleanup = Date.now();
function cleanupRateLimit() {
  const now = Date.now();
  if (now - lastCleanup < RATE_LIMIT_CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}

function checkRateLimit(key: string): boolean {
  cleanupRateLimit();
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

function isInQuietHours(prefs: { quietHoursStart: string | null; quietHoursEnd: string | null; timezone: string | null } | null): boolean {
  if (!prefs?.quietHoursStart || !prefs?.quietHoursEnd) return false;

  const tz = prefs.timezone ?? "Europe/Moscow";
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  });
  const currentTime = formatter.format(now);

  const start = prefs.quietHoursStart;
  const end = prefs.quietHoursEnd;

  if (start <= end) {
    return currentTime >= start && currentTime < end;
  }
  return currentTime >= start || currentTime < end;
}

async function createNotification(params: CreateNotificationParams) {
  if (params.dedupKey) {
    const existing = await prisma.notification.findUnique({
      where: { dedupKey: params.dedupKey },
      select: { id: true },
    });
    if (existing) return existing;
  }

  if (params.userId) {
    const rateLimitKey = `notif:${params.userId}`;
    if (!checkRateLimit(rateLimitKey)) {
      return prisma.notification.create({
        data: {
          title: params.title,
          body: params.body,
          channel: params.channel ?? "IN_APP",
          category: params.category ?? "OPERATIONAL",
          status: "SUPPRESSED",
          userId: params.userId,
          dedupKey: params.dedupKey ?? null,
          referenceType: params.referenceType || null,
          referenceId: params.referenceId || null,
        },
      });
    }

    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId: params.userId },
    });

    if (prefs && isInQuietHours(prefs)) {
      return prisma.notification.create({
        data: {
          title: params.title,
          body: params.body,
          channel: "IN_APP",
          category: params.category ?? "OPERATIONAL",
          status: "PENDING",
          userId: params.userId,
          dedupKey: params.dedupKey ?? null,
          referenceType: params.referenceType || null,
          referenceId: params.referenceId || null,
        },
      });
    }
  }

  if (params.category === "MARKETING" && params.userId) {
    const contact = await prisma.contact.findFirst({
      where: { 
        email: { not: null },
      },
    });
    // If no marketing consent found, suppress the notification
    if (contact) {
      const consent = await prisma.consent.findFirst({
        where: {
          contactId: contact.id,
          purpose: "MARKETING",
          status: "GRANTED",
        },
      });
      if (!consent) {
        return prisma.notification.create({
          data: {
            title: params.title,
            body: params.body,
            channel: params.channel ?? "IN_APP",
            category: "MARKETING",
            status: "SUPPRESSED",
            userId: params.userId,
            dedupKey: params.dedupKey ?? null,
            referenceType: params.referenceType || null,
            referenceId: params.referenceId || null,
          },
        });
      }
    }
  }

  return prisma.notification.create({
    data: {
      title: params.title,
      body: params.body,
      channel: params.channel ?? "IN_APP",
      category: params.category ?? "OPERATIONAL",
      userId: params.userId || null,
      dedupKey: params.dedupKey ?? null,
      referenceType: params.referenceType || null,
      referenceId: params.referenceId || null,
    },
  });
}

async function notifyWorkOrderCreated(order: { id: string; title: string; workOrderNumber: number; type: string }) {
  return createNotification({
    title: `Новый заказ #${order.workOrderNumber}`,
    body: `Создан заказ «${order.title}» типа ${order.type}`,
    category: "OPERATIONAL",
    referenceType: "work_order",
    referenceId: order.id,
    dedupKey: `work_order_created:${order.id}`,
  });
}

async function notifyWorkOrderStatusChanged(order: { id: string; title: string; workOrderNumber: number }, from: string, to: string) {
  const statusLabels: Record<string, string> = {
    DRAFT: "Черновик",
    PLANNED: "Запланирован",
    SCHEDULED: "Назначен",
    IN_PROGRESS: "В работе",
    ON_HOLD: "Приостановлен",
    QUALITY_REVIEW: "Проверка",
    COMPLETED: "Завершён",
    CANCELLED: "Отменён",
  };

  return createNotification({
    title: `Заказ #${order.workOrderNumber} — ${statusLabels[to] ?? to}`,
    body: `Статус заказа «${order.title}» изменён: ${statusLabels[from] ?? from} → ${statusLabels[to] ?? to}`,
    category: "OPERATIONAL",
    referenceType: "work_order",
    referenceId: order.id,
    dedupKey: `work_order_status:${order.id}:${from}:${to}`,
  });
}

async function notifyInvoiceIssued(invoice: { id: string; invoiceNumber: number; amountCents: number; taxCents: number }) {
  const total = (invoice.amountCents + invoice.taxCents) / 100;
  return createNotification({
    title: `Счёт #${invoice.invoiceNumber} выставлен`,
    body: `Выставлен счёт на сумму ${total.toLocaleString("ru-RU")} ₽`,
    category: "TRANSACTIONAL",
    referenceType: "invoice",
    referenceId: invoice.id,
    dedupKey: `invoice_issued:${invoice.id}`,
  });
}

async function notifyInvoicePaid(invoice: { id: string; invoiceNumber: number }) {
  return createNotification({
    title: `Счёт #${invoice.invoiceNumber} оплачен`,
    body: `Получена оплата по счёту #${invoice.invoiceNumber}`,
    category: "TRANSACTIONAL",
    referenceType: "invoice",
    referenceId: invoice.id,
    dedupKey: `invoice_paid:${invoice.id}`,
  });
}

async function notifyContactCreated(contact: { id: string; firstName: string; lastName: string | null }) {
  const name = `${contact.firstName} ${contact.lastName ?? ""}`.trim();
  return createNotification({
    title: "Новый контакт",
    body: `Добавлен контакт: ${name}`,
    category: "OPERATIONAL",
    referenceType: "contact",
    referenceId: contact.id,
    dedupKey: `contact_created:${contact.id}`,
  });
}

async function notifyDealStageChanged(deal: { id: string; title: string }, from: string, to: string) {
  const stageLabels: Record<string, string> = {
    NEW: "Новый",
    QUALIFIED: "Квалификация",
    PROPOSAL: "Предложение",
    NEGOTIATION: "Переговоры",
    WON: "Выигран",
    LOST: "Проигран",
  };

  return createNotification({
    title: `Сделка «${deal.title}»`,
    body: `Стадия изменена: ${stageLabels[from] ?? from} → ${stageLabels[to] ?? to}`,
    category: "OPERATIONAL",
    referenceType: "deal",
    referenceId: deal.id,
    dedupKey: `deal_stage:${deal.id}:${from}:${to}`,
  });
}

async function notifyPaymentReceived(payment: { id: string; amountCents: number; invoiceNumber: number }) {
  const amount = payment.amountCents / 100;
  return createNotification({
    title: "Платёж получен",
    body: `Получен платёж ${amount.toLocaleString("ru-RU")} ₽ по счёту #${payment.invoiceNumber}`,
    category: "TRANSACTIONAL",
    referenceType: "payment",
    referenceId: payment.id,
    dedupKey: `payment_received:${payment.id}`,
  });
}

export const notificationService = {
  create: createNotification,
  workOrderCreated: notifyWorkOrderCreated,
  workOrderStatusChanged: notifyWorkOrderStatusChanged,
  invoiceIssued: notifyInvoiceIssued,
  invoicePaid: notifyInvoicePaid,
  contactCreated: notifyContactCreated,
  dealStageChanged: notifyDealStageChanged,
  paymentReceived: notifyPaymentReceived,
};
