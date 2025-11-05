import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Simple seeded PRNG (Mulberry32)
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return Math.abs(h);
}

function getMoodSpec(mood) {
  const m = (mood || '').toLowerCase();
  const specs = {
    happy: {
      palette: ['#FFD166', '#FF9F1C', '#FFE66D', '#FF7F50', '#FFB703'],
      shapes: ['circle'],
      speed: 0.6,
      bg: '#0B0B0C',
      motion: 'gentle',
    },
    calm: {
      palette: ['#8ECAE6', '#219EBC', '#90E0EF', '#A8DADC', '#48BFE3'],
      shapes: ['wave', 'circle'],
      speed: 0.25,
      bg: '#081018',
      motion: 'slow',
    },
    energetic: {
      palette: ['#EF476F', '#D90429', '#8B5CF6', '#F72585', '#FE4A49'],
      shapes: ['triangle', 'square', 'burst'],
      speed: 1.1,
      bg: '#0B080A',
      motion: 'fast',
    },
    tense: {
      palette: ['#4B5563', '#1F2937', '#F59E0B', '#9CA3AF', '#EF4444'],
      shapes: ['line', 'square'],
      speed: 0.9,
      bg: '#0A0A0B',
      motion: 'twitch',
    },
    melancholic: {
      palette: ['#94A3B8', '#64748B', '#475569', '#1F2937', '#6B7280'],
      shapes: ['ellipse', 'drip'],
      speed: 0.2,
      bg: '#0A0F14',
      motion: 'fade',
    },
  };

  if (specs[m]) return specs[m];

  // Derive a pleasant palette from arbitrary text via HSL rotation
  const hue = (hashStringToSeed(mood) % 360);
  const palette = [0, 20, -20, 40, -40].map((d) => `hsl(${(hue + d + 360) % 360} 70% 60%)`);
  return { palette, shapes: ['circle', 'wave'], speed: 0.5, bg: '#0B0B0C', motion: 'gentle' };
}

const ArtCanvas = forwardRef(function ArtCanvas({ mood, seed, className = '' }, ref) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useImperativeHandle(ref, () => ({
    toDataURL: () => canvasRef.current?.toDataURL('image/png') || '',
    getCanvas: () => canvasRef.current,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = (canvas.width = canvas.clientWidth * window.devicePixelRatio);
    let h = (canvas.height = canvas.clientHeight * window.devicePixelRatio);

    const handleResize = () => {
      w = canvas.width = canvas.clientWidth * window.devicePixelRatio;
      h = canvas.height = canvas.clientHeight * window.devicePixelRatio;
    };
    window.addEventListener('resize', handleResize);

    const spec = getMoodSpec(mood);
    const rng = mulberry32(seed || hashStringToSeed(mood));

    // Generate elements
    const count = Math.floor(60 + rng() * 90);
    const elements = Array.from({ length: count }).map((_, i) => {
      const t = rng();
      const color = spec.palette[Math.floor(rng() * spec.palette.length)];
      return {
        x: rng() * w,
        y: rng() * h,
        s: 10 + rng() * 120,
        v: (rng() - 0.5) * spec.speed * 40,
        a: rng() * Math.PI * 2,
        color,
        shape: spec.shapes[Math.floor(rng() * spec.shapes.length)],
        idx: i,
      };
    });

    let start = 0;

    function draw(time) {
      const t = (time - start) / 1000;
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0b0b0c');
      grad.addColorStop(1, spec.bg);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      elements.forEach((el) => {
        const jitter = (Math.sin(t * (0.5 + Math.abs(el.v) * 0.01) + el.idx) + 1) * 0.5;
        let x = el.x + Math.cos(t * 0.7 + el.idx) * el.v * (spec.motion === 'fast' ? 3 : 1);
        let y = el.y + Math.sin(t * 0.9 + el.idx * 0.7) * el.v * (spec.motion === 'twitch' ? 0.7 : 1);

        ctx.save();
        ctx.globalAlpha = 0.5 + jitter * 0.5;
        ctx.fillStyle = el.color;
        ctx.strokeStyle = el.color;

        switch (el.shape) {
          case 'circle':
            ctx.beginPath();
            ctx.arc(x, y, (el.s * (0.6 + 0.4 * jitter)), 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'ellipse':
            ctx.beginPath();
            ctx.ellipse(x, y, el.s * 0.6, el.s * (0.9 + jitter * 0.4), 0, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'square':
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((el.idx * 0.2 + t * 0.5) % (Math.PI * 2));
            ctx.fillRect(-el.s / 2, -el.s / 2, el.s, el.s);
            ctx.restore();
            break;
          case 'triangle':
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((t + el.idx) * 0.7);
            ctx.beginPath();
            ctx.moveTo(0, -el.s * 0.6);
            ctx.lineTo(el.s * 0.6, el.s * 0.6);
            ctx.lineTo(-el.s * 0.6, el.s * 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            break;
          case 'burst':
            ctx.save();
            ctx.translate(x, y);
            const spikes = 5 + (el.idx % 6);
            const outer = el.s * (0.6 + jitter * 0.5);
            const inner = outer * 0.5;
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
              const r = i % 2 === 0 ? outer : inner;
              const ang = (i / (spikes * 2)) * Math.PI * 2 + t;
              ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            break;
          case 'line':
            ctx.save();
            ctx.globalAlpha = 0.3 + jitter * 0.7;
            ctx.lineWidth = Math.max(1, el.s * 0.05);
            ctx.beginPath();
            ctx.moveTo(x - el.s, y - el.s * 0.5);
            ctx.lineTo(x + el.s, y + el.s * 0.5);
            ctx.stroke();
            ctx.restore();
            break;
          case 'wave':
            ctx.save();
            ctx.globalAlpha = 0.25 + jitter * 0.35;
            ctx.lineWidth = 2 + el.s * 0.03;
            ctx.beginPath();
            const amp = el.s * (0.2 + jitter * 0.3);
            const freq = 0.008 + (el.idx % 5) * 0.002;
            for (let xx = 0; xx <= w; xx += 12) {
              const yy = y + Math.sin(xx * freq + t * 2) * amp;
              if (xx === 0) ctx.moveTo(xx, yy);
              else ctx.lineTo(xx, yy);
            }
            ctx.stroke();
            ctx.restore();
            break;
          case 'drip':
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, y - el.s * 0.5);
            ctx.bezierCurveTo(x - el.s * 0.3, y - el.s * 0.2, x - el.s * 0.2, y + el.s * 0.2, x, y + el.s * 0.7);
            ctx.bezierCurveTo(x + el.s * 0.2, y + el.s * 0.3, x + el.s * 0.3, y - el.s * 0.2, x, y - el.s * 0.5);
            ctx.fill();
            ctx.restore();
            break;
          default:
            break;
        }
        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    start = performance.now();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [mood, seed]);

  return (
    <div className={`relative w-full flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl ${className}`}>
      <canvas ref={canvasRef} className="h-[64vh] w-full sm:h-[72vh]" />
    </div>
  );
});

export default ArtCanvas;
