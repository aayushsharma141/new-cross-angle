import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FixedSocialBar from "@/components/FixedSocialBar";
import FloatingParticles from "@/components/FloatingParticles";
import { Button } from "@/components/ui/button";
import ScrollToTop from "@/components/ScrollToTop";
import { useEffect, useState } from "react";
import { api, Blog } from "@/lib/api";

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await api.getBlogs();
        setBlogPosts(data);
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
      <Helmet>
        <title>Blog | Cross Angle Interior - Design Tips & Inspiration</title>
        <meta
          name="description"
          content="Read the latest interior design tips, trends, and inspiration from Cross Angle Interior. Get expert advice on transforming your spaces."
        />
        <meta property="og:title" content="Interior Design Blog | Cross Angle Interior" />
        <meta property="og:description" content="Read the latest interior design tips, trends, and inspiration." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://crossangleinterior.com/blog" />
      </Helmet>
      <FloatingParticles count={30} />
      <main className="min-h-screen relative z-10">
        <FixedSocialBar />
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-20 relative bg-gradient-to-b from-background to-accent/5">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1920')` }}
          />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Blog
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Leading Interior Designer in Jamshedpur
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {isLoading ? (
                  <div className="text-center py-10 text-muted-foreground">Loading posts...</div>
                ) : blogPosts.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">No blog posts found.</div>
                ) : (
                  blogPosts.map((post) => (
                    <article key={post.id} className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                      <Link to={`/blog/${post.slug || post.id}`} className="block overflow-hidden aspect-[16/9]">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
                            {post.category}
                          </span>
                          <span className="text-muted-foreground text-sm">{post.date}</span>
                        </div>
                        <Link to={`/blog/${post.slug || post.id}`}>
                          <h2 className="font-serif text-xl font-semibold text-foreground mb-3 hover:text-primary transition-colors cursor-pointer">
                            {post.title}
                          </h2>
                        </Link>
                        <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                        <Button variant="outline" asChild>
                          <Link to={`/blog/${post.slug || post.id}`}>Read More</Link>
                        </Button>
                      </div>
                    </article>
                  ))
                )}
              </div>

              {/* Sidebar */}
              <aside className="space-y-8">
                {/* Search */}
                <div className="bg-card p-6 rounded-xl shadow-lg">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded" />
                    Search Here
                  </h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                    <button className="absolute right-0 top-0 bottom-0 px-4 bg-primary text-primary-foreground rounded-r-lg">
                      Search
                    </button>
                  </div>
                </div>

                {/* Recent Posts */}
                <div className="bg-card p-6 rounded-xl shadow-lg">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded" />
                    Recent Posts
                  </h3>
                  <div className="space-y-4">
                    {blogPosts.slice(0, 4).map((post) => (
                      <Link to={`/blog/${post.slug || post.id}`} key={post.id} className="flex gap-4 cursor-pointer group">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt={post.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div>
                          <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">{post.date}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-card p-6 rounded-xl shadow-lg">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded" />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {["Interior Design", "Design Trends", "Sustainability", "Tips & Tricks"].map((cat) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg cursor-pointer transition-colors"
                      >
                        <span className="text-foreground">{cat}</span>
                        <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded">
                          {Math.floor(Math.random() * 10) + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <Footer />
        <ScrollToTop />
      </main>
    </>
  );
};

export default BlogPage;
