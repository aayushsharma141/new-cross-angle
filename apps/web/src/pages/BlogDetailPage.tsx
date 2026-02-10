import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import React from 'react';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover_image: string;
    created_at: string;
    read_time_minutes: number;
    views_count: number;
}

const BlogDetailPage = () => {
    const { slug } = useParams();
    const { toast } = useToast();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasTrackedView, setHasTrackedView] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return;

            try {
                const { data, error } = await supabase
                    .from("blogs")
                    .select("*")
                    .eq("slug", slug)
                    .single();

                if (error) throw error;
                setPost(data);

                // Track view once per session/load
                if (data && !hasTrackedView) {
                    await supabase.rpc("track_blog_view", { blog_id: data.id });
                    setHasTrackedView(true);
                }
            } catch (error) {
                console.error("Error fetching blog post:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [slug]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post?.title,
                    text: post?.excerpt,
                    url: window.location.href,
                });
            } catch (error) {
                console.log("Error sharing:", error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link copied",
                description: "Blog post link copied to clipboard",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
                    <Skeleton className="h-8 w-32 mb-8" />
                    <Skeleton className="h-12 w-3/4 mb-4" />
                    <Skeleton className="h-6 w-1/2 mb-8" />
                    <Skeleton className="aspect-video w-full rounded-xl mb-12" />
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-3xl font-display font-bold mb-4">Post not found</h1>
                    <p className="text-muted-foreground mb-8">The blog post you are looking for does not exist.</p>
                    <Button asChild>
                        <Link to="/blog">Back to Blog</Link>
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{post.title} | Cross Angle Interior</title>
                <meta name="description" content={post.excerpt} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt} />
                <meta property="og:image" content={post.cover_image} />
                <meta property="og:type" content="article" />
                <link rel="canonical" href={`https://crossangleinterior.com/blog/${post.slug}`} />
            </Helmet>

            <main className="min-h-screen bg-background">
                <Navbar />
                <ScrollToTop />

                <article className="pt-32 pb-20">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Link
                            to="/blog"
                            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Blog
                        </Link>

                        <header className="mb-12 text-center">
                            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(post.created_at), "MMMM d, yyyy")}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {post.read_time_minutes || 5} min read
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                {post.excerpt}
                            </p>
                        </header>

                        {post.cover_image && (
                            <div className="rounded-2xl overflow-hidden shadow-2xl mb-16 aspect-video">
                                <img
                                    src={post.cover_image}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="prose prose-lg dark:prose-invert max-w-none mx-auto mb-16">
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        </div>

                        <div className="border-t pt-8 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                <p>Enjoyed this article?</p>
                                <p>Share it with your friends!</p>
                            </div>
                            <Button onClick={handleShare} variant="outline" className="gap-2">
                                <Share2 className="w-4 h-4" />
                                Share Article
                            </Button>
                        </div>
                    </div>
                </article>

                <Footer />
            </main>
        </>
    );
};

export default BlogDetailPage;
