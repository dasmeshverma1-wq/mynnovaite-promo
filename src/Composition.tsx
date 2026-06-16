import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
  Img,
  staticFile,
} from "remotion";
import {
  PUSH_IN,
  POP,
  popIn,
  fadeScaleIn,
  fadeScaleOut,
  DRIFT,
  SWIFT,
} from "./motion";
import { Character, type Tint } from "./TeamBuild";

// ─── Brand easing — the smooth decel is the spec's §3 Case B entry curve
//     (cubic-bezier(0.16,1,0.3,1)), shared from ./motion as the single source. ─
const EO = PUSH_IN;
const EI = Easing.in(Easing.quad);

// ─── Brand design tokens ──────────────────────────────────────────────────────
const T = {
  paper: "#080612", // --paper
  paper2: "#0F0E1C", // --paper-2
  paper3: "#171528", // --paper-3
  accent: "#FF3F6C", // --accent  (Myntra pink-red)
  purple: "#AE33FF", // brand purple
  mute1: "#C8C6E8", // --mute-1
  mute2: "#B0AECE", // --mute-2
  mute3: "#9896C2", // --mute-3
  mute4: "#6A6890", // --mute-4
  line: "rgba(255,255,255,0.05)",
  line2: "rgba(255,255,255,0.09)",
  line3: "rgba(255,255,255,0.15)",
  font: "'Inter Tight', -apple-system, sans-serif",
  head: "'Outfit', 'Inter Tight', sans-serif", // clean, open display font for big headings
  grad: "linear-gradient(95deg, #FF3F6C, #AE33FF)", // primary gradient
  gradLong: "linear-gradient(95deg, #FF3F6C 0%, #AE33FF 50%, #F59E0B 100%)",
};

// ─── Assets ──────────────────────────────────────────────────────────────────
const BASE = "https://dasmeshverma1-wq.github.io/New-Hackerramp";
const LOGO_URL = `${BASE}/images/Frame%20632872.svg`;
// Bundled locally (public/medals) so they load instantly and never flicker
// under motion blur / live playback — remote fetches drop out across sub-frames.
const MEDAL_1_URL = staticFile("medals/medal-1st-place.png");
const MEDAL_2_URL = staticFile("medals/medal-2nd-place.png");
const MEDAL_3_URL = staticFile("medals/medal-3rd-place.png");
const LOGO_W = 480;
const LOGO_H = Math.round(LOGO_W * (158 / 878));

// ─── Background particles ────────────────────────────────────────────────────
const SUBTLE_PX = [
  { x: 7, y: 14, r: 2, c: T.accent, sp: 0.031 },
  { x: 22, y: 72, r: 1.5, c: T.purple, sp: 0.042 },
  { x: 38, y: 30, r: 1, c: T.accent, sp: 0.037 },
  { x: 55, y: 85, r: 2, c: T.purple, sp: 0.028 },
  { x: 70, y: 22, r: 1.5, c: T.accent, sp: 0.044 },
  { x: 82, y: 60, r: 1, c: T.purple, sp: 0.033 },
  { x: 14, y: 50, r: 1.5, c: T.accent, sp: 0.039 },
  { x: 62, y: 45, r: 2, c: T.purple, sp: 0.026 },
  { x: 90, y: 80, r: 1, c: T.accent, sp: 0.048 },
  { x: 46, y: 10, r: 1.5, c: T.purple, sp: 0.035 },
];

// ─── Scene 3 – How It Works (3-step connected stepper, dark theme) ───────────
const STEPS = [
  { title: "Propose an Idea", glow: "174,51,255" }, // purple
  { title: "Build Your Team", glow: "255,63,108" }, // pink
  { title: "Ship It", glow: "200,90,255" }, // light purple
];

// White line icons (one per step) read clean on the dark glass tiles.
const StepIcon: React.FC<{ i: number }> = ({ i }) => {
  const p = {
    fill: "none",
    stroke: "#fff",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg width={46} height={46} viewBox="0 0 24 24">
      {i === 0 && (
        <g {...p}>
          <path d="M9 18h6M10 21h4" />
          <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5.9 1 .95 1.7h5.3c.05-.7.35-1.2.95-1.7A6 6 0 0 0 12 3z" />
        </g>
      )}
      {i === 1 && (
        <g {...p}>
          <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="3.4" />
          <path d="M22 20v-2a4 4 0 0 0-3-3.85M16.5 3.65a4 4 0 0 1 0 7" />
        </g>
      )}
      {i === 2 && (
        <g {...p}>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M15 12v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </g>
      )}
    </svg>
  );
};

// ─── Scene 3.5 – Build Your Team (landscape adaptation of the TeamBuild comp) ─
// Five glossy characters rise into a group; first two = "a team of 2", then three
// more fill in for "up to 5 members". Positions spread outward across 1280×720.
// Leader (ta, centre, first to arrive) is the darkest purple; the rest are medium purple.
const TEAM_PEOPLE: {
  id: string;
  x: number;
  y: number;
  w: number;
  appear: number;
  z: number;
  bob: number;
  sway: number;
  phase: number;
  blinkOff: number;
  tint: Tint;
}[] = [
  {
    id: "ta",
    x: 600,
    y: 470,
    w: 214,
    appear: 8,
    z: 4,
    bob: 10,
    sway: 5,
    phase: 0.0,
    blinkOff: 0,
    tint: "purpleDark",
  },
  {
    id: "tb",
    x: 778,
    y: 480,
    w: 196,
    appear: 40,
    z: 3,
    bob: 9,
    sway: 4,
    phase: 1.1,
    blinkOff: 31,
    tint: "purple",
  },
  {
    id: "tc",
    x: 430,
    y: 488,
    w: 190,
    appear: 150,
    z: 2,
    bob: 9,
    sway: 5,
    phase: 2.0,
    blinkOff: 55,
    tint: "purple",
  },
  {
    id: "td",
    x: 902,
    y: 498,
    w: 178,
    appear: 178,
    z: 1,
    bob: 8,
    sway: 4,
    phase: 0.6,
    blinkOff: 18,
    tint: "purple",
  },
  {
    id: "te",
    x: 300,
    y: 504,
    w: 178,
    appear: 206,
    z: 1,
    bob: 8,
    sway: 5,
    phase: 2.7,
    blinkOff: 70,
    tint: "purple",
  },
];

