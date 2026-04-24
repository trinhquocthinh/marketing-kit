'use client';

export default function LabelHot() {
  return (
    <span className="relative flex h-5 w-5 shrink-0">
      <span
        className="absolute inline-flex h-5 w-5 animate-ping rounded-full opacity-75"
        style={{ background: 'var(--primary)' }}
      />
      <span
        className="relative inline-flex h-5 w-5 items-center justify-center rounded-full text-[7px] font-black tracking-widest text-white uppercase shadow-[var(--shadow-glow-primary)]"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
        }}
      >
        Hot
      </span>
    </span>
  );
}
