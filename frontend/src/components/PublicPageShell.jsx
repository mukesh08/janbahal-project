import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

/*
 * Standard public-page frame: SiteHeader + content + (optional) SiteFooter,
 * laid out as a full-height flex column. `className`/`style` are applied to the
 * root so callers can opt into the global `.public-site` hover styling or supply
 * their own page background. `editHref`/`editLabel` are forwarded to the header's
 * admin edit button.
 */
const PublicPageShell = ({ className, style, editHref, editLabel, showFooter = true, children }) => (
  <div className={className} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', ...style }}>
    <SiteHeader editHref={editHref} editLabel={editLabel} />
    {children}
    {showFooter && <SiteFooter />}
  </div>
);

export default PublicPageShell;