const TeamPerson: React.FC<{
  p: (typeof TEAM_PEOPLE)[number];
  tf: number;
  fps: number;
}> = ({ p, tf, fps }) => {
  const ent = fadeScaleIn(tf, p.appear, fps, 600); // §3 Case A — settle from foreground
  const rise = interpolate(tf, [p.appear, p.appear + 26], [460, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: DRIFT,
  });
  const since = Math.max(0, tf - (p.appear + 16));
  const bob = Math.sin(since * 0.066 + p.phase) * p.bob;
  const sway = Math.sin(since * 0.043 + p.phase * 1.3) * p.sway;
  const bc = (tf + p.blinkOff) % 98;
  const blink = bc < 5 ? interpolate(bc, [0, 2.5, 5], [1, 0.1, 1]) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: p.x,
        top: p.y,
        width: p.w,
        transform: `translate(-50%,-50%) translate(${sway}px, ${rise + bob}px) scale(${ent.scale})`,
        opacity: ent.opacity,
        zIndex: p.z,
      }}
    >
      <Character w={p.w} blink={blink} gid={`team-${p.id}`} tint={p.tint} />
    </div>
  );
};

// ─── Scene 4 – Idea Bazaar (minimal testimonial-style cards) ─────────────────
const IDEAS = [
  {
    text: "Smart sizing from body measurements and purchase history — fewer returns, happier customers.",
    name: "Kavya Iyer",
    role: "Product",
    img: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    text: "Upload any photo and instantly surface visually similar items, powered by multimodal AI.",
    name: "Aryan Kapoor",
    role: "Engineering",
    img: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    text: "AI-generated outfits that blend your existing wardrobe with fresh Myntra picks.",
    name: "Arjun Sharma",
    role: "Engineering",
    img: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    text: "Real-time warehouse heatmaps that route pickers along the shortest possible path.",
    name: "Priya Patel",
    role: "Design",
    img: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    text: "Time-limited exclusive drops for loyal customers — urgency that actually rewards.",
    name: "Rohit Kumar",
    role: "Product",
    img: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    text: "A fully automated return — pickup scheduled, label printed, courier sent, zero clicks.",
    name: "Neha Singh",
    role: "Data Science",
    img: "https://randomuser.me/api/portraits/women/6.jpg",
  },
  {
    text: "Gift wishlists with AI-curated suggestions for friends and family.",
    name: "Amit Shah",
    role: "Product",
    img: "https://randomuser.me/api/portraits/men/7.jpg",
  },
  {
    text: "Chat-first shopping: describe what you want in plain words, get a curated rail back.",
    name: "Riya Mehta",
    role: "UX",
    img: "https://randomuser.me/api/portraits/women/8.jpg",
  },
  {
    text: "ML sorting that predicts the optimal bin placement for faster same-day dispatch.",
    name: "Dev Anand",
    role: "Engineering",
    img: "https://randomuser.me/api/portraits/men/9.jpg",
  },
];

// ─── Scene 5 – Podium (2nd left · 1st centre · 3rd right) ───────────────────
const PODIUM_CARDS = [
  {
    rank: "2ND PLACE",
    event: "Grand Finale · MynnovAIte 2026",
    prize: "₹1,00,000",
    category: "Swag · Recognition",
    borderColor: "rgba(200,200,200,0.16)",
    rankColor: "#B0AECE",
    glowRgb: "180,180,180",
    medalUrl: MEDAL_2_URL,
    delay: 22,
    lift: -6,
  },
  {
    rank: "1ST PLACE",
    event: "Grand Finale · MynnovAIte 2026",
    prize: "₹1,50,000",
    category: "Mentorship · Production Support",
    borderColor: "rgba(245,158,11,0.55)",
    rankColor: "#F59E0B",
    glowRgb: "245,158,11",
    medalUrl: MEDAL_1_URL,
    delay: 0,
    lift: -42,
  },
  {
    rank: "3RD PLACE",
    event: "Grand Finale · MynnovAIte 2026",
    prize: "₹50,000",
    category: "Design Excellence Badge",
    borderColor: "rgba(205,127,50,0.32)",
    rankColor: "#CD7F32",
    glowRgb: "205,127,50",
    medalUrl: MEDAL_3_URL,
    delay: 44,
    lift: 16,
  },
];

