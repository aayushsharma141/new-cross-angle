import { Helmet } from "react-helmet-async";

export type SchemaType = "LocalBusiness" | "Service" | "BreadcrumbList" | "Article";

interface SchemaMarkupProps {
    type: SchemaType;
    data: Record<string, any>;
}

export const SchemaMarkup = ({ type, data }: SchemaMarkupProps) => {
    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": type,
                    ...data,
                })}
            </script>
        </Helmet>
    );
};
