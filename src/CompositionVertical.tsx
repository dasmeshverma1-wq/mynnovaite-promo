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
import { PUSH_IN, popIn, fadeScaleIn, fadeScaleOut, DRIFT } from "./motion";
import { Character, type Tint } from "./TeamBuild";
import { GradientBackground } from "./components/ui/paper-design-shader-background";
import { ShinyButton } from "./components/ui/shiny-button";
import {
  T,
  LOGO_URL,
  LOGO_W,
  LOGO_H,
  SUBTLE_PX,
  STEPS,
  StepIcon,
  IDEAS,
  PODIUM_CARDS,
  SPEAKERS,
  MockAvatar,
  WIT_SHELLS,
  WIT_DOTS,
  WIT_AVATAR_SIZE,
  waveForProgress,
  WAVE_PERIOD,
} from "./Composition";

// ════════════════════════════════════════════════════════════════════════════
// MOBILE 9:16 (1080×1920) vertical cut of the MynnovAIte promo. Shares all data,
// tokens, components and the exact timeline/timing with the landscape `MyComp`
// (re-declared below — keep in sync) but re-lays-out every scene for a tall frame.
// ════════════════════════════════════════════════════════════════════════════

const EO = PUSH_IN;
const EI = Easing.in(Easing.quad);

// ── Portrait team layout: glossy characters clustered in the lower 2/3 of the frame ──
const VERT_TEAM_PEOPLE: {
  id: string; x: number; y: number; w: number; appear: number; z: number;
  bob: number; sway: number; phase: number; blinkOff: number; tint: Tint;
}[] = [
  // tight pyramid cluster (mirrors the standalone TeamBuild comp), scaled up bigger
  { id: "a", x: 540, y: 1200, w: 430, appear: 8, z: 3, bob: 16, sway: 8, phase: 0.0, blinkOff: 0, tint: "purpleDark" },
  { id: "b", x: 686, y: 990, w: 356, appear: 40, z: 1, bob: 13, sway: 7, phase: 1.1, blinkOff: 31, tint: "purple" },
  { id: "c", x: 300, y: 1176, w: 392, appear: 122, z: 2, bob: 15, sway: 8, phase: 2.0, blinkOff: 55, tint: "purple" },
  { id: "d", x: 780, y: 1176, w: 392, appear: 152, z: 2, bob: 15, sway: 8, phase: 0.6, blinkOff: 18, tint: "purple" },
  { id: "e", x: 398, y: 1010, w: 348, appear: 182, z: 1, bob: 12, sway: 7, phase: 2.7, blinkOff: 70, tint: "purple" },
];

const TeamPersonV: React.FC<{
  p: (typeof VERT_TEAM_PEOPLE)[number];
  tf: number;
  fps: number;
}> = ({ p, tf, fps }) => {
  const ent = fadeScaleIn(tf, p.appear, fps, 600);
  const rise = interpolate(tf, [p.appear, p.appear + 28], [980, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT });
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
      <Character w={p.w} blink={blink} gid={`v-${p.id}`} tint={p.tint} />
    </div>
  );
};

