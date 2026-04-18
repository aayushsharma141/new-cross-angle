/**
 * SkipNav — Accessibility skip link (WCAG 2.1 SC 2.4.1)
 *
 * Place this as the FIRST focusable element in <App /> or the layout root:
 *
 *   <SkipNav />
 *   <Nav />
 *   <main id="main-content">...</main>
 *
 * The link is invisible until the user presses Tab; it then slides into the
 * top-left corner (styled via .skip-nav in index.css) and lets them jump
 * straight to #main-content.
 */
export function SkipNav({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <a href={`#${targetId}`} className="skip-nav">
      Skip to main content
    </a>
  );
}
