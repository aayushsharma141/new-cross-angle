import { motion } from "framer-motion";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, Blog } from "@/lib/api";
import { Image } from "@/components/ui/enhanced/image";

/* ─── helpers ─── */
const readTime = (post: Blog) =>
  `${Math.max(3, Math.ceil((post.excerpt?.length || 200) / 200))} min read`;

const cleanTitle = (title: string) =>
  title
    .replace(/&#8211;/g, "—")
    .replace(/&#8212;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s*[—\-–]\s*Cross Angle Interior\s*$/i, "");

/* ─── stagger variants ─── */
const containerVar = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const cardVar = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── single card ─── */
const BlogCard = ({
  post,
  featured = false,
}: {
  post: Blog;
  featured?: boolean;
}) => (
  <motion.article
    variants={cardVar}
    className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0c0b] transition-all duration-500 hover:border-site-gold/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)] ${
      featured ? "md:row-span-2" : ""
    }`}
  >
    {/* Image */}
    <Link
      to={`/blog/${post.slug || post.id}`}
      className={`relative block overflow-hidden flex-shrink-0 ${
        featured ? "h-64 md:h-[55%]" : "h-48"
      }`}
    >
      {post.image ? (
        <Image
          src={post.image}
          alt={cleanTitle(post.title)}
          className="w-full h-full"
          imageClassName="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          width={featured ? 800 : 480}
          height={featured ? 440 : 280}
        />
      ) : (
        <div className="w-full h-full bg-[#161410] flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-white/10" />
        </div>
      )}

      {/* Gradient fade into card body */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0d0c0b] to-transparent" />

      {/* Category badge */}
      {post.category && (
        <span className="absolute top-4 left-4 text-[9px] font-bold uppercase tracking-[0.22em] px-2.5 py-1 rounded-full bg-site-crimson/90 text-white backdrop-blur-sm">
          {post.category}
        </span>
      )}
    </Link>

    {/* Body */}
    <div className="flex flex-col flex-1 p-5 md:p-6">
      {/* Meta */}
      <div className="flex items-center gap-3 text-[10px] text-white/30 mb-3">
        <span>{post.date}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {readTime(post)}
        </span>
      </div>

      {/* Title */}
      <Link to={`/blog/${post.slug || post.id}`}>
        <h3
          className={`font-display font-semibold text-white leading-snug group-hover:text-site-gold transition-colors duration-300 line-clamp-2 mb-3 ${
            featured ? "text-xl md:text-2xl" : "text-base md:text-lg"
          }`}
        >
          {cleanTitle(post.title)}
        </h3>
      </Link>

      {/* Excerpt — only on featured */}
      {featured && post.excerpt && (
        <p className="text-white/45 text-sm leading-relaxed line-clamp-3 mb-4">
          {post.excerpt}
        </p>
      )}

      {/* CTA link */}
      <div className="mt-auto pt-4 border-t border-white/[0.05]">
        <Link
          to={`/blog/${post.slug || post.id}`}
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-site-gold/70 hover:text-site-gold transition-colors duration-300 group/link"
        >
          Read Article
          <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </div>
  </motion.article>
);

/* ─── skeleton ─── */
const BlogSkeleton = ({ featured = false }: { featured?: boolean }) => (
  <div
    className={`rounded-2xl border border-white/[0.05] bg-[#0d0c0b] overflow-hidden animate-pulse ${
      featured ? "md:row-span-2" : ""
    }`}
  >
    <div className={`bg-white/5 ${featured ? "h-64 md:h-72" : "h-48"}`} />
    <div className="p-5 md:p-6 space-y-3">
      <div className="h-2.5 w-24 bg-white/5 rounded" />
      <div className="h-5 w-3/4 bg-white/[0.07] rounded" />
      <div className="h-4 w-full bg-white/5 rounded" />
      <div className="h-3 w-20 bg-white/5 rounded mt-4" />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════ */
const HomeBlog = () => {
  const { data: posts = [], isLoading } = useQuery<Blog[]>({
    queryKey: ["home-blog-top3"],
    queryFn: async () => {
      const all = await api.getBlogs();
      return all.slice(0, 3);
    },
    staleTime: 5 * 60 * 1000,
  });

  /* Don't render section if no posts and not loading */
  if (!isLoading && posts.length === 0) return null;

  const [featured, ...rest] = posts;

  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-[#090807]">
      {/* Ambient glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-site-gold/20 to-transparent" />

      <div className="container mx-auto px-4 md:px-10 lg:px-14 relative z-10">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-site-gold/50" />
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-site-gold">
                Design Intelligence
              </span>
            </div>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.02em] text-white">
              From Our{" "}
              <em className="not-italic text-site-gold">Studio Journal</em>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mt-3 max-w-sm">
              Expert insights on materials, space planning, and the craft of
              building beautiful homes.
            </p>
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/50 hover:text-site-gold transition-colors duration-300 group flex-shrink-0"
          >
            View All Articles
            <span className="w-8 h-8 rounded-full border border-white/10 group-hover:border-site-gold/40 flex items-center justify-center group-hover:bg-site-gold/5 transition-all duration-300">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        {/* ── Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-5">
            <div className="md:col-span-1 md:row-span-2">
              <BlogSkeleton featured />
            </div>
            <BlogSkeleton />
            <BlogSkeleton />
          </div>
        ) : (
          <motion.div
            variants={containerVar}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-5"
          >
            {/* Featured post spans 2 rows */}
            {featured && (
              <div className="md:col-span-1 md:row-span-2">
                <BlogCard post={featured} featured />
              </div>
            )}

            {/* Remaining 2 posts */}
            {rest.map((post) => (
              <div key={post.id} className="md:col-span-1">
                <BlogCard post={post} />
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Mobile "View All" fallback ── */}
        <div className="mt-10 text-center md:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 rounded-full transition-all duration-300"
          >
            View All Articles
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeBlog;
