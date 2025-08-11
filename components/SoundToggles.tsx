"use client";
import { useEffect, useState } from 'react';
import { useStudioStore } from '@/state/useStudioStore';

export function SoundToggles() {
  const node = useStudioStore((s) => s.nodes.find((n) => n.id === s.selectedNodeId) ?? null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let cleanup: (() => void) | null = null;
    (async () => {
      const Tone = await import('tone');
      if (disposed) return;
      cleanup = createSoundscape(Tone, node?.tags ?? []);
    })();
    return () => {
      disposed = true;
      if (cleanup) cleanup();
    };
  }, [enabled, node?.id, (node?.tags || []).join(',')]);

  return (
    <button
      className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
      onClick={async () => {
        if (!enabled) {
          const Tone = await import('tone');
          await Tone.start();
        }
        setEnabled((e) => !e);
      }}
    >
      {enabled ? 'Sound: On' : 'Sound: Off'}
    </button>
  );
}

function createSoundscape(Tone: typeof import('tone'), tags: string[]) {
  const reverb = new Tone.Reverb({ decay: 6, wet: 0.3 }).toDestination();
  const delay = new Tone.FeedbackDelay({ delayTime: 0.4, feedback: 0.3, wet: 0.2 }).connect(reverb);
  const noise = new Tone.Noise('pink').connect(delay);
  const filter = new Tone.Filter(600, 'lowpass').connect(delay);
  const synth = new Tone.PolySynth(Tone.Synth).connect(filter);

  const padNotes = tags.includes('industrial')
    ? ['C2', 'G2', 'Bb2']
    : tags.includes('cavern')
    ? ['D3', 'A3', 'C4']
    : ['F3', 'C4', 'G4'];
  const interval = new Tone.Loop(() => {
    const note = padNotes[Math.floor(Math.random() * padNotes.length)];
    synth.triggerAttackRelease(note, '2n');
  }, '3n').start(0);

  const noiseGain = new Tone.Gain(tags.includes('rainy') ? 0.15 : 0.05).connect(delay);
  noise.connect(noiseGain);
  noise.start();

  Tone.Transport.start();

  return () => {
    interval.stop();
    noise.stop();
    synth.dispose();
    noise.dispose();
    filter.dispose();
    delay.dispose();
    reverb.dispose();
    Tone.Transport.stop();
  };
}