// ─── Wave helper — replicates site's waveFromSource keyframe ─────────────────
const waveForProgress = (p: number) => ({
  scale: interpolate(p, [0, 0.1, 0.55, 0.8, 1.0], [1.0, 1.3, 2.0, 2.7, 3.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
  opacity: interpolate(p, [0, 0.1, 0.55, 0.8, 1.0], [0, 0.88, 0.55, 0.16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
  blur: interpolate(p, [0, 0.1, 0.55, 0.8, 1.0], [0, 0, 1, 4, 9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
});
const WAVE_PERIOD = 150; // long, calm cycle (in 2× frame space) for a smooth pulse

// ─────────────────────────────────────────────────────────────────────────────
export const MyComposition = () => {
  // 2× master clock — the whole timeline plays at double speed ("2× is the new 1×").
  // Every scene/keyframe below is expressed in this doubled frame space.
  const frame = useCurrentFrame() * 2;
  const { fps } = useVideoConfig();

  // ── Scene timeline (virtual 2× frames) — every start derived from the lengths ──
  const INTRO = 330; // "Got an idea?" → "Create a squad" button
  const S3 = INTRO; // How it works
  const S3_LEN = 264;
  const TEAM = S3 + S3_LEN; // Build your squad
  const TEAM_LEN = 280;
  const S4 = TEAM + TEAM_LEN; // Idea Bazaar
  const S4_LEN = 220;
  const S5 = S4 + S4_LEN; // Prizes
  const S5_LEN = 216;
  const S6 = S5 + S5_LEN; // CTA   (total = S6 + 210 = 1520 → 760 real frames)

  // ══════════════════════════════════════════════════════════════════════════
  // INTRO — "Got an idea?" morphs into a "Create a squad" button
  // ══════════════════════════════════════════════════════════════════════════
  // after the click the whole intro slides up & fades — handing momentum to How it works
  const introOut = interpolate(frame, [280, 322], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EI,
  });
  const introExitY = interpolate(frame, [280, 322], [0, -70], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EI,
  });
  const introGlowOp = interpolate(frame, [4, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  // "Got an idea?" appears (centred as a group)
  const gotOp = interpolate(frame, [10, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const gotY = interpolate(frame, [10, 38], [26, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: DRIFT,
  });
  // bulb pill pops in between the words, then expands into the wide button
  const boxW = interpolate(frame, [50, 90, 100, 156], [10, 124, 124, 392], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const boxH = interpolate(frame, [50, 90], [10, 96], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: POP,
  });
  const boxOp = interpolate(frame, [50, 66], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const bulbOp = interpolate(frame, [62, 86], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  // the whole hand-off is synced inside one window (96–158):
  // button slides from group-centre → true screen centre, words clear, emoji & label swap
  const boxOffsetX = interpolate(frame, [96, 152], [-74, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const sideFade = interpolate(frame, [96, 134], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EI,
  });
  const sideShift = interpolate(frame, [96, 138], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EI,
  });
  // emoji and label roll up TOGETHER (slot-reel swap) — no empty gap between them
  const emojiY = interpolate(frame, [106, 150], [0, -84], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  }); // up & out the top
  const textY = interpolate(frame, [106, 150], [84, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  }); // up from below
  const ctaTxtOp = interpolate(frame, [112, 146], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  // cursor flies in from lower-left (tip leads), then tilts + presses on click (~268)
  const curOp = interpolate(frame, [205, 244], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const curX = interpolate(frame, [205, 258], [-172, -38], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const curY = interpolate(frame, [205, 258], [150, 6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const curClick = interpolate(frame, [260, 268, 280], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const clickDip = interpolate(frame, [260, 268, 280], [1, 0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ripple = interpolate(frame, [264, 308], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  // just after the click, a small downward settle before the intro lifts & fades away
  const curSettleY = interpolate(frame, [268, 282], [0, 15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });

  // ── Logo — small at the top; fades in as the intro hands off to the content ──
  const logoOpacity = interpolate(frame, [INTRO - 18, INTRO + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const logoPulseBase = Math.sin(frame * 0.08) * 0.12 + 0.9;
  const s6PulseExtra = frame >= S6 ? Math.sin((frame - S6) * 0.065) * 0.2 : 0;
  const logoPulse = logoPulseBase + s6PulseExtra;
  const logoTP3 = interpolate(frame, [S6, S6 + 25], [0, 5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const logoTopPercent = 9 + logoTP3;
  const logoSc2 = interpolate(frame, [S6, S6 + 25], [0, 0.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const logoScale = 0.72 + logoSc2;

  // ══════════════════════════════════════════
  // SCENE 3 — How it works (longer hold so it reads on a far screen)
  // ══════════════════════════════════════════
  const s3f = Math.max(0, frame - S3);
  const s3Active = frame >= S3;
  const s3TitleOp = interpolate(s3f, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const s3TitleY = interpolate(s3f, [0, 22], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: DRIFT,
  });
  const s3ExitOp = interpolate(s3f, [232, 262], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EI,
  });
  const s3ExitY = interpolate(s3f, [232, 262], [0, -60], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EI,
  });
  const STEP_DELAY = [34, 58, 82]; // 3 steps, staggered after the title settles

  // ══════════════════════════════════════════
  // SCENE 3.5 — Build Your Team
  // "A team of 2" holds → delay → "Up to 5 members" → settle & hold
  // ══════════════════════════════════════════
  const teamF = Math.max(0, frame - TEAM);
  const teamActive = frame >= TEAM && frame < S4;
  const teamEyebrowOp = interpolate(teamF, [30, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SWIFT,
  });
  // §3 Case A crossfade with a real beat between the two captions
  const tH1In = fadeScaleIn(teamF, 46, fps, 600);
  const tH1Out = fadeScaleOut(teamF, 150, fps, 220);
  const tH1Op = tH1In.opacity * tH1Out.opacity;
  const tH1Sc = tH1In.scale * tH1Out.scale;
  const tH2 = fadeScaleIn(teamF, 162, fps, 520);
  const teamGlow = Math.sin(teamF * 0.06) * 0.12 + 0.9;
  const teamExitOp = interpolate(teamF, [252, 280], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EI,
  });
  const teamExitY = interpolate(teamF, [252, 280], [0, -90], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EI,
  });

  // ══════════════════════════════════════════
  // SCENE 4  (750 – 899) — Idea Bazaar
  // ══════════════════════════════════════════
  const s4f = Math.max(0, frame - S4);
  const s4Active = frame >= S4 && frame < S5;
  // Heading: title then subtitle build up (the "Idea Bazaar" badge was removed —
  // it clashed with the logo at the top).
  const s4Head = [0, 12].map((d) => ({
    op: interpolate(s4f, [6 + d, 26 + d], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EO,
    }),
    y: interpolate(s4f, [6 + d, 30 + d], [30, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: DRIFT,
    }),
  }));
  const s4ExitOp = interpolate(s4f, [188, 218], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EI,
  });
  const s4ExitY = interpolate(s4f, [188, 218], [0, -55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EI,
  });
  // The whole feed block rises up into place as it appears; inside, the cards are
  // ALREADY mid-scroll (pre-offset), so cards drift above & below from frame one.
  const feedEnterY = interpolate(s4f, [4, 48], [140, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: DRIFT,
  });
  const feedEnterOp = interpolate(s4f, [4, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const COL_SPEEDS = [1.4, 1.0, 1.25]; // middle column slowest
  const COL_START = [-80, -150, -115]; // pre-scrolled so the feed is mid-flow at the top
  const colY = COL_SPEEDS.map((sp, i) => COL_START[i] - s4f * sp);

  // ══════════════════════════════════════════
  // SCENE 5  (900 – 1109) — Prizes
  // ══════════════════════════════════════════
  const s5f = Math.max(0, frame - S5);
  const s5Active = frame >= S5;
  const spotOp = interpolate(s5f, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  // shimmer sweep across the winning card (loops every 150 frames)
  const shimmerX = interpolate((s5f % 150) / 150, [0, 1], [-75, 185]);
  const plusOp = interpolate(s5f, [96, 116], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const plusY = interpolate(s5f, [96, 116], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  // Prizes leave one-by-one — sides first, the winner lingers and exits last —
  // overlapping the CTA's entrance so there's no dead gap between scenes.
  const EXIT_BASE = 162,
    EXIT_STAGGER = 12; // winner (last) ends at s5f 216 = the S6 boundary
  const EXIT_STEP = [0, 2, 1]; // [2nd-left → first, 1st-centre → last, 3rd-right → middle]
  const plusExitOp = interpolate(s5f, [150, 172], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EI,
  });
  // Final resting tilt per card ([2nd-left, 1st-centre, 3rd-right]): side cards fan
  // toward the centre, the winner keeps a slight turn so the shimmer glances off it.
  const FINAL_TILT = [
    { rx: 5, ry: 13 }, // 2nd — left
    { rx: 6, ry: -7 }, // 1st — centre
    { rx: 5, ry: -13 }, // 3rd — right
  ];
  const podiumAnims = PODIUM_CARDS.map((c, i) => {
    const lf = Math.max(0, s5f - c.delay);
    const settle = interpolate(lf, [0, 42], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: DRIFT,
    });
    const ft = FINAL_TILT[i];
    // staggered, smooth one-by-one exit (slide up + fade away)
    const exitStart = EXIT_BASE + EXIT_STEP[i] * EXIT_STAGGER;
    const exitP = interpolate(s5f, [exitStart, exitStart + 30], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    });
    // gentle idle once settled (and calmed during exit): float + tilt sway add depth/life
    const idle = settle * (1 - exitP);
    const hover = Math.sin(s5f * 0.03 + i * 1.9) * 7 * idle; // vertical float
    const swayX = Math.sin(s5f * 0.026 + i * 1.3 + 0.7) * 1.2 * idle; // pitch wobble
    const swayY = Math.sin(s5f * 0.022 + i * 1.9) * 1.6 * idle; // yaw wobble
    return {
      // softer, longer entry — gentler rise + fade for a smoother appearance
      y: interpolate(lf, [0, 42], [470, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: DRIFT,
      }),
      op: interpolate(lf, [0, 26], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EO,
      }),
      glow: interpolate(lf, [0, 22, 72], [0, 1.4, 0.5], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
      // tilt: leans back + turned harder on entry, eases to the gentle final angle + idle sway
      rotX: interpolate(settle, [0, 1], [ft.rx + 14, ft.rx]) + swayX,
      rotY: interpolate(settle, [0, 1], [ft.ry * 2.1, ft.ry]) + swayY,
      // staggered exit + idle float
      exitOp: 1 - exitP,
      exitY: exitP * -100,
      exitScl: 1 - exitP * 0.04,
      hover,
    };
  });

  // ══════════════════════════════════════════
  // SCENE 6  (1110 – 1319) — CTA
  // ══════════════════════════════════════════
  const s6f = Math.max(0, frame - S6);
  const s6Active = frame >= S6;
  const s6GlowOp = interpolate(s6f, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const w1Op = interpolate(s6f, [14, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const w1Y = interpolate(s6f, [14, 38], [34, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: DRIFT,
  });
  const w2Op = interpolate(s6f, [26, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const w2Y = interpolate(s6f, [26, 50], [34, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: DRIFT,
  });
  const w3Op = interpolate(s6f, [38, 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const w3Y = interpolate(s6f, [38, 62], [34, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: DRIFT,
  });
  const s6Sub1Op = interpolate(s6f, [54, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const s6Sub1Y = interpolate(s6f, [54, 70], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const s6Sub2Op = interpolate(s6f, [72, 88], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const s6Sub2Y = interpolate(s6f, [72, 88], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const finalFade = interpolate(s6f, [185, 207], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EI,
  });
  const btnOp = interpolate(s6f, [94, 118], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const btnY = interpolate(s6f, [94, 116], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EO,
  });
  const btnPulse = 1 + Math.sin(s6f * 0.03) * 0.018; // slow, smooth breathing
  // Wave rings — 3 capsules staggered by 1/3 period, emitting calmly outward.
  const wRing1 = waveForProgress((s6f % WAVE_PERIOD) / WAVE_PERIOD);
  const wRing2 = waveForProgress(((s6f + 50) % WAVE_PERIOD) / WAVE_PERIOD);
  const wRing3 = waveForProgress(((s6f + 100) % WAVE_PERIOD) / WAVE_PERIOD);

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <AbsoluteFill
      style={{ background: T.paper, overflow: "hidden", fontFamily: T.font }}
    >
      {/* ── Dot grid background (site pattern) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />
      {/* ── Mesh gradient blobs (site .hero-mesh) ── */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: T.accent,
          opacity: 0.2,
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: T.purple,
          opacity: 0.18,
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "30%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "#F59E0B",
          opacity: 0.08,
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      {/* ── Subtle floating particles ── */}
      {SUBTLE_PX.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.r * 3,
            height: p.r * 3,
            borderRadius: "50%",
            background: p.c,
            opacity: Math.sin(frame * p.sp + i) * 0.055 + 0.1,
            boxShadow: `0 0 ${p.r * 4}px ${p.c}`,
          }}
        />
      ))}
      {/* ══════════ INTRO — "Got an idea?" → "Create a squad" button ══════════ */}
      {frame < INTRO && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: introOut,
            transform: `translateY(${introExitY}px)`,
          }}
        >
          {/* soft purple ambient glow */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 1120,
              height: 760,
              transform: "translate(-50%,-50%)",
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${T.purple}26 0%, ${T.accent}12 38%, transparent 70%)`,
              filter: "blur(40px)",
              opacity: introGlowOp,
              pointerEvents: "none",
            }}
          />

          {/* "Got" — right edge anchored to the button's left */}
          <div
            style={{
              position: "absolute",
              left: `calc(50% + ${boxOffsetX - boxW / 2 - 16}px)`,
              top: "50%",
              transform: `translate(calc(-100% - ${sideShift}px), calc(-50% + ${gotY}px))`,
              opacity: gotOp * sideFade,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontFamily: T.head,
                fontSize: 76,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-1px",
              }}
            >
              Got
            </span>
          </div>

          {/* "an idea?" — left edge anchored to the button's right */}
          <div
            style={{
              position: "absolute",
              left: `calc(50% + ${boxOffsetX + boxW / 2 + 16}px)`,
              top: "50%",
              transform: `translate(${sideShift}px, calc(-50% + ${gotY}px))`,
              opacity: gotOp * sideFade,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontFamily: T.head,
                fontSize: 76,
                fontWeight: 700,
                background: T.grad,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-1px",
              }}
            >
              an idea?
            </span>
          </div>

          {/* Morphing button — slides from group-centre to true screen centre */}
          <div
            style={{
              position: "absolute",
              left: `calc(50% + ${boxOffsetX}px)`,
              top: "50%",
              transform: `translate(-50%,-50%) scale(${clickDip})`,
            }}
          >
            {/* click ripple */}
            {ripple > 0 && ripple < 1 && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: boxW,
                  height: boxH,
                  borderRadius: 20,
                  transform: `translate(-50%,-50%) scale(${1 + ripple * 0.7})`,
                  border: `2px solid ${T.purple}`,
                  opacity: (1 - ripple) * 0.55,
                  pointerEvents: "none",
                }}
              />
            )}
            {/* button clip — emoji and label swap vertically WITHIN this box */}
            <div
              style={{
                position: "relative",
                width: boxW,
                height: boxH,
                borderRadius: 20,
                background: "#FFFFFF",
                overflow: "hidden",
                boxShadow: `0 12px 32px -6px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 48px ${T.purple}40`,
                opacity: boxOp,
              }}
            >
              {/* emoji — rolls up and out the top */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%,-50%) translateY(${emojiY}px)`,
                  opacity: bulbOp,
                }}
              >
                <Img
                  src={staticFile("icons/idea-bulb.webp")}
                  style={{ width: 58, height: 58, display: "block", objectFit: "contain" }}
                />
              </div>
              {/* label — rolls up from the bottom into place */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%,-50%) translateY(${textY}px)`,
                  opacity: ctaTxtOp,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    fontFamily: T.head,
                    fontSize: 30,
                    fontWeight: 700,
                    color: T.paper,
                    letterSpacing: "-0.4px",
                  }}
                >
                  Create a squad
                </span>
              </div>
            </div>
          </div>

          {/* cursor — purple navigation arrow; flies in, then tilts in 3D space & presses on click */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(${curX}px, ${curY + curSettleY}px)`,
              opacity: curOp,
              pointerEvents: "none",
            }}
          >
            <div style={{ perspective: 520 }}>
              <svg
                width="92"
                height="92"
                viewBox="0 0 24 24"
                style={{
                  display: "block",
                  filter:
                    "drop-shadow(0 0 2px rgba(30,10,60,0.6)) drop-shadow(0 9px 16px rgba(0,0,0,0.45))",
                  transform: `rotateX(${46 * curClick}deg) rotateZ(${-8 * curClick}deg) translateY(${9 * curClick}px) scale(${1 - 0.12 * curClick})`,
                  transformOrigin: "92% 8%",
                }}
              >
                <path
                  d="M3 11 L22 2 L13 21 L11 13 Z"
                  fill="#B14DFF"
                  stroke="#B14DFF"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
      {/* ── Logo — persists across all scenes ── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: `${logoTopPercent}%`,
          transform: `translate(-50%,-50%) scale(${logoScale})`,
          opacity: logoOpacity,
          zIndex: 10,
        }}
      >
        <Img
          src={LOGO_URL}
          width={LOGO_W}
          height={LOGO_H}
          style={{
            display: "block",
            filter: `drop-shadow(0 0 ${16 * logoPulse}px rgba(255,63,108,0.6)) drop-shadow(0 0 ${28 * logoPulse}px rgba(174,51,255,0.35))`,
          }}
        />
      </div>
      {/* ══════════ SCENE 3 — How it works (3-step stepper, dark glass) ══════════ */}
      {s3Active && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: s3ExitOp,
            transform: `translateY(${s3ExitY}px)`,
          }}
        >
          {/* Title */}
          <h2
            style={{
              fontFamily: T.head,
              fontSize: 66,
              fontWeight: 700,
              color: "#FFFFFF",
              margin: "0 0 84px",
              letterSpacing: "-0.5px",
              opacity: s3TitleOp,
              transform: `translateY(${s3TitleY}px)`,
            }}
          >
            How it works?
          </h2>

          {/* Steps + connectors */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            {STEPS.map((s, i) => {
              const start = S3 + STEP_DELAY[i];
              const tile = popIn(frame, start, fps, 0.5, 450); // §2 Dramatic Pop
              const lf = Math.max(0, frame - start);
              const connDraw = interpolate(lf, [8, 30], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EO,
              });
              const titleOp = interpolate(lf, [14, 32], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EO,
              });
              const titleY = interpolate(lf, [14, 34], [18, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: DRIFT,
              });
              return (
                <React.Fragment key={i}>
                  {/* Step column */}
                  <div
                    style={{
                      width: 268,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    {/* dark glass tile — subtle accent glow, white icon */}
                    <div
                      style={{
                        width: 116,
                        height: 116,
                        borderRadius: 26,
                        background: `radial-gradient(circle at 50% 32%, rgba(${s.glow},0.26), ${T.paper2} 72%)`,
                        border: `1.5px solid rgba(${s.glow},0.45)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 0 34px rgba(${s.glow},0.3), 0 18px 44px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)`,
                        opacity: tile.opacity,
                        transform: `scale(${tile.scale})`,
                      }}
                    >
                      <StepIcon i={i} />
                    </div>
                    <h3
                      style={{
                        fontFamily: T.head,
                        fontSize: 34,
                        fontWeight: 600,
                        color: "#FFFFFF",
                        margin: "30px 0 0",
                        letterSpacing: "-0.4px",
                        opacity: titleOp,
                        transform: `translateY(${titleY}px)`,
                      }}
                    >
                      {s.title}
                    </h3>
                  </div>

                  {/* Dashed connector (between tiles only), aligned to tile centre */}
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        width: 120,
                        marginTop: 56,
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        opacity: connDraw,
                        transform: `scaleX(${connDraw})`,
                        transformOrigin: "left center",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: T.purple,
                          flexShrink: 0,
                          boxShadow: `0 0 8px ${T.purple}`,
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          height: 0,
                          borderTop: `2px dashed ${T.line3}`,
                        }}
                      />
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: T.accent,
                          flexShrink: 0,
                          boxShadow: `0 0 8px ${T.accent}`,
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
      {/* ══════════ SCENE 3.5 — Build Your Team ══════════ */}
      {teamActive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: teamExitOp,
            transform: `translateY(${teamExitY}px)`,
          }}
        >
          {/* warm glow pooled behind the group (brand-tinted) */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "66%",
              width: 940,
              height: 600,
              transform: "translate(-50%,-50%)",
              borderRadius: "50%",
              background: `radial-gradient(ellipse, rgba(255,63,108,${0.3 * teamGlow}) 0%, rgba(174,51,255,${0.12 * teamGlow}) 46%, transparent 72%)`,
              filter: "blur(26px)",
              zIndex: 1,
            }}
          />

          {/* characters */}
          {TEAM_PEOPLE.map((p) => (
            <TeamPerson key={p.id} p={p} tf={teamF} fps={fps} />
          ))}

          {/* caption (top, clear of the heads) — brand heading treatment */}
          <div
            style={{
              position: "absolute",
              top: 132,
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 20,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "4px",
                color: T.mute3,
                textTransform: "uppercase",
                opacity: teamEyebrowOp,
              }}
            >
              Assemble Your Squad
            </p>
            <div style={{ position: "relative", height: 80, marginTop: 18 }}>
              <h2
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: 0,
                  fontFamily: T.head,
                  fontSize: 58,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                  opacity: tH1Op,
                  transform: `scale(${tH1Sc})`,
                }}
              >
                At least&nbsp;
                <span
                  style={{
                    background: T.grad,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  2
                </span>
                &nbsp;members
              </h2>
              <h2
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: 0,
                  fontFamily: T.head,
                  fontSize: 58,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                  opacity: tH2.opacity,
                  transform: `scale(${tH2.scale})`,
                }}
              >
                Up to&nbsp;
                <span
                  style={{
                    background: T.grad,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  5
                </span>
                &nbsp;members
              </h2>
            </div>
          </div>

          {/* member dots — Dramatic Pop as each member joins */}
          <div
            style={{
              position: "absolute",
              bottom: 52,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 18,
              zIndex: 20,
            }}
          >
            {TEAM_PEOPLE.map((p, i) => {
              const dot = popIn(teamF, p.appear + 4, fps, 0.4, 450);
              const rgb =
                p.tint === "purpleDark"
                  ? "108,26,180"
                  : p.tint === "purple"
                    ? "150,40,230"
                    : "240,70,60";
              return (
                <div
                  key={i}
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    background: `rgba(${rgb},${0.18 + 0.82 * dot.opacity})`,
                    border: `1.5px solid rgba(${rgb},0.6)`,
                    boxShadow:
                      dot.opacity > 0.5 ? `0 0 14px rgba(${rgb},0.85)` : "none",
                    transform: `scale(${dot.scale})`,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
      {/* ══════════ SCENE 4 — Idea Bazaar (minimal) ══════════ */}
      {s4Active && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: s4ExitOp,
            transform: `translateY(${s4ExitY}px)`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Heading — title then subtitle build up from below (clear of the logo) */}
          <div style={{ textAlign: "center", paddingTop: 132, flexShrink: 0 }}>
            <h2
              style={{
                fontFamily: T.head,
                fontSize: 54,
                fontWeight: 700,
                color: "#FFFFFF",
                margin: "0 0 12px",
                letterSpacing: "-0.5px",
                opacity: s4Head[0].op,
                transform: `translateY(${s4Head[0].y}px)`,
              }}
            >
              Ideas worth building
            </h2>
            <p
              style={{
                fontSize: 18,
                color: T.mute3,
                margin: 0,
                fontWeight: 400,
                opacity: s4Head[1].op,
                transform: `translateY(${s4Head[1].y}px)`,
              }}
            >
              Real problems, pitched by Myntra teams.
            </p>
          </div>

          {/* Feed block — rises into place while the cards inside scroll continuously */}
          <div
            style={{
              flex: 1,
              marginTop: 30,
              overflow: "hidden",
              position: "relative",
              opacity: feedEnterOp,
              transform: `translateY(${feedEnterY}px)`,
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
              maskImage:
                "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 24,
                height: "100%",
              }}
            >
              {[IDEAS.slice(0, 3), IDEAS.slice(3, 6), IDEAS.slice(6, 9)].map(
                (col, ci) => (
                  <div
                    key={ci}
                    style={{
                      position: "relative",
                      width: 336,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 24,
                        transform: `translateY(${colY[ci]}px)`,
                      }}
                    >
                      {[...col, ...col, ...col].map((idea, i) => (
                        <div
                          key={i}
                          style={{
                            background: "rgba(255,255,255,0.035)",
                            border: `1px solid ${T.line2}`,
                            borderRadius: 24,
                            padding: 32,
                            boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: 17,
                              lineHeight: 1.6,
                              color: T.mute1,
                              fontWeight: 400,
                            }}
                          >
                            {idea.text}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              marginTop: 22,
                            }}
                          >
                            <Img
                              src={idea.img}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 15,
                                  fontWeight: 600,
                                  color: "#FFFFFF",
                                  letterSpacing: "-0.2px",
                                  lineHeight: 1.35,
                                }}
                              >
                                {idea.name}
                              </span>
                              <span
                                style={{
                                  fontSize: 14,
                                  color: T.mute3,
                                  lineHeight: 1.35,
                                }}
                              >
                                {idea.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}
      {/* ══════════ SCENE 5 — Prizes ══════════ */}
      {s5Active && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.22)",
              opacity: spotOp,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 700px 380px at 50% -4%,rgba(245,158,11,0.07) 0%,transparent 65%)",
              opacity: spotOp,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 120,
              left: 40,
              right: 40,
              bottom: 22,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 22,
                flex: 1,
                width: "100%",
              }}
            >
              {PODIUM_CARDS.map((card, i) => {
                const {
                  y,
                  op,
                  glow,
                  rotX,
                  rotY,
                  exitOp,
                  exitY,
                  exitScl,
                  hover,
                } = podiumAnims[i];
                const g = `rgba(${card.glowRgb},`;
                const isFirst = card.rank === "1ST PLACE";
                return (
                  // Outer layer — vertical rise + idle hover + staggered exit in clean screen space.
                  <div
                    key={i}
                    style={{
                      width: isFirst ? 426 : 356,
                      flexShrink: 0,
                      opacity: op * exitOp,
                      transform: `translateY(${y + card.lift + exitY + hover}px) scale(${exitScl})`,
                    }}
                  >
                    {/* Inner layer — true 3D tilt; the shimmer glances across this surface. */}
                    <div
                      style={{
                        transform: `perspective(1500px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                        transformStyle: "preserve-3d",
                        background: T.paper2,
                        border: `1.5px solid ${card.borderColor}`,
                        borderRadius: 22,
                        padding: isFirst ? "40px 36px 38px" : "34px 30px",
                        boxShadow: isFirst
                          ? `0 0 ${70 * glow}px ${g}0.42), 0 0 ${140 * glow}px ${g}0.24), 0 30px 74px rgba(0,0,0,0.82)`
                          : `0 0 ${44 * glow}px ${g}0.22), 0 0 ${80 * glow}px ${g}0.11), 0 26px 64px rgba(0,0,0,0.78)`,
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                      }}
                    >
                      {/* Shimmer sweep — winning card only: thick soft gradient band */}
                      {isFirst && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: 22,
                            overflow: "hidden",
                            pointerEvents: "none",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: -60,
                              bottom: -60,
                              width: 124,
                              left: `${shimmerX}%`,
                              background:
                                "linear-gradient(90deg, transparent, rgba(255,255,255,0.20) 42%, rgba(255,255,255,0.22) 58%, transparent)",
                              transform: "skewX(-14deg)",
                              filter: "blur(7px)",
                            }}
                          />
                        </div>
                      )}
                      {/* Medal — overhangs the top-right corner (1.5×) */}
                      <div
                        style={{
                          position: "absolute",
                          top: isFirst ? -38 : -30,
                          right: -12,
                          width: isFirst ? 188 : 158,
                          height: isFirst ? 188 : 158,
                        }}
                      >
                        <Img
                          src={card.medalUrl}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            filter: `drop-shadow(0 4px 16px ${g}0.5))`,
                          }}
                        />
                      </div>
                      {/* Rank + event */}
                      <p
                        style={{
                          fontSize: isFirst ? 13 : 12,
                          fontWeight: 700,
                          color: card.rankColor,
                          letterSpacing: "3px",
                          textTransform: "uppercase",
                          margin: "0 0 7px",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {card.rank}
                      </p>
                      <p
                        style={{
                          fontSize: 14,
                          color: T.mute4,
                          margin: "0 0 34px",
                          fontWeight: 400,
                        }}
                      >
                        {card.event}
                      </p>
                      {/* Category */}
                      <p
                        style={{
                          fontSize: 15,
                          color: T.mute2,
                          fontWeight: 500,
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {card.category}
                      </p>
                      <div
                        style={{
                          height: 1,
                          background: T.line2,
                          margin: "22px 0 16px",
                        }}
                      />
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: T.mute4,
                          letterSpacing: "2.5px",
                          textTransform: "uppercase",
                          margin: "0 0 10px",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        Prize Awarded
                      </p>
                      <h3
                        style={{
                          fontFamily: T.head,
                          fontSize: isFirst ? 52 : 42,
                          fontWeight: 700,
                          color: "#FFFFFF",
                          margin: 0,
                          letterSpacing: "-0.5px",
                          lineHeight: 1,
                        }}
                      >
                        {card.prize}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                opacity: plusOp * plusExitOp,
                transform: `translateY(${plusY}px)`,
                marginTop: 20,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  color: T.mute3,
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                <span style={{ color: T.accent, fontWeight: 600 }}>Plus: </span>
                Women in Tech Prize &nbsp;·&nbsp; Hall of Fame &nbsp;·&nbsp;
                Flexi Hours
              </p>
            </div>
          </div>
        </>
      )}
      {/* ══════════ SCENE 6 — CTA ══════════ */}
      {s6Active && (
        <>
          {/* Mesh glow behind text */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 900,
              height: 900,
              borderRadius: "50%",
              background: `radial-gradient(circle,${T.accent}2E 0%,${T.purple}1E 38%,transparent 68%)`,
              transform: "translate(-50%,-50%)",
              opacity: s6GlowOp,
              filter: "blur(44px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 110,
              gap: 0,
            }}
          >
            {/* Register. Ideate. Win. */}
            <div
              style={{
                display: "flex",
                gap: 18,
                alignItems: "baseline",
                justifyContent: "center",
                marginBottom: 26,
              }}
            >
              {[
                { word: "Register.", op: w1Op, y: w1Y },
                { word: "Ideate.", op: w2Op, y: w2Y },
                { word: "Win.", op: w3Op, y: w3Y },
              ].map((w, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    fontFamily: T.head,
                    fontSize: 88,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    letterSpacing: "-1px",
                    lineHeight: 1,
                    opacity: w.op,
                    transform: `translateY(${w.y}px)`,
                  }}
                >
                  {w.word}
                </span>
              ))}
            </div>

            {/* MynnovAIte 2026 */}
            <div
              style={{
                opacity: s6Sub1Op,
                transform: `translateY(${s6Sub1Y}px)`,
                marginBottom: 14,
              }}
            >
              <p
                style={{
                  fontFamily: T.head,
                  fontSize: 38,
                  fontWeight: 700,
                  background: T.grad,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: 0,
                  letterSpacing: "-0.3px",
                  textAlign: "center",
                }}
              >
                MynnovAIte 2026
              </p>
            </div>

            {/* Applications Open Now */}
            <div
              style={{
                opacity: s6Sub2Op,
                transform: `translateY(${s6Sub2Y}px)`,
                marginBottom: 46,
              }}
            >
              <p
                style={{
                  fontSize: 19,
                  color: T.mute1,
                  margin: 0,
                  fontWeight: 400,
                  letterSpacing: "0.3px",
                  textAlign: "center",
                }}
              >
                Applications Open Now — Don't Miss Out
              </p>
            </div>

            {/* Register Your Team button + waveFromSource rings */}
            <div
              style={{
                opacity: btnOp,
                transform: `translateY(${btnY}px)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                height: 90,
              }}
            >
              {/* Wave — soft light-purple fills only (no outline), kept subtle (−30% opacity) */}
              <div
                style={{
                  position: "absolute",
                  width: 268,
                  height: 62,
                  borderRadius: 999,
                  background: "rgba(190,130,255,0.13)",
                  transform: `scale(${wRing1.scale})`,
                  opacity: wRing1.opacity * btnOp * 0.7,
                  filter: `blur(${wRing1.blur}px)`,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: 268,
                  height: 62,
                  borderRadius: 999,
                  background: "rgba(190,130,255,0.13)",
                  transform: `scale(${wRing2.scale})`,
                  opacity: wRing2.opacity * btnOp * 0.7,
                  filter: `blur(${wRing2.blur}px)`,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: 268,
                  height: 62,
                  borderRadius: 999,
                  background: "rgba(190,130,255,0.13)",
                  transform: `scale(${wRing3.scale})`,
                  opacity: wRing3.opacity * btnOp * 0.7,
                  filter: `blur(${wRing3.blur}px)`,
                  pointerEvents: "none",
                }}
              />
              {/* Button */}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  transform: `scale(${btnPulse})`,
                  background: "#FFFFFF",
                  borderRadius: 999,
                  padding: "17px 56px",
                  boxShadow: `0 4px 18px -4px rgba(255,255,255,0.3), 0 0 40px rgba(174,51,255,0.18)`,
                }}
              >
                <span
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: T.paper,
                    letterSpacing: "0.2px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Register Your Team
                </span>
              </div>
            </div>
          </div>

          {/* Final fade to black */}
          {finalFade > 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#000000",
                opacity: finalFade,
                zIndex: 50,
              }}
            />
          )}
        </>
      )}
    </AbsoluteFill>
  );
};
