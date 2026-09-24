import { Link } from "react-router-dom";
import { ImageIcon, Video, Grid3x3, Zap } from "lucide-react";

interface MediaTypeCard {
    title: string;
    description: string;
    icon: React.ReactNode;
    path: string;
    color: string;
    features: string[];
}

const mediaTypes: MediaTypeCard[] = [
    {
        title: "Images & Videos",
        description: "Upload, organize, and manage all media files used across the site. Your central media library.",
        icon: <ImageIcon className="w-6 h-6" />,
        path: "/admin/cms/media-library",
        color: "bg-blue-500/10 border-blue-500/25",
        features: ["Bulk upload", "Organize by category", "Track usage"],
    },
    {
        title: "Project Gallery",
        description: "Showcase completed design projects with photos, categories, and detailed project information.",
        icon: <Grid3x3 className="w-6 h-6" />,
        path: "/admin/cms/gallery",
        color: "bg-emerald-500/10 border-emerald-500/25",
        features: ["Project showcase", "Categorize work", "Reorder by drag"],
    },
    {
        title: "Before & After",
        description: "Display transformation stories with before/after comparisons, client testimonials, and design details.",
        icon: <Zap className="w-6 h-6" />,
        path: "/admin/cms/before-and-after",
        color: "bg-amber-500/10 border-amber-500/25",
        features: ["Side-by-side compare", "Client testimonials", "Design story"],
    },
    {
        title: "Hero Section",
        description: "Manage the homepage hero carousel with images, videos, animations, and call-to-action buttons.",
        icon: <Video className="w-6 h-6" />,
        path: "/admin/cms/hero-carousel",
        color: "bg-purple-500/10 border-purple-500/25",
        features: ["Carousel media", "Animations", "Call-to-action"],
    },
];

export default function AdminVisualMediaHub() {
    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar p-6">

            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-serif font-semibold text-[hsl(var(--admin-text))]">
                    Visual Media Management
                </h1>
                <p className="text-sm text-[hsl(var(--admin-muted))]">
                    Manage all images, videos, and visual content used across your website. Select a media type below to get started.
                </p>
            </div>

            {/* Media Type Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mediaTypes.map((type) => (
                    <Link
                        key={type.path}
                        to={type.path}
                        className="group"
                    >
                        <div className={`${type.color} border-2 p-6 h-full transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer rounded-lg`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-[hsl(var(--admin-surface))] group-hover:bg-[hsl(var(--admin-primary))]/10 transition-colors">
                                        {type.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[hsl(var(--admin-text))] group-hover:text-[hsl(var(--admin-primary))] transition-colors">
                                            {type.title}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-[hsl(var(--admin-muted))] mb-4 leading-relaxed">
                                {type.description}
                            </p>

                            <div className="space-y-2">
                                <p className="text-[10px] uppercase font-bold text-[hsl(var(--admin-muted))] tracking-wider">
                                    Key Features
                                </p>
                                <ul className="space-y-1">
                                    {type.features.map((feature) => (
                                        <li key={feature} className="text-xs text-[hsl(var(--admin-muted))] flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-[hsl(var(--admin-primary))]" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-4 pt-4 border-t border-[hsl(var(--admin-border))] flex items-center gap-2 text-xs font-semibold text-[hsl(var(--admin-primary))]">
                                Open <span className="ml-auto">→</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Help Text */}
            <div className="mt-4 p-4 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-xs text-[hsl(var(--admin-muted))]">
                <p className="font-semibold text-[hsl(var(--admin-text))] mb-2">💡 Tip</p>
                <p>
                    <strong>Images & Videos</strong> is your central library for all media uploads.
                    <strong> Project Gallery, Before & After, and Hero Section</strong> use media from this library.
                    Start by uploading your files there, then browse them in each section.
                </p>
            </div>
        </div>
    );
}
