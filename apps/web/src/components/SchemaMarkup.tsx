import { Helmet } from "react-helmet-async";

type SchemaType = "LocalBusiness" | "Service" | "BreadcrumbList" | "Article";

interface SchemaMarkupProps {
    type: SchemaType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
