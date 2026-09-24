import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { Image } from "@/components/ui/enhanced/image";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";

import { useBlogPost } from "./blog/_hooks/useBlogPost";
import ReadingProgressBar from "./blog/_components/ReadingProgressBar";
import StickyArticleBar from "./blog/_components/StickyArticleBar";
import TableOfContents from "./blog/_components/TableOfContents";
import InArticleLeadCTA from "./blog/_components/InArticleLeadCTA";
import { cleanTitle } from "./blog/_utils/blogUtils";
import {
  Section, Container, Eyebrow, DisplayHeading,
  reveal, textLinkClass, EASE_OUT_EXPO,
} from "@/components/editorial";

const shareButton =
  "text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 transition-colors duration-300 hover:text-primary focus-visible:outline-none focus-visible:text-primary";

/**
 * Article view. Data and TOC logic stay in `useBlogPost`; this file is the
 * editorial shell — a measured column of prose with the contents rail beside it.
 */
const BlogDetailPage = () => {
  const {
    post, isLoading, relatedPosts, prevPost, nextPost,
    tocItems, activeHeadingId, contentRef,
    handleShare,
  } = useBlogPost();

  const readMinutes = post?.read_time_minutes || Math.max(3, Math.ceil((post?.content?.length || 1000) / 1200));
  const authorName = post?.author || "CrossAngle Editorial";

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[var(--s-canvas-primary)]" aria-busy="true">
          <Container className="pt-36 md:pt-48">
            <div className="mx-auto max-w-3xl">
              <div className="mb-8 h-3 w-32 animate-pulse bg-white/[0.06]" />
              <div className="mb-4 h-14 w-full animate-pulse bg-white/[0.06]" />
              <div className="mb-10 h-14 w-3/4 animate-pulse bg-white/[0.06]" />
              <div className="aspect-[21/9] w-full animate-pulse bg-white/[0.04]" />
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-[var(--s-canvas-primary)] px-6 text-white">
          <div className="text-center">
            <DisplayHeading as="h1" size="md" className="mb-8">Article not found.</DisplayHeading>
            <Link to="/blog" className={textLinkClass}>
              <span aria-hidden="true">←</span> Back to articles
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const coverImage = post.cover_image_url || post.cover_image || post.deprecated_cover_image_url || "";

  return (
    <>
      <Helmet>
        <title>{cleanTitle(post.title)} | Cross Angle Interior</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={cleanTitle(post.title)} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={coverImage} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://crossangleinterior.com/blog/${post.slug}`} />
      </Helmet>

      <SchemaMarkup
        type="Article"
        data={{
          headline: cleanTitle(post.title),
          description: post.excerpt,
          image: coverImage || undefined,
          datePublished: post.published_at || undefined,
          author: { "@type": "Person", name: authorName },
          mainEntityOfPage: `https://crossangleinterior.com/blog/${post.slug}`,
        }}
      />

      <SchemaMarkup
        type="BreadcrumbList"
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: cleanTitle(post.title), url: `/blog/${post.slug}` },
          ],
        }}
      />

      <ReadingProgressBar totalMinutes={readMinutes} />
      <StickyArticleBar post={post} cleanTitle={cleanTitle} />

      <Navbar />
      <ScrollToTop />

      <main id="main-content" className="relative z-10 min-h-screen bg-[var(--s-canvas-primary)] text-white">
        <article>
          {/* Masthead */}
          <Container className="pt-36 pb-12 md:pt-48 md:pb-16">
            <motion.header
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
              className="max-w-4xl"
            >
              {post.category && <Eyebrow className="mb-8">{post.category}</Eyebrow>}
              <DisplayHeading as="h1" size="lg" className="mb-8">
                {cleanTitle(post.title)}
              </DisplayHeading>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                <span className="text-white/70">{authorName}</span>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/20" />
                {post.published_at && (
                  <>
                    <span>{format(new Date(post.published_at), "d MMMM yyyy")}</span>
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/20" />
                  </>
                )}
                <span>{readMinutes} min read</span>
                {post.view_count > 0 && (
                  <>
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/20" />
                    <span>{post.view_count} views</span>
                  </>
                )}
              </p>
            </motion.header>
          </Container>

          {/* Cover */}
          {coverImage && (
            <Container className="mb-16 md:mb-24">
              <motion.div {...reveal()} className="aspect-[4/3] w-full overflow-hidden bg-white/[0.03] md:aspect-[21/9]">
                <Image
                  src={coverImage}
                  alt={cleanTitle(post.title)}
                  className="h-full w-full"
                  imageClassName="h-full w-full object-cover"
                  width={1800}
                  height={771}
                />
              </motion.div>
            </Container>
          )}

          {/* Body + contents rail */}
          <Container className="pb-20">
            <div className="grid grid-cols-1 gap-16 xl:grid-cols-[minmax(0,8fr)_minmax(0,3fr)] xl:gap-24">
              <div className="min-w-0">
                <div
                  ref={contentRef}
                  className="blog-prose max-w-[68ch]"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      typeof post.content === "string" ? post.content : (post.content ? JSON.stringify(post.content) : "")
                    ),
                  }}
                />

                <div className="mt-16 border-t border-white/10 pt-10">
                  <InArticleLeadCTA postId={post.id} />
                </div>
              </div>

              {/* Contents + share */}
              <aside className="hidden xl:block">
                <div className="sticky top-32">
                  {tocItems.length > 0 && (
                    <div className="mb-12">
                      <TableOfContents items={tocItems} activeId={activeHeadingId} />
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-6">
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Share</p>
                    <div className="flex flex-col items-start gap-3">
                      <button type="button" onClick={() => handleShare("linkedin")} className={shareButton}>LinkedIn</button>
                      <button type="button" onClick={() => handleShare("whatsapp")} className={shareButton}>WhatsApp</button>
                      <button type="button" onClick={() => handleShare("copy")} className={shareButton}>Copy link</button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </Container>

          {/* Prev / next */}
          {(prevPost || nextPost) && (
            <Section rule spacing="tight">
              <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
                {prevPost ? (
                  <Link to={`/blog/${prevPost.slug}`} className="group max-w-sm focus-visible:outline-none">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Previous</span>
                    <span className="font-display text-xl leading-snug text-white transition-colors duration-300 group-hover:text-primary md:text-2xl">
                      {cleanTitle(prevPost.title)}
                    </span>
                  </Link>
                ) : <span />}
                {nextPost && (
                  <Link to={`/blog/${nextPost.slug}`} className="group max-w-sm focus-visible:outline-none md:text-right">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Next</span>
                    <span className="font-display text-xl leading-snug text-white transition-colors duration-300 group-hover:text-primary md:text-2xl">
                      {cleanTitle(nextPost.title)}
                    </span>
                  </Link>
                )}
              </div>
            </Section>
          )}

          {/* Related */}
          {relatedPosts.length > 0 && (
            <Section rule>
              <motion.div {...reveal()} className="mb-12 flex items-baseline justify-between gap-6">
                <DisplayHeading as="h2" size="sm">Keep reading</DisplayHeading>
                <Link to="/blog" className={textLinkClass}>All articles <span aria-hidden="true">→</span></Link>
              </motion.div>
              <ul className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((related, i) => {
                  const image = related.cover_image_url || related.cover_image || related.deprecated_cover_image_url || "";
                  return (
                    <motion.li key={related.id} {...reveal(i * 0.05)}>
                      <Link to={`/blog/${related.slug}`} className="group block focus-visible:outline-none">
                        {image && (
                          <div className="mb-6 aspect-[4/3] w-full overflow-hidden bg-white/[0.03]">
                            <Image
                              src={image}
                              alt={cleanTitle(related.title)}
                              className="h-full w-full"
                              imageClassName="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                              width={900}
                              height={675}
                            />
                          </div>
                        )}
                        {related.category && (
                          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">{related.category}</p>
                        )}
                        <h3 className="font-display text-xl leading-snug text-white transition-colors duration-300 group-hover:text-primary md:text-2xl">
                          {cleanTitle(related.title)}
                        </h3>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </Section>
          )}
        </article>
      </main>

      <Footer />

      {/* Prose styling for CMS-authored HTML. */}
      <style>{`
        .blog-prose {
          font-family: var(--font-sans), system-ui, sans-serif;
          font-size: 1.0625rem;
          font-weight: 300;
          line-height: 1.85;
          color: rgba(255,255,255,0.72);
        }
        .blog-prose h1, .blog-prose h2, .blog-prose h3,
        .blog-prose h4, .blog-prose h5, .blog-prose h6 {
          font-family: var(--font-display), serif;
          font-weight: 400;
          letter-spacing: -0.02em;
          color: #fff;
          margin: 2.4em 0 0.8em;
          scroll-margin-top: 8rem;
        }
        .blog-prose h2 { font-size: clamp(1.6rem, 2.4vw, 2.1rem); }
        .blog-prose h3 { font-size: clamp(1.3rem, 1.8vw, 1.6rem); }
        .blog-prose p { margin-bottom: 1.6em; }
        .blog-prose ul, .blog-prose ol { margin: 0 0 1.6em 1.1em; }
        .blog-prose li { margin-bottom: 0.6em; }
        .blog-prose img { width: 100%; height: auto; margin: 2.4em 0; }
        .blog-prose blockquote {
          border-left: 1px solid hsl(var(--primary));
          padding-left: 1.75rem;
          margin: 2.4em 0;
          font-family: var(--font-display), serif;
          font-size: 1.4rem;
          font-style: italic;
          line-height: 1.5;
          color: rgba(255,255,255,0.9);
        }
        /* Imported WordPress posts carry their own meta chrome — hide it. */
        .blog-prose .entry-meta, .blog-prose .posted-on, .blog-prose .byline,
        .blog-prose .-admin-primary, .blog-prose header { display: none !important; }
        .blog-prose a {
          color: #fff;
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-color: rgba(255,255,255,0.25);
          transition: text-decoration-color 0.3s;
        }
        .blog-prose a:hover { text-decoration-color: hsl(var(--primary)); }
      `}</style>
    </>
  );
};

export default BlogDetailPage;
