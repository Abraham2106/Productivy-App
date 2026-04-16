import { motion } from 'motion/react';

interface TreeGrowthProps {
  progress: number; // 0-100
}

export default function TreeGrowth({ progress }: TreeGrowthProps) {
  const stage =
    progress < 25 ? 'seed'
    : progress < 50 ? 'sprout'
    : progress < 75 ? 'sapling'
    : 'tree';

  return (
    <div className="w-full h-48 flex flex-col items-center justify-end gap-1">
      <div className="flex items-end justify-center flex-1">
        {stage === 'seed' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2ECC71] to-[#27AE60] shadow-md"
          />
        )}

        {stage === 'sprout' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="flex gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-[#2ECC71] opacity-80" />
              <div className="w-3 h-3 rounded-full bg-[#52C41A] opacity-80" />
            </div>
            <div className="w-[3px] h-10 bg-gradient-to-b from-[#52C41A] to-[#6D4C41] rounded-full" />
          </motion.div>
        )}

        {stage === 'sapling' && (
          <motion.svg
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            width="80" height="100" viewBox="0 0 80 100"
          >
            {/* Trunk */}
            <line x1="40" y1="100" x2="40" y2="55" stroke="#6D4C41" strokeWidth="4" strokeLinecap="round" />
            {/* Canopy circles */}
            <circle cx="40" cy="42" r="25" fill="#2ECC71D9" /> {/* 85% opacity */}
            <circle cx="22" cy="55" r="18" fill="#52C41ABF" /> {/* 75% opacity */}
            <circle cx="58" cy="55" r="18" fill="#52C41ABF" /> {/* 75% opacity */}
          </motion.svg>
        )}

        {stage === 'tree' && (
          <div className="relative">
            <motion.svg
              initial={{ opacity: 0.0, scale: 0.8 }}
              animate={{ opacity: 1.0, scale: 1 }}
              width="120" height="140" viewBox="0 0 120 140"
            >
              {/* Trunk */}
              <line x1="60" y1="140" x2="60" y2="75" stroke="#6D4C41" strokeWidth="6" strokeLinecap="round" />
              {/* Branches */}
              <motion.line
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                x1="60" y1="95" x2="30" y2="75" stroke="#6D4C41" strokeWidth="3" strokeLinecap="round"
              />
              <motion.line
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                x1="60" y1="88" x2="90" y2="70" stroke="#6D4C41" strokeWidth="3" strokeLinecap="round"
              />
              {/* Canopy */}
              <circle cx="60" cy="55" r="35" fill="#2ECC71E1" /> {/* 88% */}
              <circle cx="34" cy="72" r="28" fill="#52C41AC7" /> {/* 78% */}
              <circle cx="86" cy="72" r="28" fill="#52C41AC7" /> {/* 78% */}
              <circle cx="60" cy="30" r="20" fill="#2ECC71B3" /> {/* 70% */}
            </motion.svg>

            {/* Floating particles */}
            {[
              { x: '10%', delay: 0 },
              { x: '80%', delay: 1 },
              { x: '50%', delay: 2 },
            ].map((p, i) => (
              <motion.div
                key={i}
                className="absolute top-4 w-2 h-2 rounded-full bg-[#2ECC71] bg-opacity-70"
                style={{ left: p.x }}
                animate={{ y: [-20, -60], opacity: [0.7, 0.0] }}
                transition={{
                  duration: 3,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ground */}
      <div className="w-full h-3 bg-gradient-to-t from-[#2C3E50] to-transparent rounded-full bg-opacity-20" />
    </div>
  );
}
