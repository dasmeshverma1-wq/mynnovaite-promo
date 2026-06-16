import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import {
  SWIFT,
  DRIFT,
  fadeScaleIn,
  fadeScaleOut,
  blurIn,
  popIn,
} from "./motion";

const RISE = 28;
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ──────────────────────────────────────────────────────────────────────────
// Glossy character — pure SVG so the gradient/gloss render identically every
// frame. Light from the upper-left, deep falloff to the silhouette, white
// specular gloss, two soft white oval eyes. `tint` picks the colour palette:
// "red" for the team leader, "purple" for everyone else.
// ──────────────────────────────────────────────────────────────────────────
export type Tint = "red" | "purple" | "purpleDark";
const PALETTES: Record<Tint, {
  head: [string, string, string, string, string, string];
  body: [string, string, string, string, string];
  sheen: string; rim: string; glow: string;
}> = {
  red: {
    head: ["#ff7e72", "#f74a40", "#e51f23", "#ab1318", "#63090d", "#290305"],
    body: ["#e43a36", "#bf161b", "#860f14", "#3c0508", "#170203"],
    sheen: "#ff5a52", rim: "#ff6a60", glow: "rgba(214,28,30,0.40)",
  },
  // medium purple — the squad members
  purple: {
    head: ["#c98cff", "#9a3aea", "#8420cf", "#56148f", "#2f0a56", "#140426"],
    body: ["#b266ec", "#8421cf", "#5a1488", "#330a5c", "#0f0220"],
    sheen: "#bd84f5", rim: "#ad6cf0", glow: "rgba(150,40,230,0.42)",
  },
  // deepest purple — the team leader / admin
  purpleDark: {
    head: ["#9b5cd8", "#6d1bb4", "#52138a", "#370a60", "#1e063a", "#0b0116"],
    body: ["#8741c4", "#5a169a", "#3b0c6a", "#21063e", "#070113"],
    sheen: "#8f5fce", rim: "#7f50c0", glow: "rgba(108,26,180,0.46)",
  },
};

