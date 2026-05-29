import DOMPurify from "dompurify";

interface SafeHTMLProps {
  html: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr",
    "ul", "ol", "li", "a", "strong", "em", "b", "i", "u",
    "blockquote", "code", "pre", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td", "span", "div",
    "sub", "sup", "mark",
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel", "src", "alt", "width", "height",
    "class", "id", "title", "loading",
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ["target"],
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
};

/**
 * Renders sanitized HTML content. All raw HTML MUST pass through this component.
 * Prevents stored XSS by enforcing DOMPurify on every render.
 */
export function SafeHTML({ html, className, as: Tag = "div" }: SafeHTMLProps) {
  const clean = DOMPurify.sanitize(html, PURIFY_CONFIG);
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
