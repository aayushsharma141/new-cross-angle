import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageRenderer } from "@/components/cms/PageRenderer";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const PreviewPage = () => {
    const { slug } = useParams<{ slug: string }>();

    const { data: pageData, isLoading } = useQuery({
        queryKey: ["page", "preview", slug],
        queryFn: () => slug ? api.getPreviewPageBySlug(slug) : null,
        enabled: !!slug,
    });

    if (!slug) {
        return <Navigate to="/admin/cms/pages" replace />;
    }

    const sections = pageData?.sections || [];

    return (
        <>
            <Helmet>
                <title>Preview: {slug} | CMS</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>

            {/* Preview Mode Header */}
            <div className="fixed top-0 left-0 w-full bg-amber-500/90 text-amber-950 px-4 py-2 z-[100] font-medium text-center text-sm backdrop-blur-md border-b border-amber-600/20 flex justify-between items-center">
                <span>Preview Mode: Viewing draft and published content for <strong>{slug}</strong> page.</span>
                <a href="/admin/cms/pages" className="bg-amber-950 text-amber-50 px-3 py-1 rounded-md text-xs hover:bg-amber-900 transition-colors">
                    Exit Preview
                </a>
            </div>

            {/* spacer for fixed header */}
            <div className="h-10 w-full bg-background" />

            <Navbar />
            <main className="min-h-screen relative z-10 w-full pt-10">
                {isLoading ? (
                    <div className="min-h-[50vh] flex items-center justify-center bg-background">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : sections.length > 0 ? (
                    <PageRenderer sections={sections} />
                ) : (
                    <div className="min-h-[50vh] flex items-center justify-center flex-col gap-4 text-muted-foreground">
                        <p>No content found for this page in the CMS.</p>
                        <a href="/admin/cms/pages" className="text-primary hover:underline">Return to Builder</a>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default PreviewPage;
