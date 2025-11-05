import { useState } from 'react';

export default function Controls({ currentMood, seed, onDownload, onShare }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const link = `${window.location.origin}${window.location.pathname}?mood=${encodeURIComponent(currentMood)}&seed=${seed}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      onShare?.(link);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // fallback: open prompt
      prompt('Copy your shareable link:', link); // eslint-disable-line no-alert
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-white/70">
        Seed: <span className="font-mono text-white">{seed}</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onDownload}
          className="rounded-lg bg-white/90 px-4 py-2 font-medium text-gray-900 shadow-sm transition hover:bg-white"
        >
          Download as PNG
        </button>
        <button
          onClick={share}
          className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-red-600"
        >
          {copied ? 'Link Copied!' : 'Share Link'}
        </button>
      </div>
    </div>
  );
}
