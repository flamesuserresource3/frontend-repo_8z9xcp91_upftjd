import { useEffect, useMemo, useRef, useState } from 'react';
import Hero from './components/Hero';
import MoodPicker from './components/MoodPicker';
import ArtCanvas from './components/ArtCanvas';
import Controls from './components/Controls';

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  const mood = params.get('mood') || 'Calm';
  const seed = parseInt(params.get('seed') || '', 10);
  return { mood, seed: Number.isFinite(seed) ? seed : undefined };
}

function randomSeed() {
  return Math.floor(Math.random() * 2 ** 31);
}

export default function App() {
  const initial = useMemo(parseParams, []);
  const [mood, setMood] = useState(initial.mood);
  const [seed, setSeed] = useState(initial.seed ?? randomSeed());

  const canvasRef = useRef(null);

  const handleGenerate = (nextMood) => {
    setMood(nextMood);
    const newSeed = randomSeed();
    setSeed(newSeed);

    const url = new URL(window.location.href);
    url.searchParams.set('mood', nextMood);
    url.searchParams.set('seed', String(newSeed));
    window.history.replaceState({}, '', url);
  };

  const handleDownload = () => {
    const dataURL = canvasRef.current?.toDataURL?.();
    if (!dataURL) return;
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `MoodCanvas-${mood}-${seed}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  useEffect(() => {
    // Ensure URL params generate the same artwork on revisit
    const url = new URL(window.location.href);
    url.searchParams.set('mood', mood);
    url.searchParams.set('seed', String(seed));
    window.history.replaceState({}, '', url);
  }, [mood, seed]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <Hero />

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <MoodPicker initialMood={mood} onGenerate={handleGenerate} />

        <div className="mt-8">
          <ArtCanvas ref={canvasRef} mood={mood} seed={seed} />
          <Controls currentMood={mood} seed={seed} onDownload={handleDownload} />
        </div>

        <section className="mt-12 grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">How it works</h3>
            <p className="mt-2 text-white/70">Pick or type a mood. We map it to a palette, shapes, and motion. A seeded generator turns that into abstract art.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Deterministic</h3>
            <p className="mt-2 text-white/70">Share links encode your mood and a seed, so anyone opening it will see the same artwork.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Download</h3>
            <p className="mt-2 text-white/70">Export the canvas to PNG in one click and keep your mood piece forever.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-white/60">
        Made with ❤️ by MoodCanvas. Express yourself visually.
      </footer>
    </div>
  );
}
