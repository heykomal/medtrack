import { useId } from 'react';

/**
 * MedTrack Logo
 * Props:
 *   height    — rendered height in px (width scales from aspect ratio)
 *   iconOnly  — show only the icon, no wordmark
 *   light     — white wordmark for dark backgrounds
 *   className — extra class names
 */
export default function Logo({ height = 40, iconOnly = false, light = false, className = '' }) {
  // Unique per-instance IDs so multiple Logo components on one page don't clash
  const uid  = useId().replace(/:/g, '');
  const g1   = `lg1-${uid}`;
  const g2   = `lg2-${uid}`;

  // ViewBox: icon area is 56 wide × 40 tall; full logo adds 148 for wordmark → 204×40
  const vbW  = iconOnly ? 56 : 204;
  const svgW = Math.round(height * (vbW / 40));

  const textFill = light ? '#ffffff' : '#0f2744';

  return (
    <svg
      viewBox={`0 0 ${vbW} 40`}
      height={height}
      width={svgW}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MedTrack"
      overflow="visible"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        {/* Diagonal gradient — dark teal → bright green */}
        <linearGradient id={g1} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#0d5e6e" />
          <stop offset="35%"  stopColor="#0f9e8a" />
          <stop offset="70%"  stopColor="#2bbf9a" />
          <stop offset="100%" stopColor="#57cc99" />
        </linearGradient>
        {/* Horizontal gradient for arrow */}
        <linearGradient id={g2} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0f9e8a" />
          <stop offset="100%" stopColor="#57cc99" />
        </linearGradient>
      </defs>

      {/* ── Icon (fits 0 0 56 40) ── */}

      {/* Outer pill / capsule — horizontal, full width */}
      <rect x="2" y="8" width="50" height="24" rx="12"
        stroke={`url(#${g1})`} strokeWidth="3" />

      {/* Centre divider */}
      <line x1="27" y1="8" x2="27" y2="32"
        stroke={`url(#${g1})`} strokeWidth="1.6" opacity="0.45" />

      {/* EKG / heartbeat inside left half */}
      <path
        d="M 6,20 L 11,20 L 13,11 L 16,29 L 19,20 L 24,20"
        stroke={`url(#${g1})`} strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round"
      />

      {/* Forward arrow inside right half */}
      <path
        d="M 32,16 L 41,20 L 32,24"
        stroke={`url(#${g2})`} strokeWidth="2.6"
        strokeLinecap="round" strokeLinejoin="round"
      />

      {/* ── Wordmark (starts at x=64) ── */}
      {!iconOnly && (
        <text
          x="64" y="28"
          fontFamily="'Inter', system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="23"
          letterSpacing="-0.6"
          fill={textFill}
        >
          {'Med'}
          <tspan fontWeight="700" opacity="0.75">{'Track'}</tspan>
        </text>
      )}
    </svg>
  );
}
