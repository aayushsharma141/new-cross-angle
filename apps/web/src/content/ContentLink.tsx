import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

interface ContentLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** A site path ("/estimate") or a full address ("https://…") typed by an editor. */
  href: string;
  children: ReactNode;
}

/**
 * Link for editor-supplied addresses. Site paths use the router (no page reload);
 * everything else is a plain anchor. Only http(s), mailto and tel are allowed, so a
 * pasted `javascript:` address can never become a clickable link.
 */
export function ContentLink({ href, children, ...rest }: ContentLinkProps) {
  const value = href.trim();
  if (value.startsWith("/") && !value.startsWith("//")) {
    return <Link to={value} {...rest}>{children}</Link>;
  }
  if (/^(https?:|mailto:|tel:)/i.test(value)) {
    const external = /^https?:/i.test(value);
    return (
      <a href={value} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {children}
      </a>
    );
  }
  // Unrecognised or empty: render the label without a link instead of a dead or unsafe one.
  return <span {...(rest as Record<string, unknown>)}>{children}</span>;
}