export const Character: React.FC<{ w: number; blink: number; gid: string; tint?: Tint }> = ({ w, blink, gid, tint = "red" }) => {
  const h = (w * 380) / 300;
  const c = PALETTES[tint];
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 300 380"
      style={{ display: "block", overflow: "visible", filter: `drop-shadow(0 14px 26px rgba(0,0,0,0.55)) drop-shadow(0 0 40px ${c.glow})` }}
    >
      <defs>
        <radialGradient id={`${gid}-head`} cx="39%" cy="27%" r="84%">
          <stop offset="0%"   stopColor={c.head[0]} />
          <stop offset="15%"  stopColor={c.head[1]} />
          <stop offset="35%"  stopColor={c.head[2]} />
          <stop offset="59%"  stopColor={c.head[3]} />
          <stop offset="81%"  stopColor={c.head[4]} />
          <stop offset="100%" stopColor={c.head[5]} />
        </radialGradient>
        <radialGradient id={`${gid}-body`} cx="42%" cy="10%" r="96%">
          <stop offset="0%"   stopColor={c.body[0]} />
          <stop offset="27%"  stopColor={c.body[1]} />
          <stop offset="55%"  stopColor={c.body[2]} />
          <stop offset="82%"  stopColor={c.body[3]} />
          <stop offset="100%" stopColor={c.body[4]} />
        </radialGradient>
        <radialGradient id={`${gid}-eye`} cx="42%" cy="30%" r="82%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="60%"  stopColor="#f6f0f2" />
          <stop offset="100%" stopColor="#dcd0d3" />
        </radialGradient>
        <filter id={`${gid}-soft`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${gid}-soft2`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      {/* torso / body blob */}
      <ellipse cx="150" cy="300" rx="138" ry="125" fill={`url(#${gid}-body)`} />
      {/* body top sheen */}
      <ellipse cx="122" cy="208" rx="62" ry="26" fill={c.sheen} opacity="0.16" filter={`url(#${gid}-soft)`} />

      {/* contact shadow where head meets body */}
      <ellipse cx="150" cy="208" rx="76" ry="20" fill="#120203" opacity="0.55" filter={`url(#${gid}-soft)`} />

      {/* head */}
      <circle cx="150" cy="135" r="98" fill={`url(#${gid}-head)`} />
      {/* broad soft highlight */}
      <ellipse cx="115" cy="84" rx="52" ry="39" fill="#ffffff" opacity="0.30" filter={`url(#${gid}-soft)`} />
      {/* hot specular dot */}
      <ellipse cx="104" cy="72" rx="16" ry="11" fill="#ffffff" opacity="0.74" filter={`url(#${gid}-soft2)`} />
      {/* lower rim bounce light */}
      <ellipse cx="150" cy="214" rx="58" ry="15" fill={c.rim} opacity="0.15" filter={`url(#${gid}-soft)`} />

      {/* eyes (blink scales them vertically around y=120) */}
      <g transform={`translate(0 120) scale(1 ${blink}) translate(0 -120)`}>
        <ellipse cx="128" cy="120" rx="23" ry="37" fill="#ffffff" opacity="0.16" filter={`url(#${gid}-soft)`} />
        <ellipse cx="172" cy="120" rx="23" ry="37" fill="#ffffff" opacity="0.16" filter={`url(#${gid}-soft)`} />
        <rect x="111" y="89" width="34" height="62" rx="17" fill={`url(#${gid}-eye)`} />
        <rect x="155" y="89" width="34" height="62" rx="17" fill={`url(#${gid}-eye)`} />
      </g>
    </svg>
  );
};

// ──────────────────────────────────────────────────────────────────────────
type P = {
  id: string; x: number; y: number; w: number; appear: number; z: number;
  bobAmp: number; swayAmp: number; phase: number; blinkOff: number; tint: Tint;
};

const Person: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // §3 Case A entry — fade in while settling from the foreground (scale 1.05→1).
  const ent  = fadeScaleIn(f, p.appear, fps, 600);
  // Spatial anchoring: rise from below toward a clear destination, cinematic decel.
  const rise = interpolate(f, [p.appear, p.appear + RISE], [880, 0], { ...CLAMP, easing: DRIFT });
  // continuous idle life once settled
  const since = Math.max(0, f - (p.appear + 16));
  const bob   = Math.sin(since * 0.066 + p.phase) * p.bobAmp;
  const sway  = Math.sin(since * 0.043 + p.phase * 1.3) * p.swayAmp;
  // occasional blink
  const bc    = (f + p.blinkOff) % 98;
  const blink = bc < 5 ? interpolate(bc, [0, 2.5, 5], [1, 0.1, 1]) : 1;

  return (
    <div style={{
      position: "absolute", left: p.x, top: p.y, width: p.w,
      transform: `translate(-50%,-50%) translate(${sway}px, ${rise + bob}px) scale(${ent.scale})`,
      opacity: ent.opacity, zIndex: p.z,
    }}>
      <Character w={p.w} blink={blink} gid={p.id} tint={p.tint} />
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Leader (a) is the darkest purple; the rest of the squad are medium purple.
const PEOPLE: P[] = [
  { id: "a", x: 540, y: 1170, w: 360, appear: 8,   z: 3, bobAmp: 14, swayAmp: 7, phase: 0.0, blinkOff: 0,  tint: "purpleDark" },
  { id: "b", x: 662, y: 988,  w: 300, appear: 40,  z: 1, bobAmp: 12, swayAmp: 6, phase: 1.1, blinkOff: 31, tint: "purple" },
  { id: "c", x: 322, y: 1152, w: 328, appear: 122, z: 2, bobAmp: 13, swayAmp: 7, phase: 2.0, blinkOff: 55, tint: "purple" },
  { id: "d", x: 760, y: 1152, w: 328, appear: 152, z: 2, bobAmp: 13, swayAmp: 7, phase: 0.6, blinkOff: 18, tint: "purple" },
  { id: "e", x: 418, y: 1004, w: 292, appear: 182, z: 1, bobAmp: 11, swayAmp: 6, phase: 2.7, blinkOff: 70, tint: "purple" },
];

export const TeamBuild: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // §4 micro-choreography — eyebrow leads, headline follows (Swift entry).
  const eyebrowOp = interpolate(f, [64, 84], [0, 1], { ...CLAMP, easing: SWIFT });
  // §3 Case A crossfade: phase-1 caption ("a team of 2") exits as phase-2 ("up to 5")
  // enters with a staggered overlap (exit @108 → entry @114, ~100ms later).
  const h1In  = fadeScaleIn(f, 72, fps, 600);
  const h1Out = fadeScaleOut(f, 108, fps, 200);
  const h1Op  = h1In.opacity * h1Out.opacity;
  const h1Sc  = h1In.scale * h1Out.scale;
  const h2    = fadeScaleIn(f, 114, fps, 400);

  // §3 Case C — warm glow pools in from soft Gaussian focus at the open.
  const glow = blurIn(f, 0, fps, 800);

  return (
    <AbsoluteFill style={{
      background: "radial-gradient(ellipse 86% 76% at 50% 45%, #4a0a0c 0%, #2b0506 38%, #150203 70%, #060001 100%)",
      fontFamily: "'Inter Tight', sans-serif", overflow: "hidden",
    }}>
      {/* warm glow pooled behind the group — Case C blur-in */}
      <div style={{ position: "absolute", left: "50%", top: "58%", width: 1040, height: 1040, transform: `translate(-50%,-50%) scale(${glow.scale})`, borderRadius: "50%", background: "radial-gradient(circle, rgba(186,22,26,0.50) 0%, rgba(120,10,14,0.16) 46%, transparent 70%)", filter: `blur(${18 + glow.blur}px)`, opacity: glow.opacity, zIndex: 0 }} />

      {/* characters */}
      {PEOPLE.map((p) => <Person key={p.id} {...p} />)}

      {/* vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 92% 82% at 50% 46%, transparent 54%, rgba(0,0,0,0.58) 100%)", pointerEvents: "none", zIndex: 10 }} />

      {/* ── Caption (top third, free of the heads) ── */}
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", zIndex: 20 }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: "9px", color: "rgba(255,210,205,0.72)", textTransform: "uppercase", opacity: eyebrowOp }}>
          Assemble Your Squad
        </p>
        <div style={{ position: "relative", height: 130, marginTop: 18 }}>
          <h1 style={{ position: "absolute", inset: 0, margin: 0, fontSize: 94, fontWeight: 800, color: "#ffffff", letterSpacing: "-2px", opacity: h1Op, transform: `scale(${h1Sc})` }}>
            A team of <span style={{ color: "#ff5a52" }}>2</span>
          </h1>
          <h1 style={{ position: "absolute", inset: 0, margin: 0, fontSize: 94, fontWeight: 800, color: "#ffffff", letterSpacing: "-2px", opacity: h2.opacity, transform: `scale(${h2.scale})` }}>
            …up to <span style={{ color: "#ff5a52" }}>5</span> members
          </h1>
        </div>
      </div>

      {/* ── Member dots (fill as each person joins) ── */}
      <div style={{ position: "absolute", bottom: 150, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22, zIndex: 20 }}>
        {PEOPLE.map((p, i) => {
          // §2 "Dramatic Pop" — each dot snaps in with a Back Out overshoot as its
          // member joins, the impact moment that mirrors the character's arrival.
          const dot   = popIn(f, p.appear + 4, fps, 0.4, 450);
          const fillP = dot.opacity;
          const rgb   = p.tint === "purpleDark" ? "108,26,180" : p.tint === "purple" ? "150,40,230" : "240,70,60";
          return (
            <div key={i} style={{
              width: 20, height: 20, borderRadius: "50%",
              background: `rgba(${rgb},${0.18 + 0.82 * fillP})`,
              border: `1.5px solid rgba(${rgb},0.6)`,
              boxShadow: fillP > 0.5 ? `0 0 16px rgba(${rgb},0.85)` : "none",
              transform: `scale(${dot.scale})`,
            }} />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
