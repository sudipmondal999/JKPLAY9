import React from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../stores/themeStore.js';

export const BackgroundArt: React.FC = () => {
  const {
    customWallpaper,
    wallpaperOpacity,
    motionEnabled,
  } = useThemeStore();

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* Pitch black studio foundation */}
        <div className="absolute inset-0 bg-[#040407]" />

        {/* Ambient atmospheric drifting clouds & studio light flares (Framer Motion) */}
        {/* Cloud 1: Deep Violet/Indigo High-Altitude Mist */}
        <motion.div
          className="absolute -top-36 left-1/4 w-[900px] h-[600px] bg-purple-900/20 rounded-full blur-[160px] pointer-events-none transform-gpu"
          animate={
            motionEnabled
              ? {
                  x: [-40, 50, -20, -40],
                  y: [-25, 20, -10, -25],
                  scale: [1, 1.12, 0.96, 1],
                  opacity: [0.18, 0.28, 0.22, 0.18],
                }
              : { x: 0, y: 0, scale: 1, opacity: 0.2 }
          }
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Cloud 2: Cool Horizon Studio Rim Light */}
        <motion.div
          className="absolute top-1/3 -right-36 w-[700px] h-[700px] bg-indigo-950/25 rounded-full blur-[170px] pointer-events-none transform-gpu"
          animate={
            motionEnabled
              ? {
                  x: [30, -40, 20, 30],
                  y: [20, -25, 15, 20],
                  scale: [0.94, 1.08, 1, 0.94],
                  opacity: [0.15, 0.25, 0.18, 0.15],
                }
              : { x: 0, y: 0, scale: 1, opacity: 0.2 }
          }
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Cloud 3: Ground Low-Rolling Trail Mist near Knobby Tires */}
        <motion.div
          className="absolute -bottom-32 left-5 w-[850px] h-[550px] bg-violet-950/25 rounded-full blur-[160px] pointer-events-none transform-gpu"
          animate={
            motionEnabled
              ? {
                  x: [-30, 45, -25, -30],
                  y: [15, -20, 10, 15],
                  scale: [1, 1.1, 0.95, 1],
                  opacity: [0.14, 0.24, 0.18, 0.14],
                }
              : { x: 0, y: 0, scale: 1, opacity: 0.2 }
          }
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Cloud 4: Golden Headlight Volumetric Shimmer Dust */}
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[450px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none transform-gpu"
          animate={
            motionEnabled
              ? {
                  scale: [0.92, 1.15, 0.98, 1.1, 0.92],
                  opacity: [0.06, 0.16, 0.09, 0.18, 0.06],
                }
              : { scale: 1, opacity: 0.08 }
          }
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Dynamic Wallpaper Layer with subtle micro-scale and breathing drift */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-500 transform-gpu"
          style={{ opacity: wallpaperOpacity }}
          animate={
            motionEnabled
              ? {
                  scale: [1, 1.015, 1],
                  y: [0, -3, 0],
                }
              : { scale: 1, y: 0 }
          }
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {customWallpaper ? (
            /* User's exact uploaded image file with subtle drift & soft light sheen */
            <div className="relative w-full h-full">
              <img
                src={customWallpaper}
                alt="Royal Enfield Himalayan 411 Background"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              {/* Soft drifting studio light-flicker sheen over user photo */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/[0.04] to-transparent pointer-events-none"
                animate={
                  motionEnabled
                    ? {
                        opacity: [0.2, 0.5, 0.3, 0.6, 0.25, 0.45, 0.2],
                        x: ['-10%', '10%', '-5%', '-10%'],
                      }
                    : { opacity: 0.2, x: '0%' }
                }
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          ) : (
            /* High-Fidelity 1:1 Studio Poster Recreation of the Himalayan 411 with Headlight Flicker */
            <svg
              viewBox="0 0 1920 1080"
              className="w-full h-full object-cover"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Metallic Studio Gradients */}
                <linearGradient id="reTextGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A4A58" />
                  <stop offset="45%" stopColor="#2E2E3A" />
                  <stop offset="70%" stopColor="#1E1E26" />
                  <stop offset="100%" stopColor="#14141B" />
                </linearGradient>

                <linearGradient id="metalChrome" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                  <stop offset="40%" stopColor="#9CA3AF" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#374151" stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="headlightBeam" x1="0" y1="0" x2="1" y2="0.3">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
                  <stop offset="30%" stopColor="#FDE047" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
                </linearGradient>

                <linearGradient id="floorReflection" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2A2A38" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#040407" stopOpacity="0.0" />
                </linearGradient>

                <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#FBBF24" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Studio floor specular shine with subtle breathing shimmer */}
              <motion.ellipse
                cx="960"
                cy="880"
                rx="900"
                ry="140"
                fill="url(#floorReflection)"
                animate={
                  motionEnabled
                    ? {
                        opacity: [0.42, 0.58, 0.46, 0.62, 0.42],
                      }
                    : { opacity: 0.5 }
                }
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* GIANT BACKDROP WORDMARK: ROYAL ENFIELD */}
              <text
                x="960"
                y="520"
                textAnchor="middle"
                fontFamily="'Syne', 'Impact', sans-serif"
                fontWeight="900"
                fontSize="270"
                letterSpacing="-6"
                fill="url(#reTextGrad)"
                stroke="#2B2B38"
                strokeWidth="2.5"
              >
                ROYAL ENFIELD
              </text>

              {/* Motorcycle Group */}
              <g transform="translate(620, 240) scale(1.22)">
                {/* Floor Shadows beneath wheels */}
                <ellipse cx="370" cy="485" rx="110" ry="14" fill="#000000" opacity="0.9" />
                <ellipse cx="-20" cy="485" rx="100" ry="14" fill="#000000" opacity="0.9" />
                <ellipse cx="170" cy="490" rx="200" ry="12" fill="#000000" opacity="0.8" />

                {/* Headlight Atmospheric Flare with Halogen Micro-Flicker */}
                <motion.ellipse
                  cx="300"
                  cy="140"
                  rx="92"
                  ry="92"
                  fill="url(#lampGlow)"
                  animate={
                    motionEnabled
                      ? {
                          opacity: [0.38, 0.54, 0.42, 0.58, 0.4, 0.52, 0.38],
                          scale: [1, 1.05, 0.98, 1.03, 1],
                        }
                      : { opacity: 0.45, scale: 1 }
                  }
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Headlight Beam Cone with soft optical flicker */}
                <motion.polygon
                  points="300,140 700,60 720,240"
                  fill="url(#headlightBeam)"
                  animate={
                    motionEnabled
                      ? {
                          opacity: [0.2, 0.32, 0.24, 0.35, 0.22, 0.28, 0.2],
                        }
                      : { opacity: 0.25 }
                  }
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Windshield (Tall Clear Adventure Screen) */}
                <path
                  d="M 255 100 Q 268 20 274 12 Q 302 14 312 75 L 300 130 Z"
                  fill="#0B0E14"
                  fillOpacity="0.5"
                  stroke="url(#metalChrome)"
                  strokeWidth="2.5"
                />

                {/* Headlight Assembly (Round with Chrome Bezel) */}
                <circle cx="295" cy="140" r="34" fill="#111118" stroke="url(#metalChrome)" strokeWidth="3.5" />
                <circle cx="295" cy="140" r="26" fill="#1C1917" stroke="#FEF08A" strokeWidth="1.5" />
                
                {/* Headlight bulb & warm filament glow with organic flicker */}
                <motion.circle
                  cx="295"
                  cy="140"
                  r="10"
                  fill="#FEF08A"
                  animate={
                    motionEnabled
                      ? {
                          opacity: [0.85, 1.0, 0.88, 0.98, 0.86, 1.0, 0.85],
                        }
                      : { opacity: 0.95 }
                  }
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <line x1="295" y1="118" x2="295" y2="162" stroke="#FEF08A" strokeWidth="1" opacity="0.6" />
                <line x1="273" y1="140" x2="317" y2="140" stroke="#FEF08A" strokeWidth="1" opacity="0.6" />

                {/* Mirrors */}
                <circle cx="215" cy="24" r="16" fill="#181822" stroke="#6B7280" strokeWidth="2.5" />
                <line x1="223" y1="38" x2="248" y2="88" stroke="#4B5563" strokeWidth="3" />
                <circle cx="355" cy="28" r="15" fill="#181822" stroke="#6B7280" strokeWidth="2" />
                <line x1="348" y1="42" x2="320" y2="88" stroke="#4B5563" strokeWidth="2.5" />

                {/* Handlebars & Handguards */}
                <path
                  d="M 195 86 L 265 102 L 325 96 L 365 92"
                  fill="none"
                  stroke="#4B5563"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Fuel Tank (Matte Black Adventure Tank) */}
                <path
                  d="M 255 130 C 235 110, 165 125, 130 175 C 115 198, 135 224, 185 222 L 260 200 Z"
                  fill="#0D0D14"
                  stroke="#374151"
                  strokeWidth="2.5"
                />

                {/* Tank Emblem - ROYAL ENFIELD */}
                <rect x="160" y="155" width="55" height="26" rx="4" fill="#05050A" stroke="#4B5563" strokeWidth="1" />
                <text
                  x="187"
                  y="172"
                  textAnchor="middle"
                  fill="#E5E7EB"
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="'Syne', sans-serif"
                  letterSpacing="0.8"
                >
                  ROYAL ENFIELD
                </text>

                {/* Tank Tubular Crash Protection Cage */}
                <path
                  d="M 260 120 L 290 180 L 250 250 L 195 240 L 225 180 Z"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />

                {/* Rider & Pillion Seat */}
                <path
                  d="M 130 180 C 95 185, 45 208, -15 212 L -65 208 L -55 235 L 35 238 L 125 210 Z"
                  fill="#111118"
                  stroke="#27273A"
                  strokeWidth="2.5"
                />
                <text
                  x="50"
                  y="226"
                  fill="#9CA3AF"
                  fontSize="7.5"
                  fontWeight="600"
                  fontFamily="'JetBrains Mono', monospace"
                  letterSpacing="1"
                >
                  HIMALAYAN
                </text>

                {/* Rear Luggage Carrier Rack */}
                <path
                  d="M -55 202 L -120 202 L -130 232 L -65 240"
                  fill="none"
                  stroke="#4B5563"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line x1="-100" y1="202" x2="-88" y2="236" stroke="#374151" strokeWidth="2.5" />

                {/* LS410 Engine Block with Cooling Fins */}
                <rect x="145" y="235" width="85" height="95" rx="8" fill="#13131D" stroke="#374151" strokeWidth="2" />
                <line x1="145" y1="250" x2="230" y2="250" stroke="#4B5563" strokeWidth="2" />
                <line x1="145" y1="265" x2="230" y2="265" stroke="#4B5563" strokeWidth="2" />
                <line x1="145" y1="280" x2="230" y2="280" stroke="#4B5563" strokeWidth="2" />
                <line x1="145" y1="295" x2="230" y2="295" stroke="#4B5563" strokeWidth="2" />
                {/* Round RE Crankcase Medallion */}
                <circle cx="178" cy="315" r="19" fill="#1E1E2C" stroke="#6B7280" strokeWidth="1.8" />
                <text
                  x="178"
                  y="320"
                  textAnchor="middle"
                  fill="#D1D5DB"
                  fontSize="10"
                  fontWeight="900"
                  fontFamily="'Syne', sans-serif"
                >
                  RE
                </text>

                {/* Upswept Exhaust System with Heat Shield */}
                <path
                  d="M 215 295 Q 225 340 190 350 L 50 350 L -45 320 L -115 285"
                  fill="none"
                  stroke="#272736"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d="M -30 325 L -105 290"
                  fill="none"
                  stroke="#4B5563"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Heavy Duty Aluminum Bash Plate */}
                <path
                  d="M 145 340 L 230 345 L 220 380 L 155 380 Z"
                  fill="#1C1C28"
                  stroke="#6B7280"
                  strokeWidth="2.5"
                />
                {/* Skid plate perforation holes */}
                <circle cx="175" cy="360" r="3.5" fill="#08080C" />
                <circle cx="190" cy="360" r="3.5" fill="#08080C" />
                <circle cx="205" cy="360" r="3.5" fill="#08080C" />

                {/* Front Telescopic Suspension Forks with Rubber Gaiters */}
                <line x1="295" y1="170" x2="350" y2="390" stroke="#4B5563" strokeWidth="7" strokeLinecap="round" />
                {/* Accordion rubber fork gaiters */}
                <line x1="310" y1="225" x2="335" y2="315" stroke="#161622" strokeWidth="12" strokeLinecap="round" />
                {/* Orange Side Reflector on Fork */}
                <rect
                  x="332"
                  y="335"
                  width="7"
                  height="22"
                  rx="2"
                  fill="#F97316"
                  stroke="#EA580C"
                  strokeWidth="1"
                  transform="rotate(15 335 345)"
                />

                {/* Adventure Front Beak & Fender */}
                <path d="M 270 170 L 370 185 L 340 198 L 260 185 Z" fill="#0E0E16" stroke="#374151" strokeWidth="2" />
                <path d="M 290 320 Q 345 310 395 345" fill="none" stroke="#111118" strokeWidth="5" />

                {/* FRONT 21-INCH WIRE-SPOKED ADVENTURE WHEEL */}
                <g transform="translate(365, 395)">
                  {/* Outer Knobby Tire */}
                  <circle cx="0" cy="0" r="102" fill="none" stroke="#0E0E14" strokeWidth="22" />
                  <circle cx="0" cy="0" r="91" fill="none" stroke="#374151" strokeWidth="3" />
                  {/* Wheel Hub */}
                  <circle cx="0" cy="0" r="24" fill="#1C1C28" stroke="#6B7280" strokeWidth="2.5" />
                  {/* Wire Spokes Pattern (24 spokes) */}
                  {Array.from({ length: 24 }).map((_, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1="0"
                      x2={Math.cos((i * 15 * Math.PI) / 180) * 91}
                      y2={Math.sin((i * 15 * Math.PI) / 180) * 91}
                      stroke="#9CA3AF"
                      strokeWidth="1.2"
                      opacity="0.8"
                    />
                  ))}
                  {/* Disc Brake Rotor with Vent Holes */}
                  <circle cx="0" cy="0" r="54" fill="none" stroke="#6B7280" strokeWidth="3" strokeDasharray="8 4" />
                </g>

                {/* REAR 17-INCH WIRE-SPOKED ADVENTURE WHEEL */}
                <g transform="translate(-25, 395)">
                  {/* Outer Knobby Tire */}
                  <circle cx="0" cy="0" r="92" fill="none" stroke="#0E0E14" strokeWidth="22" />
                  <circle cx="0" cy="0" r="81" fill="none" stroke="#374151" strokeWidth="3" />
                  {/* Wheel Hub & Sprocket */}
                  <circle cx="0" cy="0" r="26" fill="#1C1C28" stroke="#6B7280" strokeWidth="2.5" />
                  {/* Wire Spokes Pattern (20 spokes) */}
                  {Array.from({ length: 20 }).map((_, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1="0"
                      x2={Math.cos((i * 18 * Math.PI) / 180) * 81}
                      y2={Math.sin((i * 18 * Math.PI) / 180) * 81}
                      stroke="#9CA3AF"
                      strokeWidth="1.2"
                      opacity="0.8"
                    />
                  ))}
                  {/* Rear Disc Brake */}
                  <circle cx="0" cy="0" r="44" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeDasharray="6 3" />
                </g>
              </g>

              {/* BOTTOM RIGHT TYPOGRAPHY: HIMALAYAN 411 */}
              <text
                x="1840"
                y="740"
                textAnchor="end"
                fontFamily="'Syne', sans-serif"
                fontWeight="800"
                fontSize="46"
                letterSpacing="8"
                fill="#FFFFFF"
              >
                HIMALAYAN 411
              </text>

              {/* Watermark Signature: legacyin */}
              <text
                x="1840"
                y="960"
                textAnchor="end"
                fontFamily="'Playfair Display', 'Brush Script MT', 'Dancing Script', cursive, serif"
                fontStyle="italic"
                fontWeight="400"
                fontSize="38"
                letterSpacing="1"
                fill="#E2E8F0"
                opacity="0.9"
              >
                legacyin
              </text>
            </svg>
          )}
        </motion.div>

        {/* Readability Scrim (Soft Gradient at Top and Bottom so songs, text & controls stay 100% legible) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080D]/90 via-[#08080D]/40 to-[#08080D]/80 pointer-events-none" />
      </div>
    </>
  );
};

