import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

// Key-moment sound design (real composition frames — the audio layer is unaffected
// by the 2× virtual frame space the visuals use internally).
type Hit = { from: number; src: string; volume: number; label: string };

const HITS: Hit[] = [
  { from: 131, src: "sfx/mouse-click.wav", volume: 0.6,  label: "cursor click — Create a squad" },
  { from: 140, src: "sfx/whoosh.wav",      volume: 0.5,  label: "intro lifts away" },
  { from: 298, src: "sfx/whoosh.wav",      volume: 0.5,  label: "squad rises" },
  { from: 547, src: "sfx/whoosh.wav",      volume: 0.55, label: "prize cards rise" },
  { from: 560, src: "sfx/ding.wav",        volume: 0.5,  label: "winner card lands" },
  { from: 660, src: "sfx/whip.wav",        volume: 0.5,  label: "Register stamps in" },
];

export const SfxLayer: React.FC = () => (
  <>
    {HITS.map((h, i) => (
      <Sequence key={i} from={h.from} name={`sfx: ${h.label}`}>
        <Audio src={staticFile(h.src)} volume={h.volume} />
      </Sequence>
    ))}
  </>
);
