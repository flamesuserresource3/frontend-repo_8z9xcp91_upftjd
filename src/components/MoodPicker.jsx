import { useState } from 'react';

const PRESETS = [
  { key: 'Happy', emoji: '😊' },
  { key: 'Calm', emoji: '🌊' },
  { key: 'Energetic', emoji: '⚡' },
  { key: 'Tense', emoji: '😬' },
  { key: 'Melancholic', emoji: '🌫️' },
];

export default function MoodPicker({ initialMood = 'Calm', onGenerate }) {
  const [selected, setSelected] = useState(initialMood);
  const [custom, setCustom] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const mood = custom.trim() || selected;
    onGenerate(mood);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto -mt-16 w-full max-w-4xl rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur-md ring-1 ring-white/40">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-gray-700">Choose a mood</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelected(p.key)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                  selected === p.key ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{p.emoji}</span>
                <span>{p.key}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-gray-700">Or type how you feel</label>
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Type how you feel..."
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 outline-none ring-0 transition placeholder:text-gray-400 focus:border-red-400"
          />
        </div>

        <div className="md:w-48">
          <button
            type="submit"
            className="w-full rounded-lg bg-red-500 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-red-600 active:translate-y-px"
          >
            Generate My Mood Art
          </button>
        </div>
      </div>
    </form>
  );
}
