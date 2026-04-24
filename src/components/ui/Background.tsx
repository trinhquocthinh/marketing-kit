/**
 * Spatial animated background: 3 brand-tinted blobs + grain noise overlay.
 * Pure presentational; reads colours from CSS variables so 3 brands work.
 */
export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[var(--background)]">
      {/* Orb 1 — primary, top-left */}
      <div
        className="absolute -top-[10%] -left-[10%] h-[60vw] max-h-[800px] w-[60vw] max-w-[800px] rounded-full opacity-60"
        style={{
          background: 'color-mix(in srgb, var(--primary) 18%, transparent)',
          filter: 'blur(120px)',
          mixBlendMode: 'screen',
          animation: 'bento-blob 15s var(--ease-spatial) infinite alternate',
        }}
      />
      {/* Orb 2 — accent, bottom-right */}
      <div
        className="absolute -right-[10%] -bottom-[10%] h-[50vw] max-h-[700px] w-[50vw] max-w-[700px] rounded-full opacity-55"
        style={{
          background: 'color-mix(in srgb, var(--accent) 20%, transparent)',
          filter: 'blur(130px)',
          mixBlendMode: 'screen',
          animation: 'bento-blob 20s var(--ease-spatial) infinite alternate-reverse',
          animationDelay: '2s',
        }}
      />
      {/* Orb 3 — soft tertiary */}
      <div
        className="absolute top-[30%] left-[30%] h-[40vw] max-h-[600px] w-[40vw] max-w-[600px] rounded-full opacity-40"
        style={{
          background: 'color-mix(in srgb, var(--accent-soft) 18%, transparent)',
          filter: 'blur(100px)',
          mixBlendMode: 'screen',
          animation: 'bento-blob 25s var(--ease-spatial) infinite alternate',
          animationDelay: '4s',
        }}
      />
      {/* Grain texture (inline data-URI SVG, offline-safe) */}
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          opacity: 'var(--grain-opacity)',
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}
