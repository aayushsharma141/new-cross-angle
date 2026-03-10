import { Suspense } from "react";
import { SectionRegistry } from "./SectionRegistry";

interface SectionData {
    id: string;
    section_type: string;
    content_json: Record<string, unknown>;
    order_index: number;
}

interface SectionRendererProps {
    section: SectionData;
}

export function SectionRenderer({ section }: SectionRendererProps) {
    const type = section.section_type.toLowerCase();
    const Component = SectionRegistry[type] || null;

    if (!Component) {
        if (process.env.NODE_ENV === "development") {
            console.warn(`No component found for section_type: ${section.section_type}`);
        }
        return null;
    }

    return (
        <Suspense fallback={<div className="py-24 text-center text-white/50">Loading section...</div>}>
            <Component {...section.content_json} />
        </Suspense>
    );
}
