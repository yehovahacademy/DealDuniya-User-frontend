// DealDuniya brand mark: globe + orange deal tag, with the two-tone wordmark.
// Colours come from CSS variables in index.css so the logo flips for dark theme.
export default function Logo({ size = 30, showText = true }) {
  return (
    <span className="brand" style={{ "--logo-h": `${size}px` }}>
      <svg className="brand-mark" viewBox="0 0 64 64" role="img" aria-label="DealDuniya">
        <circle cx="30" cy="34" r="24" className="bm-globe" />
        <ellipse cx="30" cy="34" rx="10" ry="24" fill="none" className="bm-line" strokeWidth="2" />
        <path d="M6 34h48M10 22h40M10 46h40" fill="none" className="bm-line" strokeWidth="2" />
        <rect x="38" y="4" width="22" height="22" rx="6" className="bm-tag" />
        <circle cx="46" cy="12" r="2.6" className="bm-hole" />
      </svg>
      {showText && (
        <span className="brand-name" aria-hidden="true">
          Deal<span>Duniya</span>
        </span>
      )}
    </span>
  );
}
