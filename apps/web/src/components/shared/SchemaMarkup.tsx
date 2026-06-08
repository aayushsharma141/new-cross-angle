import { Helmet } from "react-helmet-async";
import { SITE_CONSTANTS } from "@/lib/constants";

export type SchemaType =
    | "LocalBusiness"
    | "InteriorDesigner"
    | "Service"
    | "BreadcrumbList"
    | "Article"
    | "BlogPosting"
    | "Organization"
    | "FAQPage"
    | "Person"
    | "HowTo"
    | "WebSite"
    | "Product"
    | "Review"
    | "AggregateRating"
    | "VideoObject";

interface SchemaMarkupProps {
    type: SchemaType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
    locale?: string; // e.g. "en-IN", "hi-IN"
}

/**
 * Robust JSON-LD Schema Generator and Validator
 * Supports dynamic localization, automatic default fallback mapping,
 * and simplified semantic data inputs for complex schemas.
 */
export const SchemaMarkup = ({ type, data, locale = "en-IN" }: SchemaMarkupProps) => {
    // 1. Establish core localization options based on locale string
    const isIndia = locale.endsWith("-IN");
    const currency = isIndia ? "INR" : "USD";
    const languageCode = locale.split("-")[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let formattedData: Record<string, any> = {
        "@context": "https://schema.org",
        "@type": type,
    };

    // 2. Process schema types with custom rules, validation, and auto-fallback structures
    switch (type) {
        case "Organization":
            formattedData = {
                ...formattedData,
                name: SITE_CONSTANTS.companyName,
                url: "https://crossangleinterior.com",
                logo: "https://crossangleinterior.com/logo-icon.png",
                image: "https://crossangleinterior.com/reality_render.jpg",
                foundingDate: "2015",
                founders: [
                    {
                        "@type": "Person",
                        name: "Aayush Sharma",
                        jobTitle: "Founder & Lead Architect",
                    }
                ],
                contactPoint: [
                    {
                        "@type": "ContactPoint",
                        telephone: SITE_CONSTANTS.defaultPhone,
                        contactType: "Customer Service",
                        areaServed: "IN",
                        availableLanguage: ["English", "Hindi"],
                    }
                ],
                sameAs: [
                    SITE_CONSTANTS.socials.facebook,
                    SITE_CONSTANTS.socials.instagram,
                ],
                ...data,
            };
            break;

        case "LocalBusiness":
        case "InteriorDesigner":
            // Inject defaults from SITE_CONSTANTS for premium local SEO footprint
            formattedData = {
                ...formattedData,
                "@type": type,
                name: SITE_CONSTANTS.companyName,
                image: "https://crossangleinterior.com/reality_render.jpg",
                "@id": "https://crossangleinterior.com/#localbusiness",
                url: "https://crossangleinterior.com",
                telephone: SITE_CONSTANTS.defaultPhone,
                priceRange: "$$",
                address: {
                    "@type": "PostalAddress",
                    streetAddress: "2-G, 2nd floor, Aditya Signature building, Dimna Rd, Mango",
                    addressLocality: "Jamshedpur",
                    addressRegion: "Jharkhand",
                    postalCode: "831012",
                    addressCountry: "IN",
                },
                geo: {
                    "@type": "GeoCoordinates",
                    latitude: SITE_CONSTANTS.defaultLat,
                    longitude: SITE_CONSTANTS.defaultLng,
                },
                openingHoursSpecification: {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    opens: "09:00",
                    closes: "20:00",
                },
                sameAs: [
                    SITE_CONSTANTS.socials.facebook,
                    SITE_CONSTANTS.socials.instagram,
                ],
                ...data,
            };
            break;

        case "BreadcrumbList":
            // Automatically build clean BreadcrumbList structures from a simple array format if provided
            if (Array.isArray(data.items)) {
                formattedData.itemListElement = data.items.map((item: { name: string; url: string }, index: number) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    name: item.name,
                    item: item.url.startsWith("http") ? item.url : `https://crossangleinterior.com${item.url}`,
                }));
            } else {
                formattedData.itemListElement = data.itemListElement || [];
            }
            break;

        case "FAQPage":
            // Automatically compile a compliant FAQ page from simple question/answer pairs
            if (Array.isArray(data.faqs)) {
                formattedData.mainEntity = data.faqs.map((faq: { question: string; answer: string }) => ({
                    "@type": "Question",
                    name: faq.question,
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: faq.answer,
                    },
                }));
            } else {
                formattedData.mainEntity = data.mainEntity || [];
            }
            break;

        case "Service":
            formattedData = {
                ...formattedData,
                provider: {
                    "@type": "InteriorDesigner",
                    name: SITE_CONSTANTS.companyName,
                    image: "https://crossangleinterior.com/logo-icon.png",
                },
                areaServed: [
                    {
                        "@type": "City",
                        name: "Jamshedpur",
                    },
                    {
                        "@type": "State",
                        name: "Jharkhand",
                    }
                ],
                offers: {
                    "@type": "Offer",
                    priceCurrency: currency,
                    price: "Call for Quote",
                    availability: "https://schema.org/InStock",
                },
                ...data,
            };
            break;

        case "Article":
        case "BlogPosting":
            formattedData = {
                ...formattedData,
                publisher: {
                    "@type": "Organization",
                    name: SITE_CONSTANTS.companyName,
                    logo: {
                        "@type": "ImageObject",
                        url: "https://crossangleinterior.com/logo-icon.png",
                    },
                },
                inLanguage: languageCode,
                ...data,
            };
            break;

        case "WebSite":
            formattedData = {
                ...formattedData,
                name: SITE_CONSTANTS.companyName,
                url: "https://crossangleinterior.com",
                potentialAction: {
                    "@type": "SearchAction",
                    target: {
                        "@type": "EntryPoint",
                        urlTemplate: "https://crossangleinterior.com/blog?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                },
                ...data,
            };
            break;

        default:
            formattedData = {
                ...formattedData,
                ...data,
            };
            break;
    }

    const safeJsonLd = JSON.stringify(formattedData).replace(/</g, '\\u003c');

    return (
        <Helmet>
            <script type="application/ld+json">
                {safeJsonLd}
            </script>
        </Helmet>
    );
};
