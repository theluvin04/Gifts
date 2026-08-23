import React from 'react';
import { motion } from 'motion/react';
import { Camera, Disc, Mail, Sparkles, ArrowRight, Gift, RotateCcw } from 'lucide-react';
import { LoveConfig, AppStage } from '../types';
import { sfx } from '../utils/soundEffects';

interface GiftSelectorProps {
  config: LoveConfig;
  onSelectGift: (stage: AppStage) => void;
  onReset: () => void;
}

export const GiftSelector: React.FC<GiftSelectorProps> = ({
  config,
  onSelectGift,
  onReset,
}) => {
  const giftsList = [
    {
      stage: 'gift1' as AppStage,
      title: config.gifts.gift1.title,
      tag: config.gifts.gift1.tag,
      desc: config.gifts.gift1.desc,
      icon: Camera,
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      gradient: 'from-amber-500 to-rose-400',
      emoji: '📸',
    },
    {
      stage: 'gift2' as AppStage,
      title: config.gifts.gift2.title,
      tag: config.gifts.gift2.tag,
      desc: config.gifts.gift2.desc,
      icon: Disc,
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      gradient: 'from-purple-500 to-pink-500',
      emoji: '🎵',
    },
    {
      stage: 'gift3' as AppStage,
      title: config.gifts.gift3.title,
      tag: config.gifts.gift3.tag,
      desc: config.gifts.gift3.desc,
      icon: Mail,
      badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
      gradient: 'from-rose-500 to-red-500',
      emoji: '💌',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center min-h-[85vh]"
      id="gifts-selection-hub"
    >
      {/* Top Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 mb-3 text-xs sm:text-sm font-bold text-rose-600 bg-rose-100/90 rounded-full border border-rose-200 shadow-sm"
      >
        <Gift className="w-4 h-4 text-rose-500" />
        <span>3 Món Quà Đã Được Mở Khóa ✨</span>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading text-center mb-3"
      >
        {config.gifts.headerTitle}
      </motion.h1>

      <motion.p
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm sm:text-base text-slate-600 text-center max-w-md mb-10 font-medium"
      >
        {config.gifts.headerSubtitle}
      </motion.p>

      {/* 3 Gift Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
        {giftsList.map((g, idx) => {
          const IconComp = g.icon;
          return (
            <motion.div
              key={g.stage}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.12 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sfx.playPop();
                onSelectGift(g.stage);
              }}
              className="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-rose-100/80 flex flex-col justify-between cursor-pointer group hover:border-rose-300 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 overflow-hidden"
            >
              {/* Subtle top color gradient bar */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${g.gradient}`} />

              <div>
                {/* Tag and Emoji */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${g.badgeColor}`}>
                    {g.tag}
                  </span>
                  <span className="text-2xl group-hover:scale-125 transition-transform duration-300">
                    {g.emoji}
                  </span>
                </div>

                {/* Icon Circle */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g.gradient} flex items-center justify-center text-white shadow-lg mb-5 group-hover:rotate-6 transition-transform duration-300`}>
                  <IconComp className="w-7 h-7" />
                </div>

                {/* Title and Description */}
                <h3 className="text-xl font-bold text-slate-800 font-heading mb-2 group-hover:text-rose-600 transition-colors">
                  {g.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {g.desc}
                </p>
              </div>

              {/* Action Button Link */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-rose-600 font-bold text-sm">
                <span>Mở quà ngay</span>
                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Replay / Reset Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={onReset}
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 bg-white/60 hover:bg-white/90 rounded-full border border-slate-200 transition shadow-sm cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Chơi lại từ đầu</span>
      </motion.button>
    </motion.div>
  );
};
