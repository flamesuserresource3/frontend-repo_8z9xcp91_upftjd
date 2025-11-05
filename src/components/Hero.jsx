import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative h-[60vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/cEecEwR6Ehj4iT8T/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Gradient overlay for readability, doesn't block interactions */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
        >
          MoodCanvas – See your mood, feel your art
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg"
        >
          Turn feelings into living, abstract visuals you can download and share.
        </motion.p>
      </div>
    </section>
  );
}
