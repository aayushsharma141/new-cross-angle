import type { ComponentProps } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ReactMarkdown, { type Components } from "react-markdown";
import { ArrowLeft, FileText } from "lucide-react";
import { ContentLink } from "@/content/ContentLink";
import { isSafeAddress } from "@/content/registry";
import type { LegalDocument } from "@/content/registry";

/**
 * Renders an editable legal document (Privacy Policy, Terms & Conditions).
 *
 * Bodies are Markdown written by a super admin. react-markdown never renders raw
 * HTML, and links are limited to site paths, http(s), mailto and tel, so pasted
 * text can't inject markup or a `javascript:` link.
 */

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: Math.min(i, 6) * 0.07, duration: 0.45, ease: "easeOut" as const } }),
};

const urlTransform = (url: string) => (isSafeAddress(url) ? url : "");

const body: Components = {
  p: (props) => <p className="mt-3 text-sm leading-relaxed text-white/65 first:mt-0" {...omitNode(props)} />,
  strong: (props) => <strong className="font-semibold text-white/85" {...omitNode(props)} />,
  em: (props) => <em className="text-white/70" {...omitNode(props)} />,
  ul: (props) => <ul className="mt-4 list-none space-y-2.5 p-0 first:mt-0" {...omitNode(props)} />,
  ol: (props) => <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-sm text-white/65 first:mt-0" {...omitNode(props)} />,
  li: ({ children }) => (
    <li className="flex gap-2.5 text-sm leading-relaxed text-white/65">
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-[#d1af6e]">•</span>
      <span className="min-w-0 [&>p]:mt-0">{children}</span>
    </li>
  ),
  h3: ({ children }) => <h3 className="mb-3 mt-8 text-xs font-bold uppercase tracking-widest text-white/50 first:mt-0">{children}</h3>,
  blockquote: (props) => (
    <blockquote className="my-5 rounded-xl border border-[#d1af6e]/15 bg-[#d1af6e]/5 p-5 [&>p]:text-white/70" {...omitNode(props)} />
  ),
  a: ({ href, children }) => (
    <ContentLink href={href ?? ""} className="text-[#d1af6e] underline underline-offset-2 transition-colors hover:text-white">
      {children}
    </ContentLink>
  ),
};

const lede: Components = {
  ...body,
  p: (props) => <p className="max-w-2xl text-lg leading-relaxed text-white/60" {...omitNode(props)} />,
  strong: (props) => <strong className="font-semibold text-white/80" {...omitNode(props)} />,
};

const note: Components = {
  ...body,
  p: (props) => <p className="text-center text-xs text-white/30" {...omitNode(props)} />,
  strong: (props) => <strong className="font-semibold text-white/50" {...omitNode(props)} />,
  a: ({ href, children }) => (
    <ContentLink href={href ?? ""} className="text-[#d1af6e] underline underline-offset-2 transition-colors hover:text-white">
      {children}
    </ContentLink>
  ),
};

/** react-markdown passes its AST `node` to every renderer; it must not reach the DOM. */
function omitNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const { node: _node, ...rest } = props;
  void _node;
  return rest;
}

type MarkdownProps = { children: string } & Pick<ComponentProps<typeof ReactMarkdown>, "components">;
const Markdown = ({ children, components }: MarkdownProps) => (
  <ReactMarkdown components={components} urlTransform={urlTransform}>
    {children}
  </ReactMarkdown>
);

export function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  return (
    <div className="container mx-auto max-w-4xl px-6">
      <Link to="/" className="group mb-12 inline-flex items-center text-sm text-white/40 transition-colors hover:text-[#d1af6e]">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
        Back to Home
      </Link>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-14">
        {doc.badge && (
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d1af6e]/20 bg-[#d1af6e]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#d1af6e]">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{doc.badge}</span>
          </div>
        )}
        <h1 className="mb-6 font-display text-[clamp(2.25rem,5vw,4rem)] font-normal leading-[1.05] tracking-[-0.02em]">
          {doc.titleLead}
          {doc.titleEmphasis && <> <span className="text-[#d1af6e]">{doc.titleEmphasis}</span></>}
        </h1>
        <Markdown components={lede}>{doc.intro}</Markdown>
        {doc.metaItems.length > 0 && (
          <ul className="m-0 mt-5 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-sm text-white/40">
            {doc.metaItems.map((item, i) => (
              <li key={`${item}-${i}`} className="flex gap-4">
                {i > 0 && <span aria-hidden="true">·</span>}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      <div className="space-y-6">
        {doc.sections.map((section, i) => (
          <motion.section
            key={`${section.title}-${i}`}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="border-t border-white/10 pt-10"
          >
            <div className="mb-8 grid grid-cols-[2.5rem_1fr] gap-4">
              <span className="pt-1.5 text-[10px] font-bold tracking-[0.2em] text-primary">{i + 1}</span>
              <h2 className="m-0 font-display text-2xl font-normal leading-tight tracking-[-0.02em] text-white md:text-[1.75rem]">
                {section.title}
              </h2>
            </div>
            <div className="pl-0 sm:pl-[3.5rem]">
              <Markdown components={body}>{section.body}</Markdown>
            </div>
          </motion.section>
        ))}
      </div>

      {doc.footerNote && (
        <div className="mt-12">
          <Markdown components={note}>{doc.footerNote}</Markdown>
        </div>
      )}
    </div>
  );
}
