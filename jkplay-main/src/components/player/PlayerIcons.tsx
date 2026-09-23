import React from 'react';

interface SkipIconProps {
  className?: string;
}

/**
 * 10-Second Rewind Icon (Counter-Clockwise Arc with '10')
 */
export const RotateCcw10Icon: React.FC<SkipIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Counter-Clockwise circular arc arrow */}
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <text
      x="12"
      y="15.5"
      textAnchor="middle"
      fontSize="7.5"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      10
    </text>
  </svg>
);

/**
 * 10-Second Forward Skip Icon (Clockwise Arc with '10')
 */
export const RotateCw10Icon: React.FC<SkipIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Clockwise circular arc arrow */}
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.57 2.57L21 8" />
    <path d="M21 3v5h-5" />
    <text
      x="12"
      y="15.5"
      textAnchor="middle"
      fontSize="7.5"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      10
    </text>
  </svg>
);
