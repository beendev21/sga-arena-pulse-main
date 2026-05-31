import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePreferences } from "@/store/preferences";

const D =
  'M99 0 L274 0 L290 9 L297 16 L302 25 L303 35 L300 61 L295 71 L225 70 L220 69 L219 63 L215 58 L202 56 L97 55 L92 57 L111 78 L120 83 L154 87 L229 91 L250 96 L265 103 L274 112 L277 119 L276 152 L264 185 L246 206 L220 219 L128 219 L140 166 L186 163 L193 158 L197 151 L196 142 L178 137 L89 131 L59 127 L42 119 L31 108 L27 98 L27 81 L31 61 L40 38 L62 15 L76 8 L99 1 L99 0 Z M406 0 L575 0 L592 9 L600 17 L604 25 L605 47 L600 69 L598 71 L582 72 L529 71 L521 67 L519 60 L507 57 L393 56 L392 60 L394 63 L408 67 L408 75 L371 214 L365 221 L344 221 L326 218 L316 212 L308 203 L303 192 L303 179 L337 53 L345 36 L359 20 L376 10 L406 1 L406 0 Z M791 0 L847 1 L849 3 L889 165 L900 217 L898 221 L743 219 L763 199 L808 161 L806 144 L773 5 L774 1 L791 1 L791 0 Z M765 12 L768 13 L769 17 L781 81 L781 93 L778 97 L680 220 L606 219 L629 186 L729 56 L765 13 L765 12 Z M590 92 L592 92 L592 96 L558 220 L402 221 L380 220 L378 218 L392 167 L493 165 L499 159 L501 149 L500 141 L453 139 L450 137 L590 93 L590 92 Z M13 150 L82 150 L88 153 L88 161 L92 164 L133 165 L117 219 L113 221 L46 220 L29 218 L18 214 L8 205 L0 190 L0 179 L4 163 L8 154 L13 151 L13 150 Z'

interface Props {
  className?: string
}

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

export function SgaAnimatedLogo({ className = '' }: Props) {
  const uid          = useId().replace(/[^a-zA-Z0-9]/g, "");
  const filterId     = `sgaTracerGlow${uid}`;
  const reducedMotion = useReducedMotion();
  const isLight      = usePreferences((s) => s.bgTheme) === "branco";

  const fill        = isLight ? "#06070a" : "#ffffff";
  const stroke      = isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)";
  const tracerColor = isLight ? "#06070a" : "#ffffff";
  const flashFilter = isLight
    ? [
        "none", "none",
        "brightness(0.1) drop-shadow(0 0 20px rgba(0,0,0,0.6))",
        "brightness(0.3) drop-shadow(0 0 8px rgba(0,0,0,0.4))",
        "brightness(0.7)",
        "none",
      ]
    : [
        "none", "none",
        "brightness(5) drop-shadow(0 0 30px #fff)",
        "brightness(2) drop-shadow(0 0 12px rgba(200,230,255,0.8))",
        "brightness(1.1) drop-shadow(0 0 5px rgba(200,230,255,0.3))",
        "none",
      ];

  if (reducedMotion) {
    return (
      <div className={`inline-block ${className}`} style={{ lineHeight: 0 }}>
        <svg className="sga-logo-svg" viewBox="0 0 900 221" role="img" aria-label="SGA logo">
          <path d={D} fillRule="evenodd" fill={fill} />
        </svg>
      </div>
    );
  }

  return (
    <div className={`sga-logo-wrap inline-block ${className}`} style={{ lineHeight: 0 }}>
      <div className="sga-logo-glitch" style={{ height: '100%' }}>
        <svg
          className="sga-logo-svg"
          viewBox="0 0 900 221"
          role="img"
          aria-label="SGA logo"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Trail — outline que desenha */}
          <motion.path
            d={D}
            fillRule="evenodd"
            fill="none"
            stroke={stroke}
            strokeWidth={3}
            initial={{ pathLength: 0, opacity: 1 }}
            animate={{ pathLength: 1, opacity: [1, 1, 0] }}
            transition={{
              pathLength: { duration: 3.8, ease: EASE },
              opacity:    { duration: 0.3, delay: 3.8, ease: "easeOut" },
            }}
          />

          {/* Tracer — ponto que percorre o caminho */}
          <motion.path
            d={D}
            fillRule="evenodd"
            fill="none"
            stroke={tracerColor}
            strokeWidth={5}
            initial={{ pathLength: 0, pathOffset: 0, opacity: 1 }}
            animate={{ pathLength: 0.06, pathOffset: 1, opacity: [1, 1, 0] }}
            transition={{
              pathLength: { duration: 0 },
              pathOffset: { duration: 3.8, ease: EASE },
              opacity:    { duration: 0.25, delay: 3.8 },
            }}
            style={isLight ? undefined : { filter: `url(#${filterId})` }}
          />

          {/* Fill — aparece com flash */}
          <motion.path
            d={D}
            fillRule="evenodd"
            fill={fill}
            initial={{ opacity: 0, filter: "none" }}
            animate={{ opacity: [0, 0, 1, 1, 1, 1], filter: flashFilter }}
            transition={{ duration: 2.5, delay: 1.8, times: [0, 0, 0.2, 0.45, 0.7, 1], ease: "easeOut" }}
          />
        </svg>
      </div>
    </div>
  );
}
