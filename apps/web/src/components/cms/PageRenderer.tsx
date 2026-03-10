import { SectionRenderer } from "./SectionRenderer";

interface SectionData {
    id: string;
    section_type: string;
    content_json: Record<string, unknown>;
    order_index: number;
}

interface PageRendererProps {
    sections: SectionData[];
}

export function PageRenderer({ sections }: PageRendererProps) {
    if (!sections || sections.length === 0) {
        return (
            <div className="py-24 text-center text-white/50">
                No content blocks found for this page.
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full">
            {sections.map((section) => (
                <SectionRenderer key={section.id} section={section} />
            ))}
        </div>
    );
}
