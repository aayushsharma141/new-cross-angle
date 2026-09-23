import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { OptimizedImage as Image } from "@/components/ui/enhanced/OptimizedImage";
import { Blog } from "@/lib/api";
import { cleanTitle, cleanExcerpt, readTime } from "../_utils/blogUtils";
import { Section, Eyebrow, DisplayHeading, Body, reveal } from "@/components/editorial";

interface BlogHeroProps {
  featuredPost?: Blog;
  isLoading: boolean;
}

/** The latest article, given the full width of a lead story. */
export function BlogHero({ featuredPost, isLoading }: BlogHeroProps) {
  if (isLoading) {
    return (
      <Section spacing="tight">
        <div className="aspect-[21/9] w-full animate-pulse bg-white/[0.03]" aria-busy="true" />
      </Section>
    );
  }

  if (!featuredPost) return null;

  return (
    <Section spacing="tight">
      <motion.article {...reveal()}>
        <Link to={`/blog/${featuredPost.slug}`} className="group block focus-visible:outline-none">
          <div className="mb-8 aspect-[16/9] w-full overflow-hidden bg-white/[0.03] md:aspect-[21/9]">
            <Image
              src={featuredPost.image}
              alt={cleanTitle(featuredPost.title)}
              className="h-full w-full"
              imageClassName="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              width={1600}
              height={686}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <div>
              <Eyebrow className="mb-5">Latest</Eyebrow>
              <DisplayHeading as="h2" className="transition-colors duration-300 group-hover:text-primary group-focus-visible:text-primary">
                {cleanTitle(featuredPost.title)}
              </DisplayHeading>
            </div>
            <div className="lg:pt-16">
              {cleanExcerpt(featuredPost.excerpt, featuredPost.category) && (
                <Body className="mb-6 max-w-md">{cleanExcerpt(featuredPost.excerpt, featuredPost.category)}</Body>
              )}
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                <span>{featuredPost.category || "Interior Design"}</span>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/20" />
                <span>{readTime(featuredPost)} read</span>
              </p>
              <span className="mt-6 inline-flex items-center gap-2 border-b border-white/15 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 transition-colors duration-300 group-hover:border-primary group-hover:text-primary">
                Read article{" "}
                <span aria-hidden="true" className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">→</span>
              </span>
            </div>
          </div>
        </Link>
      </motion.article>
    </Section>
  );
}
