import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { prisma } from "@/server/db/prisma";
import { PublicLayout } from "@/components/layout";
import { imageLoader } from "@/lib/image-loader";

interface CmsPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join("/");

  const page = await prisma.page.findFirst({
    where: { slug: slugPath, status: "PUBLISHED" },
  });

  if (!page) {
    return { title: "Страница не найдена" };
  }

  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDesc ?? page.description ?? undefined,
  };
}

function renderBlock(block: { id: string; type: string; content: Record<string, unknown> | null }) {
  const raw = block.content as unknown;
  const content = (typeof raw === "object" && raw !== null && !Array.isArray(raw)) ? raw as Record<string, unknown> : null;
  if (!content) return null;

  switch (block.type) {
    case "HEADING":
      return (
        <h2 key={block.id} className="mb-4 text-xl font-semibold text-brand-graphite">
          {typeof content.heading === "string" ? content.heading : ""}
        </h2>
      );

    case "TEXT":
      return (
        <div key={block.id} className="mb-6 prose prose-brand max-w-none text-brand-graphite/80">
          {typeof content.body === "string" ? content.body : ""}
        </div>
      );

    case "IMAGE":
      return (
        <figure key={block.id} className="mb-6">
          {typeof content.url === "string" && content.url ? (
            <Image
              loader={imageLoader}
              src={content.url}
              alt={typeof content.alt === "string" ? content.alt : ""}
              width={800}
              height={450}
              className="w-full rounded-lg object-cover"
            />
          ) : null}
          {typeof content.alt === "string" && content.alt ? (
            <figcaption className="mt-2 text-center text-sm text-brand-graphite/50">
              {content.alt}
            </figcaption>
          ) : null}
        </figure>
      );

    case "LIST": {
      const items = Array.isArray(content.items) ? content.items : [];
      return (
        <ul key={block.id} className="mb-6 list-disc space-y-1 pl-6 text-brand-graphite/80">
          {items.map((item, i) => (
            <li key={i}>{typeof item === "string" ? item : String(item)}</li>
          ))}
        </ul>
      );
    }

    case "QUOTE":
      return (
        <blockquote
          key={block.id}
          className="mb-6 border-l-4 border-brand-blue pl-4 italic text-brand-graphite/70"
        >
          <p>{typeof content.text === "string" ? content.text : ""}</p>
          {typeof content.author === "string" && content.author ? (
            <cite className="mt-2 block text-sm not-italic">— {content.author}</cite>
          ) : null}
        </blockquote>
      );

    case "HTML":
      return (
        <div
          key={block.id}
          className="mb-6"
          dangerouslySetInnerHTML={{ __html: typeof content.html === "string" ? content.html : "" }}
        />
      );

    case "SPACER":
      return <div key={block.id} className="my-8" />;

    default:
      return null;
  }
}

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");

  const page = await prisma.page.findFirst({
    where: { slug: slugPath, status: "PUBLISHED" },
    include: {
      revisions: {
        where: { status: "PUBLISHED" },
        orderBy: { version: "desc" },
        take: 1,
        include: {
          blocks: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!page) {
    notFound();
  }

  const revision = page.revisions[0];

  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-bold text-brand-graphite">{page.title}</h1>
        {page.description && (
          <p className="mb-8 text-lg text-brand-graphite/70">{page.description}</p>
        )}
        {revision?.blocks.map((block) => renderBlock({ ...block, content: block.content as Record<string, unknown> | null }))}
        {!revision || revision.blocks.length === 0 ? (
          <p className="text-brand-graphite/50">Контент страницы пока не добавлен.</p>
        ) : null}
      </article>
    </PublicLayout>
  );
}