export const MyCompositionVertical: React.FC = () => {
  const frame = useCurrentFrame() * 2; // same 2× virtual clock as the landscape cut
  const { fps } = useVideoConfig();

  // ── Timeline (identical to landscape — keep in sync) ──
  const INTRO = 330;
  const S3 = INTRO;
  const S3_LEN = 264;
  const TEAM = S3 + S3_LEN;
  const TEAM_LEN = 280;
  const S4 = TEAM + TEAM_LEN;
  const S4_LEN = 220;
  const S5 = S4 + S4_LEN;
  const S5_LEN = 256;
  const S_SPEAKERS = S5 + S5_LEN;
  const S_SPEAKERS_LEN = 330;
  const S_WIT = S_SPEAKERS + S_SPEAKERS_LEN;
  const S_WIT_LEN = 230;
  const S6 = S_WIT + S_WIT_LEN;

  // ════════ INTRO ════════
  const introOut = interpolate(frame, [280, 322], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });
  const introExitY = interpolate(frame, [280, 322], [0, -70], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });
  const introGlowOp = interpolate(frame, [4, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });

  const introEnter = (delay: number) => ({
    op: interpolate(frame, [delay, delay + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO }),
    y: interpolate(frame, [delay, delay + 32], [46, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT }),
    x: interpolate(frame, [delay, delay + 32], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT }),
  });
  const enterGot = introEnter(8);
  const enterBulb = introEnter(24);
  const enterIdea = introEnter(40);
  const bulbOp = enterBulb.op;
  const boxOffsetX = interpolate(frame, [98, 152], [-92, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const boxW = interpolate(frame, [98, 152], [96, 392], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const sideFade = interpolate(frame, [96, 132], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });
  const sideShift = interpolate(frame, [96, 140], [0, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });
  const emojiY = interpolate(frame, [104, 148], [0, -88], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const textY = interpolate(frame, [104, 148], [88, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const ctaTxtOp = interpolate(frame, [110, 146], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const curOp = interpolate(frame, [205, 244], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const curX = interpolate(frame, [205, 258], [-150, -30], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const curY = interpolate(frame, [205, 258], [170, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const curClick = interpolate(frame, [260, 268, 280], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const clickDip = interpolate(frame, [260, 268, 280], [1, 0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ripple = interpolate(frame, [264, 308], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const curSettleY = interpolate(frame, [268, 282], [0, 15], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const btnHover = interpolate(frame, [228, 256], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });

  // ── Logo (top, persists across scenes) ──
  const logoOpacity = interpolate(frame, [INTRO - 18, INTRO + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const logoPulse = Math.sin(frame * 0.08) * 0.12 + 0.9;
  const logoTopPx = 120; // ~6% of 1920
  const logoScale = 0.92;

  // ════════ SCENE 3 — How it works (vertical stack) ════════
  const s3f = Math.max(0, frame - S3);
  const s3Active = frame >= S3 && frame < TEAM;
  const s3TitleOp = interpolate(s3f, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const s3TitleY = interpolate(s3f, [0, 22], [28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT });
  const s3Exit = interpolate(s3f, [230, 258], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });
  const S3_STEP_DELAY = [34, 58, 82];

  // ════════ SCENE 3.5 — Build Your Team ════════
  const teamF = Math.max(0, frame - TEAM);
  const teamActive = frame >= TEAM && frame < S4;
  const teamHeadOp = interpolate(teamF, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const teamHeadY = interpolate(teamF, [0, 30], [150, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT });
  const teamHeadScale = interpolate(teamF, [0, 30], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT });
  const tH1In = fadeScaleIn(teamF, 46, fps, 600);
  const tH1Out = fadeScaleOut(teamF, 150, fps, 220);
  const tH1Op = tH1In.opacity * tH1Out.opacity;
  const tH1Sc = tH1In.scale * tH1Out.scale;
  const tH2 = fadeScaleIn(teamF, 162, fps, 520);
  const teamGlow = Math.sin(teamF * 0.06) * 0.12 + 0.9;
  const teamExitOp = interpolate(teamF, [252, 280], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });
  const teamExitY = interpolate(teamF, [252, 280], [0, -90], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });

  // ════════ SCENE 4 — Idea Bazaar (2 scrolling columns) ════════
  const s4f = Math.max(0, frame - S4);
  const s4Active = frame >= S4 && frame < S5;
  const s4Head = [0, 12].map((d) => ({
    op: interpolate(s4f, [6 + d, 26 + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO }),
    y: interpolate(s4f, [6 + d, 30 + d], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT }),
  }));
  const s4ExitOp = interpolate(s4f, [188, 218], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });
  const s4ExitY = interpolate(s4f, [188, 218], [0, -55], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });
  const feedEnterY = interpolate(s4f, [4, 48], [160, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT });
  const feedEnterOp = interpolate(s4f, [4, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const V_COL_SPEEDS = [1.15, 0.85];
  const V_COL_START = [-120, -240];
  const vColY = V_COL_SPEEDS.map((sp, i) => V_COL_START[i] - s4f * sp);

  // ════════ SCENE 5 — Prizes (stacked) ════════
  const s5f = Math.max(0, frame - S5);
  const s5Active = frame >= S5 && frame < S_SPEAKERS;
  const spotOp = interpolate(s5f, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const prizeHeadOp = interpolate(s5f, [6, 28, 206, 236], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const prizeHeadY = interpolate(s5f, [6, 28, 206, 236], [28, 0, 0, -55], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const shimmerX = interpolate((s5f % 150) / 150, [0, 1], [-75, 185]);
  const plusOp = interpolate(s5f, [120, 142], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const plusExitOp = interpolate(s5f, [196, 218], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });

  // ════════ SCENE — Speakers (coverflow, portrait) ════════
  const spkF = Math.max(0, frame - S_SPEAKERS);
  const spkActive = frame >= S_SPEAKERS && frame < S_WIT;
  const spkHeadOp = interpolate(spkF, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const spkHeadY = interpolate(spkF, [0, 22], [28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT });
  const spkEnterOp = interpolate(spkF, [10, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const spkEnterY = interpolate(spkF, [10, 50], [140, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT });
  const spkExitOp = interpolate(spkF, [298, 328], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });
  const spkExitY = interpolate(spkF, [298, 328], [0, -60], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });
  const CAROUSEL_EASE = Easing.bezier(0.65, 0, 0.35, 1);
  const spkSlide1 = interpolate(spkF, [104, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CAROUSEL_EASE });
  const spkSlide2 = interpolate(spkF, [200, 236], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: CAROUSEL_EASE });
  const spkPos = spkSlide1 + spkSlide2;

  // ════════ SCENE — Women in Tech (orbital, portrait) ════════
  const witF = Math.max(0, frame - S_WIT);
  const witActive = frame >= S_WIT && frame < S6;
  const WIT_CX = 540;
  const WIT_CY = 980;
  const witRot = witF * 0.16;
  const witWave = (delay: number, exitDelay: number) => {
    const eP = interpolate(witF, [delay, delay + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT });
    const xP = interpolate(witF, [exitDelay, exitDelay + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });
    return { eP, xP, appear: eP * (1 - xP), rFactor: (0.1 + 0.9 * eP) * (1 + 0.5 * xP) };
  };
  const witLogoOp = interpolate(witF, [30, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const witLogoY = interpolate(witF, [30, 52], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT });
  const witHeadOp = interpolate(witF, [40, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const witHeadY = interpolate(witF, [40, 62], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT });
  const witSubOp = interpolate(witF, [52, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const witCenterExit = interpolate(witF, [200, 228], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });
  const witCenterExitScale = interpolate(witF, [200, 228], [1, 1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EI });

  // ════════ SCENE 6 — CTA (portrait) ════════
  const s6f = Math.max(0, frame - S6);
  const s6Active = frame >= S6;
  const s6GlowOp = interpolate(s6f, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const ctaWord = (start: number) => ({
    op: interpolate(s6f, [start, start + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO }),
    y: interpolate(s6f, [start, start + 24], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT }),
    b: interpolate(s6f, [start, start + 22], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO }),
  });
  const w1 = ctaWord(8);
  const w2 = ctaWord(22);
  const w3 = ctaWord(36);
  const s6Sub1Op = interpolate(s6f, [54, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const s6Sub1Y = interpolate(s6f, [54, 70], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const s6Sub2Op = interpolate(s6f, [72, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const s6Sub2Y = interpolate(s6f, [72, 88], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const btnOp = interpolate(s6f, [94, 118], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const btnY = interpolate(s6f, [94, 116], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const btnPulse = 1 + Math.sin(s6f * 0.018) * 0.01;
  const ctaHover = 0.3 + Math.sin(s6f * 0.024) * 0.1;
  const wRing1 = waveForProgress((s6f % WAVE_PERIOD) / WAVE_PERIOD);
  const wRing2 = waveForProgress(((s6f + 80) % WAVE_PERIOD) / WAVE_PERIOD);
  const wRing3 = waveForProgress(((s6f + 160) % WAVE_PERIOD) / WAVE_PERIOD);
  const s6Close = interpolate(s6f, [176, 208], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
  const finalFade = interpolate(s6f, [186, 208], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });

  return (
    <AbsoluteFill style={{ background: T.paper, overflow: "hidden", fontFamily: T.font }}>
      {/* backdrop */}
      <GradientBackground />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          pointerEvents: "none",
        }}
      />
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

      {/* ══════════ INTRO ══════════ */}
      {frame < INTRO && (
        <div style={{ position: "absolute", inset: 0, opacity: introOut, transform: `translateY(${introExitY}px)` }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 1000,
              height: 760,
              transform: "translate(-50%,-50%)",
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${T.purple}26 0%, ${T.accent}12 38%, transparent 70%)`,
              filter: "blur(40px)",
              opacity: introGlowOp,
              pointerEvents: "none",
            }}
          />
          {/* "Got" */}
          <div
            style={{
              position: "absolute",
              left: `calc(50% + ${boxOffsetX}px - ${boxW / 2 + 16}px)`,
              top: "50%",
              transform: `translate(calc(-100% - ${sideShift}px + ${enterGot.x}px), calc(-50% + ${enterGot.y}px))`,
              opacity: enterGot.op * sideFade,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontFamily: T.display, fontSize: 94, fontWeight: 400, color: "#FFFFFF", letterSpacing: "1px", textTransform: "uppercase" }}>
              Got
            </span>
          </div>
          {/* "an idea?" */}
          <div
            style={{
              position: "absolute",
              left: `calc(50% + ${boxOffsetX}px + ${boxW / 2 + 16}px)`,
              top: "50%",
              transform: `translate(${sideShift + enterIdea.x}px, calc(-50% + ${enterIdea.y}px))`,
              opacity: enterIdea.op * sideFade,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontFamily: T.display,
                fontSize: 94,
                fontWeight: 400,
                background: T.grad,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              an idea?
            </span>
          </div>
          {/* morphing button */}
          <div
            style={{
              position: "absolute",
              left: `calc(50% + ${boxOffsetX}px)`,
              top: "50%",
              transform: `translate(calc(-50% + ${enterBulb.x}px), calc(-50% + ${enterBulb.y}px)) scale(${(0.82 + 0.18 * enterBulb.op) * clickDip})`,
              opacity: enterBulb.op,
            }}
          >
            {ripple > 0 && ripple < 1 && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: boxW,
                  height: 96,
                  borderRadius: 20,
                  transform: `translate(-50%,-50%) scale(${1 + ripple * 0.7})`,
                  border: `2px solid ${T.purple}`,
                  opacity: (1 - ripple) * 0.55,
                  pointerEvents: "none",
                }}
              />
            )}
            <div style={{ width: boxW, height: 96 }}>
              <ShinyButton frame={frame} hover={btnHover} press={curClick} radius={20}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${emojiY}px)`, opacity: bulbOp, zIndex: 2 }}>
                  <Img src={staticFile("icons/idea-bulb.webp")} style={{ width: 54, height: 54, display: "block", objectFit: "contain" }} />
                </div>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${textY}px)`, opacity: ctaTxtOp, zIndex: 2, whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: T.head, fontSize: 30, fontWeight: 700, color: T.paper, letterSpacing: "-0.4px" }}>Create a squad</span>
                </div>
              </ShinyButton>
            </div>
          </div>
          {/* cursor */}
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(${curX}px, ${curY + curSettleY}px)`, opacity: curOp, pointerEvents: "none" }}>
            <div style={{ perspective: 520 }}>
              <svg
                width="92"
                height="92"
                viewBox="0 0 24 24"
                style={{
                  display: "block",
                  filter: "drop-shadow(0 0 2px rgba(30,10,60,0.6)) drop-shadow(0 9px 16px rgba(0,0,0,0.45))",
                  transform: `rotateX(${46 * curClick}deg) rotateZ(${-8 * curClick}deg) translateY(${9 * curClick}px) scale(${1 - 0.12 * curClick})`,
                  transformOrigin: "92% 8%",
                }}
              >
                <path d="M3 11 L22 2 L13 21 L11 13 Z" fill="#B14DFF" stroke="#B14DFF" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ SCENE 3 — How it works (vertical stepper) ══════════ */}
      {s3Active && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2
            style={{
              position: "absolute",
              top: 300,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: T.display,
              fontSize: 112,
              fontWeight: 400,
              color: "#FFFFFF",
              margin: 0,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              lineHeight: 1.05,
              opacity: s3TitleOp * (1 - s3Exit),
              transform: `translateY(${s3TitleY - 80 * s3Exit}px)`,
            }}
          >
            How It{" "}
            <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Works</span>
          </h2>

          <div
            style={{
              position: "absolute",
              top: 560,
              bottom: 120,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0,
            }}
          >
            {STEPS.map((s, i) => {
              const start = S3 + S3_STEP_DELAY[i];
              const tile = popIn(frame, start, fps, 0.5, 450);
              const lf = Math.max(0, frame - start);
              const connDraw = interpolate(lf, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
              const titleOp = interpolate(lf, [14, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
              const titleX = interpolate(lf, [14, 34], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT });
              const isMid = i === 1;
              const exitY = (i === 0 ? -200 : i === 2 ? 200 : -120) * s3Exit;
              const colOp = isMid ? 1 : 1 - s3Exit;
              const iconFade = isMid ? Math.max(0, 1 - s3Exit * 1.7) : 1;
              const titleGrow = isMid ? 1 + 0.14 * s3Exit : 1;
              return (
                <React.Fragment key={i}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 30,
                      opacity: colOp,
                      transform: `translateY(${exitY}px)`,
                    }}
                  >
                    <div
                      style={{
                        width: 188,
                        height: 188,
                        borderRadius: 38,
                        flexShrink: 0,
                        background: `radial-gradient(circle at 50% 32%, rgba(${s.glow},0.26), ${T.paper2} 72%)`,
                        border: `1.5px solid rgba(${s.glow},0.45)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 0 34px rgba(${s.glow},0.3), 0 18px 44px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)`,
                        opacity: tile.opacity * iconFade,
                        transform: `scale(${tile.scale})`,
                      }}
                    >
                      <div style={{ transform: "scale(2.1)" }}>
                        <StepIcon i={i} />
                      </div>
                    </div>
                    <h3
                      style={{
                        fontFamily: T.display,
                        fontSize: 66,
                        fontWeight: 400,
                        color: "#FFFFFF",
                        margin: 0,
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                        lineHeight: 1,
                        width: 420,
                        opacity: titleOp,
                        transform: `translateX(${titleX}px) scale(${titleGrow})`,
                        transformOrigin: "left center",
                      }}
                    >
                      {s.title}
                    </h3>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        width: 0,
                        height: 76,
                        marginLeft: -225,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        opacity: connDraw * (1 - s3Exit),
                        transform: `scaleY(${connDraw})`,
                        transformOrigin: "top center",
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.purple, boxShadow: `0 0 8px ${T.purple}` }} />
                      <span style={{ flex: 1, width: 0, borderLeft: `2px dashed ${T.line3}` }} />
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, boxShadow: `0 0 8px ${T.accent}` }} />
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
        <div style={{ position: "absolute", inset: 0, opacity: teamExitOp, transform: `translateY(${teamExitY}px)` }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "62%",
              width: 1000,
              height: 900,
              transform: "translate(-50%,-50%)",
              borderRadius: "50%",
              background: `radial-gradient(ellipse, rgba(255,63,108,${0.3 * teamGlow}) 0%, rgba(174,51,255,${0.12 * teamGlow}) 46%, transparent 72%)`,
              filter: "blur(30px)",
              zIndex: 1,
            }}
          />
          {VERT_TEAM_PEOPLE.map((p) => (
            <TeamPersonV key={p.id} p={p} tf={teamF} fps={fps} />
          ))}
          <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", zIndex: 20 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: T.display,
                fontSize: 92,
                fontWeight: 400,
                color: "#FFFFFF",
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                lineHeight: 1.05,
                opacity: teamHeadOp,
                transform: `translateY(${teamHeadY}px) scale(${teamHeadScale})`,
              }}
            >
              Build Your{" "}
              <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Team</span>
            </h2>
            <div style={{ position: "relative", height: 52, marginTop: 22 }}>
              <p style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", margin: 0, fontFamily: T.head, fontSize: 34, fontWeight: 500, color: T.mute1, opacity: tH1Op, transform: `scale(${tH1Sc})` }}>
                Start with at least&nbsp;<b style={{ color: "#FFFFFF", fontWeight: 800 }}>2</b>&nbsp;members
              </p>
              <p style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", margin: 0, fontFamily: T.head, fontSize: 34, fontWeight: 500, color: T.mute1, opacity: tH2.opacity, transform: `scale(${tH2.scale})` }}>
                Grow your squad up to&nbsp;<b style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800 }}>5</b>&nbsp;members
              </p>
            </div>
          </div>
          {/* member dots — pop in as each squad member joins */}
          <div style={{ position: "absolute", bottom: 220, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22, zIndex: 20 }}>
            {VERT_TEAM_PEOPLE.map((p, i) => {
              const dot = popIn(teamF, p.appear + 4, fps, 0.4, 450);
              const rgb = p.tint === "purpleDark" ? "108,26,180" : "150,40,230";
              return (
                <div
                  key={i}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: `rgba(${rgb},${0.18 + 0.82 * dot.opacity})`,
                    border: `1.5px solid rgba(${rgb},0.6)`,
                    boxShadow: dot.opacity > 0.5 ? `0 0 16px rgba(${rgb},0.85)` : "none",
                    transform: `scale(${dot.scale})`,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════ SCENE 4 — Idea Bazaar (2 scrolling columns) ══════════ */}
      {s4Active && (
        <div style={{ position: "absolute", inset: 0, opacity: s4ExitOp, transform: `translateY(${s4ExitY}px)`, display: "flex", flexDirection: "column" }}>
          <div style={{ textAlign: "center", paddingTop: 300, flexShrink: 0 }}>
            <h2 style={{ fontFamily: T.display, fontSize: 90, fontWeight: 400, color: "#FFFFFF", margin: "0 0 14px", letterSpacing: "1.2px", textTransform: "uppercase", lineHeight: 1.05, opacity: s4Head[0].op, transform: `translateY(${s4Head[0].y}px)` }}>
              Ideas Worth{" "}
              <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Building</span>
            </h2>
            <p style={{ fontSize: 28, color: T.mute3, margin: 0, opacity: s4Head[1].op, transform: `translateY(${s4Head[1].y}px)` }}>
              Real problems, pitched by Myntra teams.
            </p>
          </div>
          <div
            style={{
              flex: 1,
              marginTop: 40,
              overflow: "hidden",
              position: "relative",
              opacity: feedEnterOp,
              transform: `translateY(${feedEnterY}px)`,
              WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
              maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", gap: 32, height: "100%" }}>
              {[IDEAS.slice(0, 5), IDEAS.slice(5, 9)].map((col, ci) => (
                <div key={ci} style={{ position: "relative", width: 478, overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", flexDirection: "column", gap: 28, transform: `translateY(${vColY[ci]}px)` }}>
                    {[...col, ...col, ...col].map((idea, i) => (
                      <div key={i} style={{ background: "rgba(20,18,36,0.72)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 24, padding: "34px 34px 28px", boxShadow: "0 10px 26px rgba(0,0,0,0.38)" }}>
                        <p style={{ margin: 0, fontSize: 27, lineHeight: 1.5, color: T.mute1, fontWeight: 400 }}>{idea.text}</p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 26 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ color: "#3FD98A", fontSize: 19, lineHeight: 1 }}>▲</span>
                            <span style={{ fontSize: 27, fontWeight: 700, color: "#FFFFFF" }}>{idea.votes}</span>
                          </div>
                          <div style={{ background: "#FFFFFF", borderRadius: 999, padding: "12px 32px", boxShadow: "0 4px 14px rgba(0,0,0,0.3)" }}>
                            <span style={{ fontSize: 21, fontWeight: 700, color: T.paper }}>Upvote</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ SCENE 5 — Prizes (stacked vertically) ══════════ */}
      {s5Active && (
        <>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.22)", opacity: spotOp }} />
          <div style={{ position: "absolute", top: 280, left: 0, right: 0, textAlign: "center", opacity: prizeHeadOp, transform: `translateY(${prizeHeadY}px)` }}>
            <h2 style={{ margin: 0, fontFamily: T.display, fontSize: 92, fontWeight: 400, color: "#FFFFFF", letterSpacing: "1.4px", textTransform: "uppercase", lineHeight: 1.05 }}>
              Prizes &amp;{" "}
              <span style={{ background: T.gradLong, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Rewards</span>
            </h2>
          </div>
          <div style={{ position: "absolute", top: 440, bottom: 90, left: 60, right: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
            {[1, 0, 2].map((ci, pos) => {
              const card = PODIUM_CARDS[ci];
              const isFirst = card.rank === "1ST PLACE";
              const g = `rgba(${card.glowRgb},`;
              const delay = pos * 20;
              const lf = Math.max(0, s5f - delay);
              const rise = interpolate(lf, [0, 42], [140, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: DRIFT });
              const op = interpolate(lf, [0, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EO });
              const glow = interpolate(lf, [0, 22, 72], [0, 1.4, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const hover = Math.sin(s5f * 0.03 + pos * 1.9) * 5;
              const exitStart = 198 + (2 - pos) * 6;
              const exitP = interpolate(s5f, [exitStart, exitStart + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
              return (
                <div key={ci} style={{ width: "100%", maxWidth: isFirst ? 968 : 884, opacity: op * (1 - exitP), transform: `translateY(${rise + hover + exitP * -90}px) scale(${1 - exitP * 0.04})` }}>
                  <div
                    style={{
                      position: "relative",
                      background: T.paper2,
                      border: `1.5px solid ${card.borderColor}`,
                      borderRadius: 26,
                      padding: isFirst ? "36px 44px" : "30px 40px",
                      boxShadow: isFirst
                        ? `0 0 ${70 * glow}px ${g}0.42), 0 0 ${140 * glow}px ${g}0.24), 0 26px 60px rgba(0,0,0,0.8)`
                        : `0 0 ${44 * glow}px ${g}0.22), 0 22px 50px rgba(0,0,0,0.75)`,
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      overflow: "hidden",
                    }}
                  >
                    {isFirst && (
                      <div style={{ position: "absolute", inset: 0, borderRadius: 24, overflow: "hidden", pointerEvents: "none" }}>
                        <div style={{ position: "absolute", top: -60, bottom: -60, width: 140, left: `${shimmerX}%`, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.20) 42%, rgba(255,255,255,0.22) 58%, transparent)", transform: "skewX(-14deg)", filter: "blur(7px)" }} />
                      </div>
                    )}
                    {/* medal */}
                    <Img src={card.medalUrl} style={{ width: isFirst ? 178 : 146, height: isFirst ? 178 : 146, objectFit: "contain", flexShrink: 0, filter: `drop-shadow(0 4px 16px ${g}0.5))` }} />
                    {/* text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: isFirst ? 19 : 16, fontWeight: 700, color: card.rankColor, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 8px", fontFamily: "'JetBrains Mono', monospace" }}>{card.rank}</p>
                      <p style={{ fontSize: 22, color: T.mute2, fontWeight: 500, margin: "0 0 12px" }}>{card.category}</p>
                      <h3 style={{ fontFamily: T.head, fontSize: isFirst ? 66 : 54, fontWeight: 700, color: "#FFFFFF", margin: 0, letterSpacing: "-0.5px", lineHeight: 1 }}>{card.prize}</h3>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ opacity: plusOp * plusExitOp, marginTop: 6, textAlign: "center" }}>
              <p style={{ fontSize: 22, color: T.mute3, margin: 0 }}>
                <span style={{ color: T.accent, fontWeight: 600 }}>Plus: </span>
                Women in Tech Prize &nbsp;·&nbsp; Hall of Fame &nbsp;·&nbsp; Flexi Hours
              </p>
            </div>
          </div>
        </>
      )}

      {/* ══════════ SCENE — Speakers (coverflow) ══════════ */}
      {spkActive && (
        <div style={{ position: "absolute", inset: 0, opacity: spkExitOp, transform: `translateY(${spkExitY}px)` }}>
          <div style={{ position: "absolute", top: "56%", left: "50%", width: 1000, height: 900, borderRadius: "50%", background: `radial-gradient(ellipse, ${T.purple}22 0%, ${T.accent}12 45%, transparent 70%)`, transform: "translate(-50%,-50%)", filter: "blur(70px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 290, left: 0, right: 0, textAlign: "center" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: T.mute4, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 12px", opacity: spkHeadOp, transform: `translateY(${spkHeadY}px)`, fontFamily: "'JetBrains Mono', monospace" }}>Learn from the best</p>
            <h2 style={{ fontFamily: T.display, fontSize: 78, fontWeight: 400, color: "#FFFFFF", margin: 0, letterSpacing: "1.4px", textTransform: "uppercase", lineHeight: 1.05, opacity: spkHeadOp, transform: `translateY(${spkHeadY}px)` }}>
              Speakers &amp;{" "}
              <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mentors.</span>
            </h2>
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: spkEnterOp, perspective: 1600, pointerEvents: "none" }}>
            <div style={{ position: "absolute", left: "50%", top: 1120, transform: `translate(-50%,-50%) translateY(${spkEnterY}px)`, transformStyle: "preserve-3d" }}>
              {SPEAKERS.map((s, i) => {
                const N = SPEAKERS.length;
                let rel = i - spkPos;
                rel = rel - N * Math.round(rel / N);
                const absRel = Math.abs(rel);
                const center = Math.max(0, 1 - absRel);
                const scale = interpolate(absRel, [0, 1], [1, 0.82], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const tx = rel * 496;
                const rotY = interpolate(rel, [-1, 0, 1], [28, 0, -28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const blur = interpolate(absRel, [0, 0.45, 1], [0, 0.6, 6.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const op = interpolate(absRel, [0, 1, 1.5], [1, 0.62, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const idleY = Math.sin(spkF * 0.045 + i * 1.7) * 12 * (0.35 + 0.65 * center);
                const idleRot = Math.sin(spkF * 0.032 + i * 1.1) * 2.4 * center;
                const CW = 548, CH = 800;
                return (
                  <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: CW, height: CH, marginLeft: -CW / 2, marginTop: -CH / 2, borderRadius: 28, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", transform: `translateX(${tx}px) translateY(${idleY}px) scale(${scale}) rotateY(${rotY + idleRot}deg)`, opacity: op, zIndex: Math.round(100 - absRel * 20), filter: `blur(${blur}px)`, boxShadow: `0 40px 80px -22px rgba(0,0,0,0.78), 0 0 ${56 * center}px rgba(174,51,255,${0.4 * center})` }}>
                    <Img src={s.img} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,6,18,0.96) 0%, rgba(8,6,18,0.78) 20%, rgba(8,6,18,0.18) 44%, transparent 62%)" }} />
                    <div style={{ position: "absolute", left: 36, right: 36, bottom: 36 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 10px", fontFamily: "'JetBrains Mono', monospace" }}>Speaker</p>
                      <p style={{ fontFamily: T.head, fontSize: 44, fontWeight: 700, color: "#FFFFFF", margin: "0 0 18px", letterSpacing: "-0.4px", lineHeight: 1 }}>{s.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                          <Img src={s.logo} style={{ width: 32, height: 32, objectFit: "contain" }} />
                        </div>
                        <span style={{ fontSize: 19, color: T.mute1, fontWeight: 500, lineHeight: 1.25 }}>{s.role} · {s.company}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ SCENE — Women in Tech (orbital) ══════════ */}
      {witActive && (
        <div style={{ position: "absolute", inset: 0, transform: "scale(1.2)", transformOrigin: `${WIT_CX}px ${WIT_CY}px` }}>
          <div style={{ position: "absolute", left: WIT_CX, top: WIT_CY, width: 980, height: 980, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,45,120,0.16) 0%, rgba(176,50,255,0.10) 44%, transparent 72%)", transform: "translate(-50%,-50%)", filter: "blur(64px)", pointerEvents: "none" }} />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="witRingV" x1="0" y1="0" x2="1" y2="0.3">
                <stop offset="0%" stopColor="#FF2D78" />
                <stop offset="50%" stopColor="#B032FF" />
                <stop offset="100%" stopColor="#36C5FF" />
              </linearGradient>
            </defs>
            {WIT_SHELLS.map((s, si) => {
              const w = witWave(si * 7, 200 + (WIT_SHELLS.length - 1 - si) * 3);
              return <circle key={si} cx={WIT_CX} cy={WIT_CY} r={s.r * w.rFactor} fill="none" stroke="url(#witRingV)" strokeWidth={1.5} opacity={w.appear * s.fade * 0.6} />;
            })}
          </svg>
          {WIT_DOTS.map((d, i) => {
            const norm = (d.r - WIT_SHELLS[0].r) / (WIT_SHELLS[WIT_SHELLS.length - 1].r - WIT_SHELLS[0].r);
            const w = witWave(norm * 32, 198 + norm * 6);
            const ang = ((d.angle + witRot) * Math.PI) / 180;
            const r = d.r * w.rFactor;
            const x = WIT_CX + r * Math.cos(ang);
            const y = WIT_CY + r * Math.sin(ang);
            const scale = (0.32 + 0.68 * w.eP) * (1 + 0.14 * w.xP);
            const blur = d.blur + w.xP * 16;
            const tba = !d.role;
            return (
              <div key={`av-${i}`} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${scale})`, opacity: d.fade * w.appear, filter: blur ? `blur(${blur}px)` : undefined, zIndex: Math.round(1000 - d.r) }}>
                <MockAvatar size={WIT_AVATAR_SIZE} img={d.img} tint={d.tint} />
                {d.name && (
                  <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translate(-50%, 6px)", whiteSpace: "nowrap", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: tba ? 11 : 12, fontWeight: tba ? 600 : 700, fontStyle: tba ? "italic" : "normal", color: tba ? T.mute3 : "#FFFFFF", textShadow: "0 2px 8px rgba(0,0,0,0.85)" }}>{d.name}</p>
                    {d.role && <p style={{ margin: "2px 0 0", fontSize: 9.5, fontWeight: 500, color: T.mute3, textShadow: "0 2px 8px rgba(0,0,0,0.85)" }}>{d.role}</p>}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ position: "absolute", left: WIT_CX, top: WIT_CY, width: 320, transform: `translate(-50%,-50%) scale(${witCenterExitScale})`, textAlign: "center", opacity: witCenterExit, zIndex: 2000 }}>
            <Img src={staticFile("women-in-tech-logo.png")} style={{ display: "block", width: 250, height: "auto", margin: "0 auto 18px", opacity: witLogoOp, transform: `translateY(${witLogoY}px)`, filter: "drop-shadow(0 0 22px rgba(255,45,120,0.45))" }} />
            <h2 style={{ fontFamily: T.display, fontSize: 40, fontWeight: 400, color: "#FFFFFF", margin: "0 0 10px", letterSpacing: "0.8px", textTransform: "uppercase", lineHeight: 1.06, opacity: witHeadOp, transform: `translateY(${witHeadY}px)` }}>
              Meet the{" "}
              <span style={{ background: "linear-gradient(135deg, #FF2D78, #B032FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Leadership Circle.</span>
            </h2>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.mute2, letterSpacing: "0.3px", opacity: witSubOp }}>Fri, July 17 &nbsp;·&nbsp; Myntra Campus</p>
          </div>
        </div>
      )}

      {/* ══════════ SCENE 6 — CTA ══════════ */}
      {s6Active && (
        <>
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 1000, height: 1000, borderRadius: "50%", background: `radial-gradient(circle,${T.accent}2E 0%,${T.purple}1E 38%,transparent 68%)`, transform: "translate(-50%,-50%)", opacity: s6GlowOp, filter: "blur(50px)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.05 * s6Close})` }}>
            {[
              { word: "Register.", a: w1, grad: false },
              { word: "Ideate.", a: w2, grad: false },
              { word: "Win.", a: w3, grad: true },
            ].map((it, i) => (
              <span key={i} style={{ fontFamily: T.display, fontSize: 138, fontWeight: 400, color: "#FFFFFF", letterSpacing: "1px", textTransform: "uppercase", lineHeight: 1.02, opacity: it.a.op, transform: `translateY(${it.a.y}px)`, filter: it.a.b > 0.05 ? `blur(${it.a.b}px)` : undefined, ...(it.grad ? { background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : {}) }}>{it.word}</span>
            ))}
            <div style={{ opacity: s6Sub1Op, transform: `translateY(${s6Sub1Y}px)`, margin: "38px 0 18px" }}>
              <p style={{ fontFamily: T.head, fontSize: 56, fontWeight: 700, background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0, letterSpacing: "-0.3px", textAlign: "center" }}>MynnovAIte 2026</p>
            </div>
            <div style={{ opacity: s6Sub2Op, transform: `translateY(${s6Sub2Y}px)`, marginBottom: 64 }}>
              <p style={{ fontSize: 29, color: T.mute1, margin: 0, fontWeight: 400, letterSpacing: "0.3px", textAlign: "center" }}>Applications Open Now — Don't Miss Out</p>
            </div>
            <div style={{ opacity: btnOp, transform: `translateY(${btnY}px)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", height: 124 }}>
              {[wRing1, wRing2, wRing3].map((r, i) => (
                <div key={i} style={{ position: "absolute", width: 428, height: 92, borderRadius: 22, background: "rgba(190,130,255,0.11)", transform: `scale(${r.scale})`, opacity: r.opacity * btnOp * 0.6, filter: `blur(${r.blur + 9}px)`, pointerEvents: "none" }} />
              ))}
              <div style={{ position: "relative", zIndex: 2, width: 428, height: 92, transform: `scale(${btnPulse})` }}>
                <ShinyButton frame={frame} hover={ctaHover} radius={22}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: T.paper, letterSpacing: "0.2px", whiteSpace: "nowrap" }}>Register Your Team</span>
                  </div>
                </ShinyButton>
              </div>
            </div>
          </div>
          {finalFade > 0 && <div style={{ position: "absolute", inset: 0, background: "#000000", opacity: finalFade, zIndex: 5000 }} />}
        </>
      )}

      {/* ── Logos (top, on top of everything) ── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: logoTopPx,
          transform: `translate(-50%,-50%) scale(${logoScale})`,
          opacity: logoOpacity,
          zIndex: 3000,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: LOGO_W + 60,
            height: LOGO_H + 26,
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(8,6,18,0.92) 0%, rgba(8,6,18,0.7) 48%, transparent 74%)",
            filter: "blur(14px)",
            pointerEvents: "none",
          }}
        />
        <Img
          src={LOGO_URL}
          width={LOGO_W}
          height={LOGO_H}
          style={{
            display: "block",
            position: "relative",
            filter: `drop-shadow(0 0 ${16 * logoPulse}px rgba(255,63,108,0.6)) drop-shadow(0 0 ${28 * logoPulse}px rgba(174,51,255,0.35))`,
          }}
        />
      </div>
      <div style={{ position: "absolute", right: 26, top: 28, opacity: logoOpacity * 0.9, zIndex: 3000 }}>
        <Img src={staticFile("hackerramp-logo.png")} style={{ display: "block", height: 24, width: "auto" }} />
      </div>
    </AbsoluteFill>
  );
};
