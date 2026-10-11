"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AudioContextCtor = typeof AudioContext;

const TARGET_GAIN = 0.14;

/** Slow, open chord (A minor add 9-ish). Frequency in Hz, oscillator shape. */
const VOICES: ReadonlyArray<readonly [number, OscillatorType]> = [
  [110, "sine"],
  [164.81, "triangle"],
  [220, "sine"],
  [277.18, "sine"],
  [329.63, "triangle"],
];

/**
 * Generated ambient pad (no audio file). Browsers only allow audio after a user
 * gesture, so `start()` must be called from a click handler. `toggle()` only flips the
 * preference until the audio graph exists, then it also fades the master gain.
 */
export function useAmbientSound() {
  const [enabled, setEnabled] = useState(true);
  const enabledRef = useRef(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const ramp = useCallback((on: boolean) => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(on ? TARGET_GAIN : 0, ctx.currentTime, 0.9);
  }, []);

  const start = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor: AudioContextCtor | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
      if (!Ctor) return;

      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 650;
      filter.Q.value = 0.6;
      filter.connect(master);

      // A very slow sweep keeps the pad from feeling static.
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.06;
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 260;
      lfo.connect(lfoDepth);
      lfoDepth.connect(filter.frequency);
      lfo.start();

      VOICES.forEach(([frequency, type], i) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = frequency;
        osc.detune.value = (i % 2 ? 1 : -1) * (4 + i * 2);
        const voice = ctx.createGain();
        voice.gain.value = 0.16 - i * 0.02;
        osc.connect(voice);
        voice.connect(filter);
        osc.start();
      });

      ctxRef.current = ctx;
      masterRef.current = master;
    }
    void ctxRef.current?.resume();
    ramp(enabledRef.current);
  }, [ramp]);

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    void ctxRef.current?.resume();
    ramp(next);
  }, [ramp]);

  useEffect(
    () => () => {
      void ctxRef.current?.close();
      ctxRef.current = null;
      masterRef.current = null;
    },
    [],
  );

  return { enabled, start, toggle };
}
