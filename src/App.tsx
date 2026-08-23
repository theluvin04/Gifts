import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { loveConfig as initialConfig } from './config/loveConfig';
import { AppStage, LoveConfig } from './types';
import { IntroScreen } from './components/IntroScreen';
import { ProposalScreen } from './components/ProposalScreen';
import { GiftSelector } from './components/GiftSelector';
import { PolaroidGallery } from './components/gifts/PolaroidGallery';
import { VinylMusicPlayer } from './components/gifts/VinylMusicPlayer';
import { LoveLetter } from './components/gifts/LoveLetter';
import { AudioPlayer } from './components/AudioPlayer';
import { Heart, Settings, Sparkles, X, RotateCcw } from 'lucide-react';
import { sfx } from './utils/soundEffects';

export default function App() {
  const [stage, setStage] = useState<AppStage>('intro');
  const [config, setConfig] = useState<LoveConfig>(initialConfig);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Editable form state for live tweaking
  const [editSender, setEditSender] = useState(config.couple.senderName);
  const [editReceiver, setEditReceiver] = useState(config.couple.receiverName);
  const [editQuestion, setEditQuestion] = useState(config.proposal.question);
  const [editYesBtn, setEditYesBtn] = useState(config.proposal.yesBtnText);

  const handleSaveConfig = () => {
    setConfig((prev) => ({
      ...prev,
      couple: {
        ...prev.couple,
        senderName: editSender,
        receiverName: editReceiver,
      },
      proposal: {
        ...prev.proposal,
        question: editQuestion,
        yesBtnText: editYesBtn,
      },
      gifts: {
        ...prev.gifts,
        gift3: {
          ...prev.gifts.gift3,
          letter: {
            ...prev.gifts.gift3.letter,
            salutation: `Gửi ${editReceiver},`,
            signature: editSender,
          },
        },
      },
    }));
    sfx.playSuccessChime();
    setIsConfigOpen(false);
  };

  const handleReset = () => {
    sfx.playPop();
    setStage('intro');
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-pink-100 text-slate-800 overflow-x-hidden flex flex-col justify-between selection:bg-pink-300 selection:text-pink-900">
      {/* Floating Ambient Audio Player */}
      <AudioPlayer
        musicUrl={config.audio.backgroundMusicUrl}
        musicTitle={config.audio.backgroundMusicTitle}
      />

      {/* Quick Config Button on Top Left */}
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsConfigOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/80 hover:bg-white text-rose-700 rounded-full text-xs font-bold shadow-sm border border-rose-200 backdrop-blur-md transition cursor-pointer"
          title="Tùy chỉnh tên & câu hỏi nhanh"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Chỉnh sửa nhanh</span>
        </button>
      </div>

      {/* Main Interactive Stage Routing */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        <AnimatePresence mode="wait">
          {stage === 'intro' && (
            <IntroScreen
              key="intro-stage"
              config={config}
              onOpen={() => setStage('proposal')}
            />
          )}

          {stage === 'proposal' && (
            <ProposalScreen
              key="proposal-stage"
              config={config}
              onYesAccepted={() => setStage('gifts')}
            />
          )}

          {stage === 'gifts' && (
            <GiftSelector
              key="gifts-stage"
              config={config}
              onSelectGift={(selectedStage) => setStage(selectedStage)}
              onReset={handleReset}
            />
          )}

          {stage === 'gift1' && (
            <PolaroidGallery
              key="gift1-stage"
              photos={config.gifts.gift1.photos}
              onBack={() => setStage('gifts')}
            />
          )}

          {stage === 'gift2' && (
            <VinylMusicPlayer
              key="gift2-stage"
              playlist={config.gifts.gift2.playlist}
              onBack={() => setStage('gifts')}
            />
          )}

          {stage === 'gift3' && (
            <LoveLetter
              key="gift3-stage"
              letterData={config.gifts.gift3.letter}
              senderName={config.couple.senderName}
              receiverName={config.couple.receiverName}
              onBack={() => setStage('gifts')}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-rose-800/60 font-medium">
        <p className="flex items-center justify-center gap-1">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          <span>for someone special</span>
        </p>
      </footer>

      {/* Live Config Customizer Modal */}
      <AnimatePresence>
        {isConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border-2 border-rose-200"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <h3 className="font-bold text-slate-800 text-base">Tùy Chỉnh Nhanh Website</h3>
                </div>
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Tất cả hình ảnh, GIF, bài hát, và nội dung thư tình chi tiết đều nằm trong file <code className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-mono font-bold">src/config/loveConfig.ts</code>.
              </p>

              <div className="space-y-3 mb-6 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên người nhận (Bạn gái / Crush / Người thương):
                  </label>
                  <input
                    type="text"
                    value={editReceiver}
                    onChange={(e) => setEditReceiver(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    placeholder="VD: Em bé của anh"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên người gửi:
                  </label>
                  <input
                    type="text"
                    value={editSender}
                    onChange={(e) => setEditSender(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    placeholder="VD: Anh nè"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Câu hỏi chính:
                  </label>
                  <input
                    type="text"
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    placeholder="VD: Do you love me? ❤️"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nội dung nút YES:
                  </label>
                  <input
                    type="text"
                    value={editYesBtn}
                    onChange={(e) => setEditYesBtn(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    placeholder="VD: YES! Yêu nhiều lắmmm 💕"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditSender(initialConfig.couple.senderName);
                    setEditReceiver(initialConfig.couple.receiverName);
                    setEditQuestion(initialConfig.proposal.question);
                    setEditYesBtn(initialConfig.proposal.yesBtnText);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Mặc định
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-500/30 transition cursor-pointer"
                >
                  Lưu thay đổi ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
